import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import "react-image-crop/dist/ReactCrop.css";
import "mapbox-gl/dist/mapbox-gl.css";
import ReactQueryProvider from "./providers/reactqueryprovider";
import { initMqttHeartbeatSync } from "@/lib/mqttHeartbeatSync";
import { initAutoUptimeLogger } from "@/lib/autoUptimeLogger";



// ✅ Only run MQTT sync on the server, not client or build
if (typeof window === "undefined") {
  initMqttHeartbeatSync();
  initAutoUptimeLogger();
}

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Smart Recycling Bin System",
  description: "A dashboard for smart recycling",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ReactQueryProvider>
          <main>{children}</main>
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
