"use client";

import React, { useContext } from "react";
import withAuth from "@/hoc/withAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import BookCard from "@/components/BookCard";
import { BookContext } from "../../context/BookContext";

function Page() {
  const { filteredBooks, loading, error } = useContext(BookContext);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Swap books online</h2>
          <p className="text-lg">Share second hand books and get some</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/add-book">Share books now</Link>
          </Button>
        </div>
        <Image src="/navbar.png" alt="navbar-logo" width={400} height={400} />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-primary-100">Books</h2>
        {loading && <p>Loading books...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {filteredBooks.length === 0 && !loading && !error && (
          <p className="text-gray-600">No books found.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <BookCard {...book} key={book.id} />
          ))}
        </div>
      </section>
    </>
  );
}

export default withAuth(Page);
