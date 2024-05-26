import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { Inter as FontSans } from "next/font/google";
import { cn } from "@/lib/utils";
import Link from "next/link";
import DashboardButton from "@/components/dashboard-button";
import AccountButton from "@/components/account-button";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <main className="mx-auto max-w-screen-lg pt-24">
          <div className="flex justify-between">
            <div className="flex items-end space-x-3">
              <Link href="/">
                <h1 className="text-3xl font-semibold">Talk-to-Podcasts</h1>
              </Link>
              <DashboardButton />
            </div>
            <AccountButton />
          </div>
        </main>
        {children}
      </body>
    </html>
  );
}
