"use client";

import { PropsWithChildren, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NeynarContextProvider, Theme } from "@neynar/react";
import FrameSDK from "@farcaster/frame-sdk";
import { farcasterFrame } from "@farcaster/frame-wagmi-connector";
import { connect } from "wagmi/actions";
import { wagmiConfig } from "@/lib/wagmiConfig";
import { Toaster } from "@/components/ui/toaster";
import { MainHeader } from "@/components/main-header";
import { AppSidebar } from "@/components/app-sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

// Create a client
const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const context = await FrameSDK.context;

      // Autoconnect if running in a frame
      if (context?.client.clientFid) {
        connect(wagmiConfig, { connector: farcasterFrame() });
      }

      // Hide splash screen after UI renders
      setTimeout(() => {
        FrameSDK.actions.ready();
      }, 500);
    };
    init();
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NeynarContextProvider
          settings={{
            clientId: process.env.NEXT_PUBLIC_NEYNAR_CLIENT_ID || "",
            defaultTheme: Theme.Light,
            eventsCallbacks: {
              onAuthSuccess: () => {
                router.push("/posts");
              },
              onSignout: () => {
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}
