"use client"

import React from "react";
import withAuth from "@/hoc/withAuth";

const AboutPage = () => {
  return (
    <div className="root-layout p-6 text-primary-100 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">About BookSwap</h1>
      <p className="mb-4">
        <strong>BookSwap</strong> {'is a community-driven platform designed to bring book lovers together through the joy of sharing. Whether you\'re looking to give your pre-loved paper books a new home or discover your next favorite read for free, BookSwap makes it easy.'}
      </p>

      <h2 className="text-2xl font-semibold mb-2">Our Mission</h2>
      <p className="mb-4">
        {'We believe in the power of stories and the importance of accessibility. BookSwap was built with a simple yet meaningful goal: to make it easier for people to swap and share physical books—no fees, no fuss, just connection through literature.'}
      </p>

      <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
      <ol className="list-decimal list-inside mb-4 space-y-2">
        <li>
          <strong>Upload Your Books:</strong>{' Users can post the books they’re ready to share or swap, along with a brief description and contact info.'}
        </li>
        <li>
          <strong>Browse & Connect:</strong>{' Other readers can explore listings, find books they’re interested in, and directly contact the owner to make a deal.'}
        </li>
        <li>
          <strong>Meet & Swap:</strong>{' Arrange a swap that works best for both parties—whether it’s in person, by mail, or any other way you prefer.'}
        </li>
      </ol>

      <h2 className="text-2xl font-semibold mb-2">Why BookSwap?</h2>
      <p className="mb-4">
        {'The idea for BookSwap came from a real need. As an avid reader, our creator often found it difficult to share and exchange books with others using modern web tools. Realizing there was no simple, dedicated space for this kind of book exchange, he decided to build one himself.'}
      </p>

      <p className="mb-6">
        {'BookSwap is more than just a site—it’s a movement to keep books in circulation and foster a deeper connection among readers.'}
      </p>

      <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
      <p className="mb-1">📞 Phone: +82 10-9860-2939</p>
      <p>
        📧 Email:{' '}
        <a href="mailto:rakhmonjonovasadbek8@gmail.com" className="underline">
          rakhmonjonovasadbek8@gmail.com
        </a>
      </p>
    </div>
  );
};

export default withAuth(AboutPage);
