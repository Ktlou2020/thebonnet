import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: {
    default: "The Bonnet | Find trusted mechanics in South Africa",
    template: "%s | The Bonnet"
  },
  description: "Browse real workshop listings, compare mechanics by city and service type, and request quotes through a cleaner South African mechanic marketplace.",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  applicationName: "The Bonnet",
  manifest: "/site.webmanifest",
  themeColor: "#08111f",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/icon-16x16.png", type: "image/png", sizes: "16x16" }
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    title: "The Bonnet | Find trusted mechanics in South Africa",
    description: "Real workshop listings, city-based search, and client-ready quote capture for drivers across South Africa.",
    type: "website",
    images: [{ url: "/og-badge.png", width: 512, height: 512, alt: "The Bonnet brand badge" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bonnet | Find trusted mechanics in South Africa",
    description: "Real workshop listings, city-based search, and client-ready quote capture for drivers across South Africa.",
    images: ["/og-badge.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
