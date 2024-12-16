"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function MainHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Menu and Logo */}
        <div
          className={`flex items-center ${isSearchOpen ? "hidden sm:flex" : "flex"}`}
        >
          <SidebarTrigger className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
          </SidebarTrigger>
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">GramaFund</span>
          </Link>
        </div>

        {/* Search and Nav Container */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile Search Icon */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            {!isSearchOpen && <Search className="h-5 w-5" />}
          </Button>

          {/* Search Input */}
          <div
            className={cn(
              "absolute left-0 top-0 w-full sm:relative sm:w-[300px]",
              isSearchOpen
                ? "flex h-14 items-center px-4 sm:px-0"
                : "hidden sm:flex",
            )}
          >
            <div className="relative w-full">
              <Input
                placeholder="Search posts..."
                className="h-8 pr-8 appearance-none bg-transparent [background-image:none]"
                type="text"
              />
              {isSearchOpen && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav
            className={cn(
              "flex items-center space-x-2",
              isSearchOpen ? "hidden sm:flex" : "flex",
            )}
          >
            <Button variant="ghost" size="sm">
              Log in
            </Button>
            <Button size="sm" className="hidden sm:inline-flex">
              Sign up
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
