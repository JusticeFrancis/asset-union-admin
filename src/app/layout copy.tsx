import { ReactNode } from "react";

import { AdminLayoutShell } from "@/app/components/admin-layout-shell";

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
