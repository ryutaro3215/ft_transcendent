export function buildWsUrl(path: string, apiOrigin: string): string {
  const u = new URL(path, apiOrigin);
  u.protocol = u.protocol.replace("http", "ws");
  return u.toString();
}
