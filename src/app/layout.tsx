import type { Metadata } from "next";
import { Geist, Nunito } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/useAuth";

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-geist",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["900"],
  variable: "--font-nunito",
});

const jetbrainsMono = localFont({
  src: "../fonts/JetBrainsMonoNerdFont-Regular.ttf",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Flow Into Code",
    template: "%s | Flow Into Code",
  },
  description: "Practice technical interviews with structured AI feedback",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} ${geist.variable} ${nunito.variable}`}
    >
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Navbar />
            <main>{children}</main>
            <Toaster position="bottom-left" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
