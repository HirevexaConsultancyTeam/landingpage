import type { Metadata } from "next";
import "./globals.css";
import Providers from "./components/Providers";
import NavbarWrapper from "./components/NavbarWrapper";
import { Toaster } from "sonner";

const BASE_URL = "https://hirevexaconsultancy.in";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "HireVexa Consultancy | Job Placement Agency for Freshers in India",
    template: "%s | HireVexa Consultancy",
  },
  description: "HireVexa is India's trusted job placement consultancy for freshers. Get placed in top IT companies with resume building, interview prep, and direct job referrals. Pan India placement support.",
  keywords: [
    "job placement consultancy India",
    "placement agency for freshers",
    "IT job consultancy",
    "job consultant Delhi",
    "fresher job placement",
    "placement guarantee program",
    "job provider agency India",
    "tech jobs for freshers",
    "placement preparation",
    "career consultancy India",
    "software engineer jobs freshers",
    "job referral India",
    "resume building service India",
    "mock interview preparation",
    "HireVexa consultancy",
  ],
  authors: [{ name: "HireVexa Consultancy", url: BASE_URL }],
  creator: "HireVexa Consultancy",
  publisher: "HireVexa Consultancy",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "HireVexa Consultancy",
    title: "HireVexa Consultancy | Job Placement Agency for Freshers in India",
    description: "India's trusted job placement consultancy. Get placed in top companies with resume building, interview prep, and direct job referrals.",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "HireVexa Consultancy - Job Placement for Freshers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HireVexa Consultancy | Job Placement for Freshers",
    description: "India's trusted placement consultancy. Resume building, interview prep, and direct job referrals for freshers.",
    images: [`${BASE_URL}/og-image.png`],
  },
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.ico",
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    // Add your Google Search Console verification code here once set up
    // google: "your-verification-code",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavbarWrapper />
          {children}
          <Toaster position="top-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  );
}