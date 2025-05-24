"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import dayjs from "dayjs";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BookCard = ({
  id,
  createdAt,
  title,
  author,
  genre,
  imageUrls = [],
  condition,
  contactApp,
  contactId,
  onDelete,
  onUpdate,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [imageUrls]);

  let dateToFormat = Date.now();
  if (createdAt) {
    if (createdAt.toDate) {
      dateToFormat = createdAt.toDate();
    } else if (typeof createdAt === "string" || createdAt instanceof String) {
      dateToFormat = new Date(createdAt);
    } else {
      dateToFormat = createdAt;
    }
  }

  const formattedDate = dayjs(dateToFormat).format("MMM D, YYYY");
  const conditionText = condition ? condition.charAt(0).toUpperCase() + condition.slice(1) : "";
  const hasImages = Array.isArray(imageUrls) && imageUrls.length > 0;
  const displayImageUrl = hasImages ? imageUrls[currentImageIndex] : "/book.jpg";

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageUrls.length) return;
    setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageUrls.length) return;
    setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const generateContactLink = () => {
    if (!contactApp || !contactId) return null;

    switch (contactApp.toLowerCase()) {
      case "whatsapp":
        return `https://wa.me/${contactId.replace(/\D/g, "")}`;
      case "gmail":
        return `mailto:${contactId}`;
      case "telegram":
        return `https://t.me/${contactId}`;
      case "instagram":
        return `https://instagram.com/${contactId}`;
      case "kakaotalk":
        return `https://open.kakao.com/o/${contactId}`;
      default:
        return null;
    }
  };

  const contactLink = generateContactLink();

  return (
    <div className="relative group">
      <div className="card-border book-card relative cursor-pointer flex flex-col h-full">
        <div className="absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg bg-light-600 z-10">
          <p className="badge-text">{conditionText}</p>
        </div>

        <Link href={`/book/${id}`} className="relative w-full h-[300px] block">
          <Image
            src={displayImageUrl}
            alt={`${title}-cover`}
            width={420}
            height={300}
            className="w-full h-full object-cover rounded-lg"
          />
          {hasImages && imageUrls.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-3 transform -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-3 transform -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </Link>

        <h3 className="mt-5 text-xl font-semibold capitalize">{title}</h3>
        <div className="flex flex-col gap-2 text-sm text-light-100 mt-4 flex-grow">
          <div className="flex items-center gap-2">
            <Image src="/calendar.svg" alt="calendar" width={20} height={20} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex gap-1">
            <span className="font-semibold">Author:</span>
            <span>{author}</span>
          </div>
          <div className="flex gap-1">
            <span className="font-semibold">Genre:</span>
            <span>{genre}</span>
          </div>
        </div>

        {contactLink && (
          <a
            href={contactLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm text-center w-full block text-nowrap"
          >
            Contact via {contactApp}
          </a>
        )}

        {(onDelete || onUpdate) && (
          <div className="mt-4 self-end flex gap-2">
            {onUpdate && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onUpdate();
                }}
                className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-1 text-sm rounded"
              >
                Update
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete();
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
