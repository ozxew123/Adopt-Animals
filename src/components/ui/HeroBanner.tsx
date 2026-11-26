import type { ReactNode } from "react";

// Settled Editorial Hero (Ink): ringan, proporsional, fokus di layar pertama tanpa efek berat
export function HeroBanner({ judul, lead, children }: { judul: string; lead: string; children?: ReactNode }) {
  return (
    <section className="hero" aria-labelledby="judul-hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <h1 id="judul-hero">{judul}</h1>
          <p className="lead">{lead}</p>
          <div className="hero-act">{children}</div>
          <dl className="hero-facts">
            <div>
              <dt>Vaksin &amp; Steril</dt>
              <dd>Pemeriksaan medis shelter rutin</dd>
            </div>
            <div>
              <dt>Seleksi Terbuka</dt>
              <dd>Skor kelayakan transparan</dd>
            </div>
            <div>
              <dt>Tanpa Biaya</dt>
              <dd>Fokus pada rumah yang aman</dd>
            </div>
          </dl>
        </div>
        <div className="hero-visual" data-slot="hero-cat">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cat_November_2010-1a.jpg/960px-Cat_November_2010-1a.jpg"
            alt="Seekor kucing tabby duduk tenang menatap kamera dengan latar langit cerah"
            width={1795}
            height={2397}
            fetchPriority="high"
          />
        </div>
      </div>
    </section>
  );
}
