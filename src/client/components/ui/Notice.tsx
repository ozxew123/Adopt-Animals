export function Notice({ ok, err }: { ok?: string | null; err?: string | null }) {
  if (!ok && !err) return null;
  return <div className={err ? "flash bad" : "flash ok"} role={err ? "alert" : "status"}>{err ?? ok}</div>;
}
