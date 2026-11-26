import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Memuat…</span>
      <Skeleton tinggi={190} />
      <div className="grid" style={{ marginTop: 24 }}>
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} tinggi={280} />)}
      </div>
    </div>
  );
}
