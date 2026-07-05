import { DM_Sans } from "next/font/google";

import { AdminLayoutShell } from "@/app/components/admin-layout-shell";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${dmSans.className} ${dmSans.variable}`}>
      <AdminLayoutShell>{children}</AdminLayoutShell>
    </div>
  );
}
