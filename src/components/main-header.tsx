"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import axios from "axios";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  author: string;
  authorPfp: string;
  date: string;
}

export function MainHeader() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(searchQuery, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(
          `/api/posts/search?q=${encodeURIComponent(debouncedQuery)}`,
        );
        setResults(response.data.posts || []);
      } catch (error) {
        console.error("Error searching posts:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    handleSearch();
  }, [debouncedQuery]);

  const handleSelectPost = (postId: string) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    router.push(`/posts/${postId}`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto h-14">
        <div className="flex h-full items-center justify-between gap-4">
          {/* Logo and Menu Section */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <Link href="/" className="font-bold">
              GramaFund
            </Link>
          </div>

          {/* Search Section */}
          <div className="flex-1 flex justify-end max-w-[600px]">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="sm:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              {!isSearchOpen && <Search className="h-5 w-5" />}
            </Button>

            {/* Search Input */}
            <div
              ref={searchRef}
              className={cn(
                "relative",
                isSearchOpen
                  ? "absolute top-0 left-0 right-0 p-4 bg-background/95 backdrop-blur h-14 flex items-center z-50"
                  : "hidden sm:block w-full max-w-[300px]",
              )}
            >
              <div className="relative w-full">
                <div className="flex items-center rounded-lg border shadow-sm">
                  <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full py-2 pl-8 pr-4 bg-transparent focus:outline-none text-sm"
                  />
                  {isSearchOpen && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 h-7 w-7 p-0"
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {searchQuery && (
                  <div className="absolute left-0 right-0 top-[calc(100%+4px)] max-h-[300px] overflow-y-auto rounded-md border bg-background shadow-lg z-[60]">
                    {isLoading && (
                      <div className="p-2 text-sm text-muted-foreground">
                        Searching...
                      </div>
                    )}
                    {!isLoading && results.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground">
                        No results found
                      </div>
                    )}
                    {results.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => handleSelectPost(result.id)}
                        className="w-full px-3 py-2 text-left hover:bg-accent flex flex-col gap-1"
                      >
                        <div className="font-medium text-sm">
                          {result.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          by {result.author} • {result.date}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
