import { SiteShell } from "@/components/ui/SiteShell";

export default function PublikLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
