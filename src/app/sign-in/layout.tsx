import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Sign in — Admin",
  description: "Sign in to the Asset Union admin dashboard",
};

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${dmSans.className} ${dmSans.variable} min-h-full w-full`}>
      {children}
    </div>
  );
}
