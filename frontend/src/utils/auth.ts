import { h } from "../ui/h";

export function field(label: string, input: HTMLElement, help: HTMLElement) {
  return h(
    "div",
    { className: "space-y-1" },
    h("label", { className: "block text-sm text-slate-200" }, label),
    input,
    help,
  );
}

export function inputCls() {
  return [
    "w-full px-3 py-2 rounded-xl",
    "bg-slate-800/60 text-slate-100 placeholder:text-slate-400",
    "border border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-400/60",
  ].join(" ");
}

export function errCls() {
  return "hidden text-xs text-red-300";
}

export function btnCls() {
  return [
    "w-full px-4 py-2 rounded-xl",
    "bg-sky-500 hover:bg-sky-400 active:bg-sky-600",
    "text-white font-semibold shadow",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "transition-colors",
  ].join(" ");
}

export async function safeJson(res: Response) {
  const text = await res.text();
  try {
    if (text) return JSON.parse(text);
    else return undefined;
  } catch {
    return undefined;
  }
}
