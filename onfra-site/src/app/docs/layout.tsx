import type { Metadata } from "next";
import { DocsShell } from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Documentation — OnFRA",
  description: "Integrate OnFRA financial reputation infrastructure on Celo."
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
