import type { NextFunction, Request, Response } from "express";

const GENERIC_SERVER_ERROR = "Internal server error.";
const GENERIC_SERVER_ERROR_CODE = "internal_server_error";

type ErrorLike = {
  message?: unknown;
  name?: unknown;
  status?: unknown;
  statusCode?: unknown;
};

export function errorHandler(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(err);
    return;
  }

  const errorStatus = httpStatusFromError(err);
  const status = errorStatus ?? httpStatusFromResponse(res.statusCode) ?? 500;
  const exposeMessage = errorStatus !== null && shouldExposeStatus(status);
  const fallback = fallbackMessageForStatus(status);
  const message = exposeMessage
    ? sanitizePublicErrorMessage(errorMessage(err), fallback)
    : fallback;
  const code = shouldExposeStatus(status) ? codeForStatus(status) : GENERIC_SERVER_ERROR_CODE;

  console.error("API error", {
    status,
    code,
    name: safeErrorName(err),
    message,
  });

  res.status(status).json({ error: message, code });
}

function httpStatusFromError(err: unknown) {
  if (!isRecord(err)) return null;
  return normalizeHttpStatus(err.status) ?? normalizeHttpStatus(err.statusCode);
}

function httpStatusFromResponse(statusCode: number) {
  return normalizeHttpStatus(statusCode);
}

function normalizeHttpStatus(value: unknown) {
  const status = typeof value === "number" ? value : Number(value);
  return Number.isInteger(status) && status >= 400 && status <= 599 ? status : null;
}

function shouldExposeStatus(status: number) {
  return status < 500 || status === 503;
}

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (isRecord(err) && typeof err.message === "string") return err.message;
  return "";
}

function sanitizePublicErrorMessage(raw: string, fallback: string) {
  let message = raw;

  message = message
    .replace(/\b(?:postgres(?:ql)?|redis|mysql):\/\/\S+/gi, "[redacted-url]")
    .replace(/\bhttps?:\/\/\S+/gi, "[redacted-url]")
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "[redacted]")
    .replace(/\beyJ[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+){1,2}\b/g, "[redacted]")
    .replace(/\b(?:sk|pk|rk|whsec|ghp|pat)[_-][A-Za-z0-9._-]+\b/gi, "[redacted]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .replace(
      /\b(?:owner|user|persona|developer[\s_-]?space|space|memory|trace|event|source|resource|raw)[\s_-]?id\s*[:=]\s*\S+/gi,
      "[redacted-id]"
    )
    .replace(
      /\b(?:authorization|cookie|token|api[\s_-]?key|x[\s_-]?api[\s_-]?key|service[\s_-]?role|secret|password|webhook[\s_-]?secret|db[\s_-]?url|database[\s_-]?url|credential)\s*[:=]\s*[^,;]*/gi,
      "[redacted]"
    )
    .replace(
      /\b(?:(?:raw|private|system|user)[\s_-]?prompt|prompt|completion|provider[\s_-]?payload|private[\s_-]?text|private[\s_-]?snippet|raw[\s_-]?body|archive[\s_-]?excerpt)\s*[:=]\s*[^.;]+/gi,
      "[redacted private text]"
    )
    .replace(
      /\b(?:SQLSTATE|syntax error at or near|violates row-level security|duplicate key value|relation\s+"[^"]+"\s+does not exist|select\s+\*?\s+from|insert\s+into|update\s+\S+\s+set|delete\s+from)\b[^\n;]*/gi,
      "[redacted-sql]"
    )
    .replace(/\bat\s+[\w$.<>]+\s*\([^)]*\)/g, "[redacted-stack]");

  const normalized = message.replace(/\s+/g, " ").trim();
  const safe = normalized || fallback;
  return safe.length > 240 ? `${safe.slice(0, 237)}...` : safe;
}

function fallbackMessageForStatus(status: number) {
  switch (status) {
    case 400:
      return "Bad request.";
    case 401:
      return "Authentication required.";
    case 403:
      return "Forbidden.";
    case 404:
      return "Not found.";
    case 409:
      return "Conflict.";
    case 413:
      return "Payload too large.";
    case 429:
      return "Rate limit exceeded.";
    case 503:
      return "Service temporarily unavailable.";
    default:
      return status < 500 ? "Request failed." : GENERIC_SERVER_ERROR;
  }
}

function codeForStatus(status: number) {
  switch (status) {
    case 400:
      return "bad_request";
    case 401:
      return "unauthorized";
    case 403:
      return "forbidden";
    case 404:
      return "not_found";
    case 409:
      return "conflict";
    case 413:
      return "payload_too_large";
    case 429:
      return "rate_limited";
    case 503:
      return "service_unavailable";
    default:
      return status < 500 ? "request_failed" : GENERIC_SERVER_ERROR_CODE;
  }
}

function safeErrorName(err: unknown) {
  const name = err instanceof Error
    ? err.name
    : isRecord(err) && typeof err.name === "string"
      ? err.name
      : "Error";
  return /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(name) ? name : "Error";
}

function isRecord(value: unknown): value is ErrorLike {
  return typeof value === "object" && value !== null;
}
