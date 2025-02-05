"use client";

import { PropsWithChildren } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { Toaster } from "@/components/ui/toaster";
import { MainHeader } from "@/components/main-header";
import { AppSidebar } from "@/components/app-sidebar";
import dynamic from "next/dynamic";
import { SWRConfig } from 'swr';

const WagmiProvider = dynamic(
  () => import("@/components/providers/WagmiProvider"),
  {
    ssr: false,
  },
);
const swrConfig = {
  provider: () => new Map(),
  revalidateOnFocus: false,
  revalidateIfStale: false,
};

export function Providers({ children }: PropsWithChildren) {
  const router = useRouter();

  return (
    <WagmiProvider>
      <SWRConfig value={swrConfig}>
      <NeynarContextProvider
        settings={{
          clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
          defaultTheme: Theme.Light,
          eventsCallbacks: {
            onAuthSuccess: () => {
              console.log("Neynar auth success");
              router.push("/posts");
            },
            onSignout: () => {
              console.log("Neynar signout");
              router.push("/");
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
      </SWRConfig>
    </WagmiProvider>
  );
}
