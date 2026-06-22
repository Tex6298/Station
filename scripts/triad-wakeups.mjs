import { execFileSync } from "node:child_process";

export function readRecentCommits({ maxCount = 50, ref = "HEAD", since = null } = {}) {
  const revision = since ? `${since}..${ref}` : ref;
  const output = execFileSync(
    "git",
    ["log", `--max-count=${maxCount}`, "--date=iso-strict", "--format=%x1e%H%x1f%aI%x1f%s%x1f%b", revision],
    { encoding: "utf8" },
  );

  return output
    .split("\x1e")
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => {
      const [hash, authoredAt, subject, ...bodyParts] = record.split("\x1f");
      return {
        hash,
        authoredAt,
        subject,
        body: bodyParts.join("\x1f").trim(),
      };
    });
}

export function wakeupsFor(agent, { ref = "HEAD", since = null } = {}) {
  const headerPattern = new RegExp(`(^|\\n)WAKEUP\\s+${agent.id}:`, "i");

  return readRecentCommits({ ref, since }).filter((commit) => headerPattern.test(commit.body));
}

export function newWakeupsFor(agent, state, { ref = "HEAD", since = null } = {}) {
  const wakeups = wakeupsFor(agent, { ref, since });
  if (since) return wakeups;

  const lastSeenIndex = state.lastSeenCommit
    ? wakeups.findIndex((commit) => commit.hash === state.lastSeenCommit)
    : -1;

  return lastSeenIndex >= 0 ? wakeups.slice(0, lastSeenIndex) : wakeups;
}

export function formatWakeup(agent, commit) {
  return [
    "",
    `${agent.id} / ${agent.codename} - ${agent.title}`,
    `Commit: ${commit.hash.slice(0, 12)}`,
    `Date: ${commit.authoredAt}`,
    `Subject: ${commit.subject}`,
    "",
    commit.body,
    "",
  ].join("\n");
}
