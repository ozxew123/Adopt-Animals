import { warnaStatus } from "@/shared/scoring";

export function Badge({ teks }: { teks: string }) {
  return <span className={`tag ${warnaStatus(teks)}`}>{teks}</span>;
}
