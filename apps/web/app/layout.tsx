import "./globals.css";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { STATION_THEME_BOOTSTRAP_SCRIPT } from "@/lib/theme";

const TopNav = dynamic(() => import("@/components/nav/top-nav").then((m) => m.TopNav), {
  ssr: false,
  loading: () => <nav className="top-nav-loading" />,
});

export const metadata: Metadata = {
  title: "Station",
  description: "Station Studio Alpha",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="station-theme-bootstrap"
          dangerouslySetInnerHTML={{ __html: STATION_THEME_BOOTSTRAP_SCRIPT }}
        />
      </head>
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
