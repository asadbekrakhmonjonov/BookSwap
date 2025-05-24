"use client";

import React, { useEffect, useState, useContext, useMemo } from "react";
import withAuth from "@/hoc/withAuth";
import BookCard from "@/components/BookCard";
import auth from "@/firebase/auth";
import { useRouter } from "next/navigation";
import { BookContext } from "../../../context/BookContext"; // adjust if needed

function Page() {
  const { search } = useContext(BookContext);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        const token = await currentUser.getIdToken();

        const res = await fetch("/api/books/user", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user books");

        const data = await res.json();
        setBooks(data);
      } catch (err) {
        setError("Error fetching your books.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  const handleDelete = async (bookId) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("User not authenticated");

      const token = await currentUser.getIdToken();

      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete book");

      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== bookId));
    } catch (err) {
      console.error("Failed to delete book:", err);
      alert("Something went wrong while deleting the book.");
    }
  };

  const handleUpdate = (bookId) => {
    router.push(`/update-book/${bookId}`);
  };

  const filteredBooks = useMemo(() => {
    return books.filter((book) =>
      book.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [books, search]);

  if (loading) {
    return <div className="text-center mt-10">Loading your books...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 mt-10">{error}</div>;
  }

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Books</h1>

      {filteredBooks.length === 0 ? (
        <p className="text-gray-400">No books match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              {...book}
              onDelete={() => handleDelete(book.id)}
              onUpdate={() => handleUpdate(book.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default withAuth(Page);
