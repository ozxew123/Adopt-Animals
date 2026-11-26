import type { ReactNode } from "react";
import { Ikon } from "./Ikon";

// Banner teal rata dengan dekorasi bentuk organik dan jejak kaki. Hanya presentasi.
export function HeroBanner({ judul, lead, children }: { judul: string; lead: string; children?: ReactNode }) {
  return (
    <section className="hero fullbleed" aria-labelledby="judul-hero">
      <span className="hz hz-orange" aria-hidden="true" />
      <span className="hz hz-peach" aria-hidden="true" />
      <span className="hz hz-wave" aria-hidden="true" />
      <Ikon nama="paw" className="hp hp1" /><Ikon nama="paw" className="hp hp2" />
      <Ikon nama="paw" className="hp hp3" /><Ikon nama="paw" className="hp hp4" />
      <span className="hz-pet hz-l" aria-hidden="true">🐱</span>
      <span className="hz-pet hz-r" aria-hidden="true">🐶</span>
      <div className="hero-in">
        <h1 id="judul-hero">{judul}</h1>
        <p className="lead">{lead}</p>
        <div className="hero-act">{children}</div>
      </div>
    </section>
  );
}
