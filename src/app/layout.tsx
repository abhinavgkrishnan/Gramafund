import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MainHeader } from "@/components/main-header";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gramafund",
  description: "A community blog devoted to refining the art of human rationality",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex min-h-screen flex-col w-full">
            <MainHeader />
            <div className="flex flex-1 items-start">
              <AppSidebar />
              <main className="flex w-full flex-col gap-6 p-4 md:gap-8">
                {children}
              </main>
            </div>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}