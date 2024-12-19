"use client";
import { Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NeynarContextProvider, Theme } from "@neynar/react";
import "@neynar/react/dist/style.css";
import { Toaster } from "@/components/ui/toaster"
import { MainHeader } from "@/components/main-header";
import { AppSidebar } from "@/components/app-sidebar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <html lang="en">
      <body className={inter.className}>
        <NeynarContextProvider
          settings={{
            clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
            defaultTheme: Theme.Light,
            eventsCallbacks: {
              onAuthSuccess: () => {
                router.push("/posts"); // Redirect to posts page on successful auth
              },
              onSignout: () => {
                router.push("/"); // Redirect to landing page on signout
              },
            },
          }}
        >
          <SidebarProvider>
            <div className="flex min-h-screen flex-col w-full">
              <MainHeader />
              <div className="flex flex-1 items-start">
                <AppSidebar />
                <main className="flex w-full flex-col gap-6 p-4 md:gap-8">
                  {children}
                  <Toaster />
                </main>
              </div>
            </div>
          </SidebarProvider>
        </NeynarContextProvider>
      </body>
    </html>
  );
}
