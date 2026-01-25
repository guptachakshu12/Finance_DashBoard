import type { Metadata } from "next";
import { MantineProvider } from "@mantine/core";
import { ReduxProvider } from "./providers";
import "@mantine/core/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinBoard - Finance Dashboard",
  description: "Configurable finance dashboard with real-time data widgets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <MantineProvider>
            {children}
          </MantineProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
