import "./globals.css"; // Assuming Tailwind base styles are here
import { Inter, Playfair_Display } from "next/font/google"; // Example fonts from scraped UI
import { AuthProvider } from "../hooks/useAuth"; // Import AuthProvider
import { ThemeProvider } from "../providers/ThemeProvider";
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
        <ThemeProvider>
          <AuthProvider>
            <NavigationProgress />
            <ResponsiveNavbar />
            <main className="container mx-auto px-4 py-8 min-h-screen">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
