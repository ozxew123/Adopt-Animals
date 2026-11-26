import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="stack">
      <span className="sr-only">Memuat…</span>
      <Skeleton tinggi={36} lebar="40%" />
      <div className="stats">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} tinggi={88} />)}</div>
      <Skeleton tinggi={240} />
    </div>
  );
}
