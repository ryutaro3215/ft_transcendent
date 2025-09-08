import type { Params } from "../types/router";

export function compilePattern(pattern: string) {
  if (pattern === "*") return { regex: /^.*$/i, names: [] as string[] };
  const names: string[] = [];

  let p = pattern.replace(/\/{2,}/g, "/");
  if (!p.startsWith("/")) p = "/" + p;

  const segs = p.split("/").filter(Boolean);
  if (segs.length === 0) {
    return { regex: /^\/$/, names };
  }

  const body = segs
    .map((seg) => {
      if (seg.startsWith(":")) {
        names.push(seg.slice(1));
        return "([^/]+)";
      }
      return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");

  const regex = new RegExp("^/" + body + "/?$");

  return { regex, names };
}

export function execMatch(
  regex: RegExp,
  names: string[],
  path: string,
): Params | null {
  const m = regex.exec(path);
  if (!m) return null;
  const params: Params = {};
  names.forEach((n, i) => (params[n] = decodeURIComponent(m![i + 1] ?? "")));
  return params;
}
