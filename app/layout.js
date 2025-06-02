import "./globals.css";
import { Inter, Playfair_Display } from "next/font/google";
import { Providers } from "./providers";
import ResponsiveNavbar from "../components/layout/ResponsiveNavbar";
import NavigationProgress from "../components/ui/NavigationProgress";
import Footer from "../components/layout/Footer";

// Configure fonts (adjust as per actual project font strategy)
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-playfair-display",
});

export const metadata = {
  title: "LegalHelp GH - Know Your Rights",
  description: "Multilingual legal literacy platform for Ghanaians.",
  // Add more metadata: icons, openGraph, etc.
  // icons: {
  //   icon: '/favicon.ico',
  //   apple: '/apple-touch-icon.png',
  // },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body>
        <Providers>
          <NavigationProgress />
          <ResponsiveNavbar />
          <main className="container mx-auto px-4 py-8 min-h-screen">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
