import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  title: "The Bonnet | Find trusted mechanics in South Africa",
  description: "Browse real workshop listings, compare mechanics by city and service type, and request quotes through a cleaner South African mechanic marketplace.",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  openGraph: {
    title: "The Bonnet | Find trusted mechanics in South Africa",
    description: "Real workshop listings, city-based search, and client-ready quote capture for drivers across South Africa.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Bonnet | Find trusted mechanics in South Africa",
    description: "Real workshop listings, city-based search, and client-ready quote capture for drivers across South Africa."
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
