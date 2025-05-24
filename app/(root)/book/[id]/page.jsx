"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import auth from "@/firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

const BookDetailPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : Array.isArray(params?.id) ? params.id[0] : null;

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
  if (!id) return;

  const fetchBook = async (token) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/books/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch book");
      }

      const data = await res.json();

      if (data.createdAt && data.createdAt._seconds) {
        data.createdAt = new Date(data.createdAt._seconds * 1000);
      } else if (typeof data.createdAt === "string" || data.createdAt instanceof Date) {
        data.createdAt = new Date(data.createdAt);
      } else {
        data.createdAt = null;
      }

      setBook(data);
      setCurrentImageIndex(0);
    } catch (err) {
      setError(err.message);
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    const token = user ? await user.getIdToken() : null;
    fetchBook(token);
  });

  return () => unsubscribe?.();
}, [id]);

 

  if (loading) return <div className="text-center text-xl text-gray-500">Loading book...</div>;
  if (error) return <div className="text-center text-xl text-red-600">Error: {error}</div>;
  if (!book) return <div className="text-center text-xl text-gray-500">Book not found</div>;

  const formattedDate = book.createdAt ? dayjs(book.createdAt).format("MMM D, YYYY") : "Unknown";

  const images = Array.isArray(book.imageUrls) && book.imageUrls.length > 0
    ? book.imageUrls
    : book.imageUrl
      ? [book.imageUrl]
      : ["/book.jpg"];

  const displayImageUrl = images[currentImageIndex] || "/book.jpg";

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const generateContactLink = () => {
    if (!book.contactApp || !book.contactId) return null;

    switch (book.contactApp.toLowerCase()) {
      case "whatsapp":
        return `https://wa.me/${book.contactId.replace(/\D/g, "")}`;
      case "gmail":
        return `mailto:${book.contactId}`;
      case "telegram":
        return `https://t.me/${book.contactId}`;
      case "instagram":
        return `https://instagram.com/${book.contactId}`;
      case "kakaotalk":
        return `https://open.kakao.com/o/${book.contactId}`;
      default:
        return null;
    }
  };

  const contactLink = generateContactLink();

  return (
    <div className="max-w-5xl mx-auto mt-16 px-6">
      <div className="rounded-2xl shadow-xl bg-white dark:bg-neutral-900 overflow-hidden">
        <div className="p-10">
          <div className="relative w-full h-[600px] rounded-2xl overflow-hidden mb-8">
            <Image
              src={displayImageUrl}
              alt={`${book.title || "Book"} cover`}
              width={1200}
              height={600}
              className="object-cover w-full h-full"
              priority
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-5 -translate-y-1/2 bg-black/50 hover:bg-black/70 transition p-3 rounded-full text-white"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-5 -translate-y-1/2 bg-black/50 hover:bg-black/70 transition p-3 rounded-full text-white"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}
          </div>

          <h2 className="text-4xl font-bold capitalize text-neutral-900 dark:text-white mb-6">
            {book.title || "Untitled"}
          </h2>

          <div className="space-y-4 text-neutral-700 dark:text-neutral-300 text-lg leading-relaxed">
            <p>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Author:</span>{" "}
              {book.author || "Unknown"}
            </p>
            <p>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Genre:</span>{" "}
              {book.genre || "Unknown"}
            </p>
            <p>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Condition:</span>{" "}
              {book.condition || "Unknown"}
            </p>
            <p>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Listed on:</span>{" "}
              {formattedDate}
            </p>
            <p>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">Visibility:</span>{" "}
              {book.public ? (
                <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-sm">
                  Public
                </span>
              ) : (
                <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-sm">
                  Private
                </span>
              )}
            </p>
            {book.description && (
              <p className="pt-4 whitespace-pre-wrap">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">Description:</span>
                <br />
                {book.description}
              </p>
            )}
            {contactLink && (
              <a
                href={contactLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-6 bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg text-center text-base"
              >
                Contact via {book.contactApp}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;
