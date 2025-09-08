export type Child = Node | string | number | null | undefined;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, any> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k.startsWith("on") && typeof v === "function")
      el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v != null) (el as any)[k] = v;
  }
  for (const c of children) {
    if (c != null) el.append(c instanceof Node ? c : String(c));
  }
  return el;
}
