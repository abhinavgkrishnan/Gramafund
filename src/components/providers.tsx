"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NeynarContextProvider, Theme } from "@neynar/react";
import { Toaster } from "@/components/ui/toaster";
import { MainHeader } from "@/components/main-header";
import { AppSidebar } from "@/components/app-sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "@/lib/wagmiConfig";

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  const router = useRouter();
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window === 'undefined') return;

        console.log("Initializing Frame SDK...");
        
        // Wait for frame SDK to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const frameSDK = (await import('@farcaster/frame-sdk')).default;
        const context = await frameSDK.context;

        if (context?.client.clientFid) {
          console.log("Frame context found, connecting wallet...");
          const { connect } = await import('wagmi/actions');
          const { farcasterFrame } = await import('@farcaster/frame-wagmi-connector');
          
          try {
            await connect(wagmiConfig, { 
              connector: farcasterFrame() 
            });
            console.log("Wallet connected successfully");
          } catch (connError) {
            console.warn("Wallet connection failed:", connError);
          }
        }

        setIsFrameLoaded(true);

        // Hide splash screen after UI renders
        setTimeout(() => {
          console.log("Frame ready");
          frameSDK.actions.ready();
        }, 500);
      } catch (error) {
        console.error("Frame initialization error:", error);
        setIsFrameLoaded(true); // Still set to true to allow app to render
      }
    };

    init();
  }, []);

  // Optional: Show loading state while frame is initializing
  if (!isFrameLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </WagmiProvider>
  );
}
