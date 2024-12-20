"use client";

import * as React from "react";
import { Home, Star, Users } from "lucide-react";
import { useNeynarContext } from "@neynar/react";
import { NeynarAuthButton, SIWN_variant } from "@neynar/react";

import { NavCategories } from "@/components/nav-categories";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const data = {
  categories: [
    {
      name: "Home",
      url: "/posts",
      icon: Home,
    },
    {
      name: "Community",
      url: "#",
      icon: Star,
    },
    {
      name: "Featured",
      url: "#",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, toggleSidebar } = useSidebar();
  const { user } = useNeynarContext();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <button onClick={toggleSidebar} className="p-2">
          {state === "expanded" ? "Collapse" : "Expand"}
        </button>
      </SidebarHeader>

      <SidebarContent>
        {state === "expanded" ? (
          <NavCategories categories={data.categories} />
        ) : (
          <div className="flex flex-col items-center">
            {data.categories.map((category) => (
              <category.icon key={category.name} className="h-6 w-6 my-2" />
            ))}
          </div>
        )}
      </SidebarContent>

      <SidebarFooter>
        {user ? (
          <NavUser user={user} isExpanded={state === "expanded"} />
        ) : (
          state === "expanded" && (
            <div className="px-4 py-2">
              <NeynarAuthButton variant={SIWN_variant.WARPCAST} />
            </div>
          )
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
