import { Rajdhani, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-rajdhani",
});

const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-mono",
});

export const metadata = {
  title: "Z4K7 | Cybersecurity",
  description: "Pentester Jr · eJPTv2 · ISO 27001 · Microsoft 365",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={`${rajdhani.variable} ${shareTechMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
