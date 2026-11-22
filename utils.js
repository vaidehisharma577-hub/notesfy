export const stripHtml = (html = "") => {
  const el = document.createElement("div");
  el.innerHTML = html.replace(/<\/(p|h[1-6]|li|div|blockquote|tr|pre)>|<br\s*\/?>/gi, " $&");
  return (el.textContent || "").replace(/\s+/g, " ").trim();
};

export const excerpt = (html, n = 110) => {
  const t = stripHtml(html);
  return t.length > n ? t.slice(0, n).trimEnd() + "…" : t;
};

export const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
    : "";

export const greeting = () => {
  const h = new Date().getHours();
  return h < 5 ? "Good night" : h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

export const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("") || "N";

export const cx = (...a) => a.filter(Boolean).join(" ");
