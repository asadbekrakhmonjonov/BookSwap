"use client";

import React, { useState, useMemo } from "react";
import { AuthProvider } from "@/context/AuthProvider";
import { BookContext } from "@/context/BookContext";
import Image from "next/image";
import Link from "next/link";
import { logout } from "@/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import useSWR from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }
  return res.json();
};

export default function RootLayout({ children }) {
  const [search, setSearch] = useState("");
  const { data: books, error, isLoading } = useSWR("/api/books", fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter((book) =>
      book.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, books]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthProvider>
      <BookContext.Provider
        value={{
          books: books || [],
          filteredBooks,
          search,
          setSearch,
          isLoading,
          error,
        }}
      >
        <div className="root-layout">
          <nav className="relative flex items-center h-16 px-4 border-b">
            <div className="absolute left-4">
              <Link
                href="/"
                className="flex items-center gap-2 hover:opacity-80 active:scale-95 transition"
              >
                <Image src="/logo.svg" alt="logo" width={100} height={40} />
              </Link>
            </div>
            <div className="relative absolute left-1/2 transform -translate-x-1/2 w-[300px]">
              <Input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-10 px-4 py-2 rounded-full border border-primary-100 text-primary-100"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary-100 pointer-events-none" />
            </div>
            <div className="absolute right-8 flex gap-6 items-center">
              <Link
                href="/my-books"
                className="text-primary-100 hover:text-white transition"
              >
                My Books
              </Link>
              <Link
                href="/about"
                className="text-primary-100 hover:text-white transition"
              >
                About
              </Link>
              <Link
                href="/settings"
                className="text-primary-100 hover:text-white transition"
              >
                Settings
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="text-primary-100 hover:text-white transition"
              >
                Logout
              </Button>
            </div>
          </nav>
          {children}
        </div>
      </BookContext.Provider>
    </AuthProvider>
  );
}
