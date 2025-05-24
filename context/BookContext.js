"use client";

import React, { createContext, useState, useMemo } from "react";
import useSWR from 'swr';

const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('Failed to fetch data');
    throw error;
  }
  return res.json();
};

export const BookContext = createContext();

export function BookProvider({ children }) {
  const [search, setSearch] = useState("");
  const { data: books, error, isLoading } = useSWR('/api/books', fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });
  
  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books.filter((book) =>
      book.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, books]);

  return (
    <BookContext.Provider
      value={{ 
        books: books || [], 
        filteredBooks, 
        search, 
        setSearch, 
        isLoading, 
        error 
      }}
    >
      {children}
    </BookContext.Provider>
  );
}