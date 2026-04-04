import type { Metadata } from "next";
import "./globals.css";
import SmoothScroller from "./SmoothScroller";
import CustomCursor from "@/components/ui/CustomCursor";
import AudioVisualizer from "@/components/ui/AudioVisualizer";
import LoadingScreen from "@/components/ui/LoadingScreen";

export const metadata: Metadata = {
  title: "Hidden Spring | Easter Adventure",
  description: "A whimsical, beautifully crafted Easter journey.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <LoadingScreen />
        <CustomCursor />
        <AudioVisualizer />
        <SmoothScroller>
          {children}
        </SmoothScroller>
      </body>
    </html>
  );
}
