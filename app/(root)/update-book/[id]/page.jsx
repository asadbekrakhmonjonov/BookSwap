"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BookForm from "@/components/BookForm";
import { toast } from "sonner";
import auth from "@/firebase/auth";

export default function UpdateBookPage() {
  const params = useParams();
  const bookId = params.id;

  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBook() {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        const token = await currentUser.getIdToken();

        const res = await fetch(`/api/books/${bookId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to load book data");
        const data = await res.json();
        setBookData(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [bookId]);

  async function onUpdate(formData, token) {
    const dataObj = {};
    const images = [];

    for (const [key, value] of formData.entries()) {
      if (key === "images" && value instanceof File) {
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(value);
        });
        images.push(base64);
      } else if (key !== "images") {
        dataObj[key] = value;
      }
    }

    if (images.length > 0) {
      dataObj.images = images;
    }

    const res = await fetch(`/api/books/${bookId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dataObj),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.error || "Failed to update book");
  }

  if (loading) return <p>Loading...</p>;

  return <BookForm defaultValues={bookData} onSubmit={onUpdate} submitText="Update Book" />;
}
