import type { RequestProps } from "../types/api";
import { ApiError } from "./apiError";
import { safeJson } from "../utils/auth";

// wrap fetch client method.
// We have to wrap construct api to divide api function.
// we can initialize request method passing props of Request props in types/api

export async function request<T = unknown>({
  url,
  method = "GET",
  query,
  headers,
  body,
  timeOutms = 1000,
  signal,
  credentials = "same-origin",
}: RequestProps): Promise<T> {
  const fullUrl = buildUrl(url, query);

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  let payload: BodyInit | undefined;
  if (body == undefined) payload = undefined;
  else if (isForm) payload = body;
  else payload = JSON.stringify(body);

  if (body !== undefined && !isForm)
    finalHeaders["Content-Type"] = "application/json";
  const abortctl = new AbortController();
  const timer = timeOutms
    ? setTimeout(() => abortctl.abort(), timeOutms)
    : undefined;
  const mergeSignal = mergeSignals(abortctl.signal, signal);

  try {
    const res = await fetch(fullUrl, {
      method,
      headers: finalHeaders,
      body: payload,
      credentials,
      signal: mergeSignal,
    });

    if (!res.ok) throw await ApiError.formResponse(res);
    if (res.status === 204) return undefined as unknown as T;

    const data = await safeJson(res);
    return data as T;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new ApiError({
        status: 0,
        code: "ABORTED",
        message: "Request aborted or timed out",
      });
    }

    if (e instanceof ApiError) throw e;
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: e?.message ?? "Network error",
      details: e,
    });
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const API_ORIGIN =
  (typeof import.meta !== "undefined" &&
    (import.meta as any).env?.VITE_API_ORIGIN) ||
  "https://localhost:3443";

export function buildUrl(pathOrUrl: string, query?: Record<string, unknown>) {
  // check pathOrUrl is absolute path or not
  if (/^https?:\/\//i.test(pathOrUrl)) {
    const u = new URL(pathOrUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v != null) u.searchParams.set(k, String(v));
      }
    }
    return u.toString();
  }

  // protocol relative
  if (/^\/\//.test(pathOrUrl)) {
    const u = new URL(window.location.protocol + pathOrUrl);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v != null) u.searchParams.set(k, String(v));
      }
    }
    return u.toString();
  }

  const base = pathOrUrl.startsWith("/api")
    ? API_ORIGIN
    : window.location.origin;
  const url = new URL(pathOrUrl, base);

  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v != null) url.searchParams.set(k, String(v));
    }
  }

  return url.toString();
}

function mergeSignals(a: AbortSignal, b?: AbortSignal) {
  if (!b) return a;
  const ctrl = new AbortController();
  const abort = () => ctrl.abort();
  a.addEventListener("abort", abort);
  b.addEventListener("abort", abort);
  return ctrl.signal;
}
