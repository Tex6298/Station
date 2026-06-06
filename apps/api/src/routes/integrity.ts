import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/require-auth";
import { getSupabaseAdmin } from "../lib/supabase";
import {
  generateClusterSummary,
  generateFollowupQuestion,
  generateIntegrityOutputs,
  getAnchorQuestion,
  getNextAction,
  loadOwnedPersona,
  selectClusters,
  writeAcceptedOutput,
  type IntegrityCluster,
  type IntegritySessionType,
} from "../services/integrity-session.service";

const clusterSchema = z.enum(["identity", "relationship", "tone", "continuity", "boundaries", "themes"]);

const startSchema = z.object({
  personaId: z.string().uuid(),
  sessionType: z.enum(["initial", "periodic", "migration", "pre_publication", "manual"]).default("periodic"),
  clusters: z.array(clusterSchema).optional(),
});

const answerSchema = z.object({
  sessionId: z.string().uuid(),
  turnId: z.string().uuid(),
  answer: z.string().min(1).max(12000),
});

const summarySchema = z.object({
  sessionId: z.string().uuid(),
  cluster: clusterSchema,
  confirmed: z.boolean().default(true),
  correction: z.string().max(12000).optional(),
});

const outputReviewSchema = z.object({
  action: z.enum(["accept", "reject", "edit"]),
  editedContent: z.string().max(2000).optional(),
});

export const integrityRouter = Router();
integrityRouter.use(requireAuth);

integrityRouter.post("/start", async (req, res) => {
  const parsed = startSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const ownerUserId = req.user!.id;
  const persona = await loadOwnedPersona(parsed.data.personaId, ownerUserId);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const sessionType = parsed.data.sessionType as IntegritySessionType;
  const clusters = await selectClusters({
    ownerUserId,
    personaId: persona.id,
    sessionType,
    manualClusters: parsed.data.clusters as IntegrityCluster[] | undefined,
  });
  const firstCluster = clusters[0];
  const question = await getAnchorQuestion(firstCluster, sessionType);

  const sb = getSupabaseAdmin();
  const { data: session, error: sessionError } = await (sb as any)
    .from("integrity_sessions")
    .insert({
      owner_user_id: ownerUserId,
      persona_id: persona.id,
      session_type: sessionType,
      status: "in_progress",
      clusters_planned: clusters,
      clusters_covered: [],
    })
    .select("*")
    .single();

  if (sessionError || !session) return res.status(500).json({ error: sessionError?.message ?? "Could not start session." });

  const { data: turn, error: turnError } = await (sb as any)
    .from("integrity_session_turns")
    .insert({
      session_id: session.id,
      owner_user_id: ownerUserId,
      persona_id: persona.id,
      cluster: firstCluster,
      question,
      turn_type: "anchor",
    })
    .select("*")
    .single();

  if (turnError || !turn) return res.status(500).json({ error: turnError?.message ?? "Could not create first turn." });

  return res.status(201).json({
    sessionId: session.id,
    question,
    cluster: firstCluster,
    turnId: turn.id,
    clustersPlanned: clusters,
    clusterIndex: 0,
  });
});

integrityRouter.post("/answer", async (req, res) => {
  const parsed = answerSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const ownerUserId = req.user!.id;

  const { data: session } = await (sb as any)
    .from("integrity_sessions")
    .select("*")
    .eq("id", parsed.data.sessionId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (!session || session.status !== "in_progress") return res.status(404).json({ error: "Active integrity session not found." });

  const { data: turn } = await (sb as any)
    .from("integrity_session_turns")
    .update({ answer: parsed.data.answer })
    .eq("id", parsed.data.turnId)
    .eq("session_id", session.id)
    .eq("owner_user_id", ownerUserId)
    .select("*")
    .single();

  if (!turn) return res.status(404).json({ error: "Integrity turn not found." });

  const { data: turns } = await (sb as any)
    .from("integrity_session_turns")
    .select("*")
    .eq("session_id", session.id)
    .eq("cluster", turn.cluster)
    .order("created_at", { ascending: true });

  const currentTurns = turns ?? [];
  const next = getNextAction(session, currentTurns);

  if (next.action === "followup") {
    const anchorQuestion = currentTurns.find((item: any) => item.turn_type === "anchor")?.question ?? turn.question;
    const question = await generateFollowupQuestion({
      ownerUserId,
      cluster: turn.cluster,
      anchorQuestion,
      userAnswer: parsed.data.answer,
      usedQuestions: currentTurns.map((item: any) => item.question),
    });
    const { data: nextTurn, error } = await (sb as any)
      .from("integrity_session_turns")
      .insert({
        session_id: session.id,
        owner_user_id: ownerUserId,
        persona_id: session.persona_id,
        cluster: turn.cluster,
        question,
        turn_type: "follow_up",
      })
      .select("*")
      .single();

    if (error || !nextTurn) return res.status(500).json({ error: error?.message ?? "Could not create follow-up." });
    return res.json({ nextType: "followup", question, turnId: nextTurn.id, cluster: turn.cluster });
  }

  if (next.action === "summary") {
    const summary = await generateClusterSummary({ ownerUserId, cluster: turn.cluster, turns: currentTurns });
    const { data: summaryTurn, error } = await (sb as any)
      .from("integrity_session_turns")
      .insert({
        session_id: session.id,
        owner_user_id: ownerUserId,
        persona_id: session.persona_id,
        cluster: turn.cluster,
        question: summary,
        turn_type: "summary",
      })
      .select("*")
      .single();

    if (error || !summaryTurn) return res.status(500).json({ error: error?.message ?? "Could not create summary." });
    return res.json({ nextType: "summary", summary, turnId: summaryTurn.id, cluster: turn.cluster });
  }

  return completeSession(session.id, ownerUserId, res);
});

integrityRouter.post("/confirm-summary", async (req, res) => {
  const parsed = summarySchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const ownerUserId = req.user!.id;
  const { data: session } = await (sb as any)
    .from("integrity_sessions")
    .select("*")
    .eq("id", parsed.data.sessionId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (!session || session.status !== "in_progress") return res.status(404).json({ error: "Active integrity session not found." });

  if (parsed.data.correction?.trim()) {
    await (sb as any).from("integrity_session_turns").insert({
      session_id: session.id,
      owner_user_id: ownerUserId,
      persona_id: session.persona_id,
      cluster: parsed.data.cluster,
      question: "User correction to summary",
      answer: parsed.data.correction.trim(),
      turn_type: "confirmation",
    });
  }

  const covered = Array.from(new Set([...(session.clusters_covered ?? []), parsed.data.cluster]));
  const planned = (session.clusters_planned ?? []) as IntegrityCluster[];
  const nextCluster = planned.find((cluster) => !covered.includes(cluster));

  await (sb as any)
    .from("integrity_sessions")
    .update({ clusters_covered: covered })
    .eq("id", session.id)
    .eq("owner_user_id", ownerUserId);

  if (!nextCluster) return completeSession(session.id, ownerUserId, res);

  const question = await getAnchorQuestion(nextCluster, session.session_type);
  const { data: turn, error } = await (sb as any)
    .from("integrity_session_turns")
    .insert({
      session_id: session.id,
      owner_user_id: ownerUserId,
      persona_id: session.persona_id,
      cluster: nextCluster,
      question,
      turn_type: "anchor",
    })
    .select("*")
    .single();

  if (error || !turn) return res.status(500).json({ error: error?.message ?? "Could not create next anchor." });
  return res.json({
    nextType: "anchor",
    question,
    turnId: turn.id,
    cluster: nextCluster,
    clusterIndex: planned.indexOf(nextCluster),
  });
});

integrityRouter.post("/end-early", async (req, res) => {
  const parsed = z.object({ sessionId: z.string().uuid() }).safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return completeSession(parsed.data.sessionId, req.user!.id, res);
});

integrityRouter.get("/outputs/:sessionId", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data: session } = await (sb as any)
    .from("integrity_sessions")
    .select("id, status")
    .eq("id", req.params.sessionId)
    .eq("owner_user_id", req.user!.id)
    .single();

  if (!session) return res.status(404).json({ error: "Integrity session not found." });

  const { data: outputs, error } = await (sb as any)
    .from("integrity_session_outputs")
    .select("*")
    .eq("session_id", session.id)
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ status: session.status === "completed" ? "ready" : "generating", outputs: outputs ?? [] });
});

integrityRouter.patch("/outputs/:outputId", async (req, res) => {
  const parsed = outputReviewSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const sb = getSupabaseAdmin();
  const ownerUserId = req.user!.id;

  if (parsed.data.action === "reject") {
    const { data, error } = await (sb as any)
      .from("integrity_session_outputs")
      .update({ status: "rejected" })
      .eq("id", req.params.outputId)
      .eq("owner_user_id", ownerUserId)
      .select("*")
      .single();
    if (error || !data) return res.status(404).json({ error: error?.message ?? "Integrity output not found." });
    return res.json({ output: data });
  }

  const write = await writeAcceptedOutput(req.params.outputId, ownerUserId, parsed.data.editedContent);
  const { data, error } = await (sb as any)
    .from("integrity_session_outputs")
    .update({
      status: parsed.data.action === "edit" ? "edited" : "accepted",
      edited_content: parsed.data.editedContent ?? null,
      written_to: write.writtenTo,
      written_target_id: write.writtenTargetId,
    })
    .eq("id", req.params.outputId)
    .eq("owner_user_id", ownerUserId)
    .select("*")
    .single();

  if (error || !data) return res.status(404).json({ error: error?.message ?? "Integrity output not found." });
  return res.json({ output: data });
});

integrityRouter.get("/due", async (req, res) => {
  const sb = getSupabaseAdmin();
  const { data: personas, error } = await (sb as any)
    .from("personas")
    .select("id, name, integrity_sessions(completed_at,status)")
    .eq("owner_user_id", req.user!.id)
    .order("created_at", { ascending: true });

  if (error) return res.status(500).json({ error: error.message });

  const due = (personas ?? []).map((persona: any) => {
    const completed = (persona.integrity_sessions ?? [])
      .filter((session: any) => session.status === "completed" && session.completed_at)
      .sort((a: any, b: any) => String(b.completed_at).localeCompare(String(a.completed_at)));
    const lastSession = completed[0]?.completed_at ?? null;
    return {
      id: persona.id,
      name: persona.name,
      lastSession,
      sessionStatus: dueStatus(lastSession),
    };
  });

  return res.json({ personas: due });
});

integrityRouter.get("/history/:personaId", async (req, res) => {
  const ownerUserId = req.user!.id;
  const persona = await loadOwnedPersona(req.params.personaId, ownerUserId);
  if (!persona) return res.status(404).json({ error: "Persona not found." });

  const sb = getSupabaseAdmin();
  const { data, error } = await (sb as any)
    .from("integrity_sessions")
    .select("*, integrity_session_outputs(*)")
    .eq("persona_id", persona.id)
    .eq("owner_user_id", ownerUserId)
    .order("completed_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ sessions: data ?? [] });
});

async function completeSession(sessionId: string, ownerUserId: string, res: any) {
  const sb = getSupabaseAdmin();
  const { data: session } = await (sb as any)
    .from("integrity_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("owner_user_id", ownerUserId)
    .single();

  if (!session) return res.status(404).json({ error: "Integrity session not found." });
  if (session.status === "completed") {
    const { count } = await (sb as any)
      .from("integrity_session_outputs")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session.id)
      .eq("owner_user_id", ownerUserId);

    return res.json({
      nextType: "end",
      sessionId: session.id,
      outputsGenerated: count ?? 0,
      alreadyCompleted: true,
    });
  }
  if (session.status !== "in_progress") return res.status(404).json({ error: "Active integrity session not found." });

  const { data: turns, error: turnsError } = await (sb as any)
    .from("integrity_session_turns")
    .select("*")
    .eq("session_id", session.id)
    .eq("owner_user_id", ownerUserId)
    .order("created_at", { ascending: true });

  if (turnsError) return res.status(500).json({ error: turnsError.message });

  const outputs = await generateIntegrityOutputs({ ownerUserId, turns: turns ?? [] });
  if (outputs.length > 0) {
    const { error: outputError } = await (sb as any)
      .from("integrity_session_outputs")
      .insert(outputs.map((output) => ({
        session_id: session.id,
        owner_user_id: ownerUserId,
        persona_id: session.persona_id,
        output_type: output.output_type,
        content: output.content,
        status: "pending",
      })));

    if (outputError) return res.status(500).json({ error: outputError.message });
  }

  await (sb as any)
    .from("integrity_sessions")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      clusters_covered: session.clusters_planned?.length ? session.clusters_planned : session.clusters_covered,
    })
    .eq("id", session.id)
    .eq("owner_user_id", ownerUserId);

  return res.json({ nextType: "end", sessionId: session.id, outputsGenerated: outputs.length });
}

function dueStatus(lastSession: string | null) {
  if (!lastSession) return "never";
  const days = Math.floor((Date.now() - new Date(lastSession).getTime()) / (24 * 60 * 60 * 1000));
  if (days > 14) return "overdue";
  if (days >= 10) return "due_soon";
  return "ok";
}
