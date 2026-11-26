import { warnaStatus } from "@/features/pengajuan/scoring";

export function Badge({ teks }: { teks: string }) {
  return <span className={`tag ${warnaStatus(teks)}`}>{teks}</span>;
}
