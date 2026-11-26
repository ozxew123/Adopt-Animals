export function Skeleton({ tinggi = 16, lebar = "100%" }: { tinggi?: number; lebar?: number | string }) {
  return <div className="sk" style={{ height: tinggi, width: lebar }} aria-hidden="true" />;
}
