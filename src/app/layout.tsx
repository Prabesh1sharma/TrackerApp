import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stride — Daily Activity Tracker",
  description:
    "Stay consistent with your daily habits. Track activities, build streaks, and visualize your progress with Stride.",
  keywords: ["habit tracker", "daily activities", "streak", "productivity", "consistency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#242220",
                color: "#e8e0d8",
                border: "1px solid #3d3935",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: {
                iconTheme: {
                  primary: "#5da87e",
                  secondary: "#e8e0d8",
                },
              },
              error: {
                iconTheme: {
                  primary: "#c75f5f",
                  secondary: "#e8e0d8",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
