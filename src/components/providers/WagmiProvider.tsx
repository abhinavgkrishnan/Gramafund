"use client";

import { PropsWithChildren, useEffect, useState } from "react";
import { WagmiProvider as Wagmi } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmiConfig";

const queryClient = new QueryClient();

export default function WagmiProvider({ children }: PropsWithChildren) {
  const [isFrameLoaded, setIsFrameLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (typeof window === 'undefined') return;
        
        console.log("Initializing Frame SDK...");
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
        
        setTimeout(() => {
          console.log("Frame ready");
          frameSDK.actions.ready();
        }, 500);
      } catch (error) {
        console.error("Frame initialization error:", error);
        setIsFrameLoaded(true);
      }
    };
    
    init();
  }, []);

  if (!isFrameLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <Wagmi config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Wagmi>
  );
}