import { Ikon } from "./Ikon";

export function TombolCetak() {
  return (
    <button type="button" className="btn sm out" onClick={() => window.print()}>
      <Ikon nama="printer" />Cetak
    </button>
  );
}
