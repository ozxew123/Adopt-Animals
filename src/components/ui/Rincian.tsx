type Baris = { id: number; poin: number; kriteria: { namaKriteria: string }; opsi: { keteranganJawaban: string } };

// Rincian jawaban per kriteria beserta poinnya (Lembar Hasil Penilaian dan detail pengajuan admin)
export function Rincian({ detail }: { detail: Baris[] }) {
  return (
    <ul className="rincian">
      {detail.map((d) => (
        <li key={d.id}>
          <div><span className="k">{d.kriteria.namaKriteria}</span><span className="j">{d.opsi.keteranganJawaban}</span></div>
          <span className="poinb">{d.poin} poin</span>
        </li>
      ))}
    </ul>
  );
}
