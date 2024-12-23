"use client";

import { PropsWithChildren, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { NeynarContextProvider, Theme } from "@neynar/react";
import FrameSDK from '@farcaster/frame-sdk';
import { Toaster } from "@/components/ui/toaster";
import { MainHeader } from "@/components/main-header";
import { AppSidebar } from "@/components/app-sidebar";

export function Providers({ children }: PropsWithChildren) {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      await FrameSDK.actions.ready();
    };
    init();
  }, []);

  return (
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
  );
}