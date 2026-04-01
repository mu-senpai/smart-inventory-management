import ThemeClientProvider from "@/components/shared/ThemeClientProvider";
import ReduxProvider from "@/redux/ReduxProvider";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

// Load Inter font for specific use cases
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AML",
  description: "Explore top-tier vehicles from certified dealers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning is highly recommended for next-themes to prevent flickering classes
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} antialiased`}
      >
        <AntdRegistry>
          <ThemeClientProvider>
            <ReduxProvider>
              <Toaster />
              {children}
            </ReduxProvider>
          </ThemeClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
