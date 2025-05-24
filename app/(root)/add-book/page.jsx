'use client';

import React from "react";
import withAuth from "@/hoc/withAuth";
import BookForm from "@/components/BookForm";
import { useRouter } from "next/navigation";

export default withAuth(function AddBookPage() {
  const router = useRouter();

  async function onAdd(formData, token) {
    const res = await fetch("/api/books", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to add book");

    router.push('/');
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Add Book</h1>
      <BookForm onSubmit={onAdd} submitText="Add Book" />
    </div>
  );
});
