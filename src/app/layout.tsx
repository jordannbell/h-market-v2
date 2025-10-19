import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
 variable: "--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "H-Market - Saveurs d'Afrique",
 description: "Découvrez les meilleurs produits africains authentiques livrés chez vous en Île-de-France",
 icons: {
 icon: '/icon.svg',
 apple: '/icon.svg',
 },
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="en">
 <body
 className={`${geistSans.variable} ${geistMono.variable} antialiased`}
 >
 <Providers>
 {children}
 </Providers>
 </body>
 </html>
 );
}
