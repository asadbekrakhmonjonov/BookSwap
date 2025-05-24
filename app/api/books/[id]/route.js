import { verifyFirebaseToken } from "@/middleware/verifyFirebaseToken";
import { db } from "@/lib/firebaseAdmin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request, { params }) {
  const { id } = await params;
  const authResult = await verifyFirebaseToken(request);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.message }), {
      status: authResult.status,
    });
  }

  try {
    const docRef = db.collection("books").doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      return new Response(JSON.stringify({ error: "Book not found" }), {
        status: 404,
      });
    }

    const bookData = docSnapshot.data();

    if (!bookData.public && bookData.userId !== authResult.user.uid) {
      return new Response(JSON.stringify({ error: "Unauthorized access" }), {
        status: 403,
      });
    }

    return new Response(JSON.stringify({ id: docSnapshot.id, ...bookData }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch book" }), {
      status: 500,
    });
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const authResult = await verifyFirebaseToken(request);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.message }), {
      status: authResult.status,
    });
  }

  try {
    const docRef = db.collection("books").doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists || docSnapshot.data().userId !== authResult.user.uid) {
      return new Response(JSON.stringify({ error: "Book not found or unauthorized" }), {
        status: 404,
      });
    }

    const bookData = docSnapshot.data();
    const publicIds = Array.isArray(bookData.imagePublicIds) ? bookData.imagePublicIds : [];

    await Promise.all(
      publicIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId, { resource_type: "image" })
      )
    );

    await docRef.delete();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to delete book" }), {
      status: 500,
    });
  }
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const authResult = await verifyFirebaseToken(request);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.message }), {
      status: authResult.status,
    });
  }

  try {
    const docRef = db.collection("books").doc(id);
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists || docSnapshot.data().userId !== authResult.user.uid) {
      return new Response(JSON.stringify({ error: "Book not found or unauthorized" }), {
        status: 404,
      });
    }

    const oldData = docSnapshot.data();
    const body = await request.json();
    const newImages = body.images;

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    if (Array.isArray(newImages) && newImages.some(img => img && img.trim() !== "")) {
      const oldPublicIds = Array.isArray(oldData.imagePublicIds) ? oldData.imagePublicIds : [];

      await Promise.all(
        oldPublicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId, { resource_type: "image" }).catch(() => {})
        )
      );

      const uploadedResults = await Promise.all(
        newImages.map((image) =>
          cloudinary.uploader.upload(image, { folder: "books" })
        )
      );

      updateData.imageUrls = uploadedResults.map((result) => result.secure_url);
      updateData.imagePublicIds = uploadedResults.map((result) => result.public_id);
    } else {
      updateData.imageUrls = oldData.imageUrls;
      updateData.imagePublicIds = oldData.imagePublicIds;
    }

    await docRef.update(updateData);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to update book" }), {
      status: 500,
    });
  }
}
