import type { ReactNode } from "react";

export type NamaIkon =
  | "paw" | "gender" | "cal" | "clock" | "check" | "x" | "list" | "search" | "download" | "printer"
  | "users" | "grid" | "tag" | "sliders" | "history" | "globe" | "logout" | "arrow-left";

const BENTUK: Record<NamaIkon, ReactNode> = {
  paw: (<><circle cx="6" cy="11" r="2" /><circle cx="10" cy="6" r="2" /><circle cx="16" cy="6" r="2" /><circle cx="20" cy="11" r="2" /><path d="M12 12c-3.2 0-6 3.2-5.2 6 .6 2 2.9 1.8 5.2 1.3 2.3.5 4.6.7 5.2-1.3.8-2.8-2-6-5.2-6z" /></>),
  gender: (<><circle cx="12" cy="9" r="5" /><path d="M12 14v8M9 18h6" /></>),
  cal: (<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>),
  clock: (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  check: (<><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></>),
  x: (<><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>),
  download: <path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16" />,
  printer: <path d="M6 9V3h12v6M6 18H4v-7h16v7h-2M7 14h10v7H7z" />,
  users: (<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-4 3.2-6 6.5-6s6 2 6.5 6M17 11a3 3 0 1 0-1-5.8M21.5 19c-.3-2.6-1.8-4.3-4-5" /></>),
  grid: (<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>),
  tag: (<><path d="M3 12V4h8l10 10-8 8L3 12z" /><circle cx="7.5" cy="8.5" r="1" /></>),
  sliders: (<><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>),
  history: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" />,
  globe: (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></>),
  logout: <path d="M9 21H5V3h4M16 17l5-5-5-5M21 12H9" />,
  "arrow-left": <path d="M19 12H5m6-6-6 6 6 6" />,
};

export function Ikon({ nama, className = "ic" }: { nama: NamaIkon; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {BENTUK[nama]}
    </svg>
  );
}
