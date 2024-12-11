"use client";

import * as React from "react";
import { Home, Star, Users } from "lucide-react";
import Image from "next/image";

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
        {state === "expanded" ? (
          <NavUser user={data.user} />
        ) : (
          <div className="flex flex-col items-center">
            <Image
              src={data.user.avatar}
              alt={data.user.name}
              width={24}
              height={24}
              className="rounded-full"
            />
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}