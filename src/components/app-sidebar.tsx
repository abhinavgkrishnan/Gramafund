"use client";

import * as React from "react";
import { Home, Star, Users } from "lucide-react";

import { NavCategories } from "@/components/nav-categories";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "GK",
    email: "gk@example.com",
    avatar: "/image.png",
  },
  categories: [
    {
      name: "Home",
      url: "#",
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
  return (
    <div className="flex flex-col gap-4 p-4">
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader></SidebarHeader>
        <SidebarContent>
          <NavCategories categories={data.categories} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </div>
  );
}
