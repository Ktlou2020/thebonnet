import type { Metadata } from "next";
import "@/app/globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "The Bonnet | South Africa's mechanic marketplace",
  description:
    "Find verified mechanics, compare fair prices, request quotes, and grow workshop demand with a modern lead generation platform."
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
