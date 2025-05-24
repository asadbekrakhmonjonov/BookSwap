import { verifyFirebaseToken } from "@/middleware/verifyFirebaseToken";
import { db } from "@/lib/firebaseAdmin";
import uploadImage from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request) {
  const authResult = await verifyFirebaseToken(request);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.message }), {
      status: authResult.status,
    });
  }

  try {
    const formData = await request.formData();

    const data = {};
    formData.forEach((value, key) => {
      if (key !== "images") {
        data[key] = value;
      }
    });

    const files = formData.getAll("images");

    const uploadedImages = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        return await uploadImage(buffer);
      })
    );

    const imageUrls = uploadedImages.map((img) => img.url);
    const imagePublicIds = uploadedImages.map((img) => img.public_id);

    const bookData = {
      ...data,
      contactApp: data.contactApp || null,
      contactId: data.contactId || null,
      imageUrls,
      imagePublicIds,
      userId: authResult.user.uid,
      createdAt: new Date().toISOString(),
      public: data.public === "true" || false,
    };

    await db.collection("books").add(bookData);

    return new Response(JSON.stringify({ message: "Book added successfully" }), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to process book data" }), {
      status: 500,
    });
  }
}

export async function GET() {
  try {
    const snapshot = await db.collection("books").orderBy("createdAt", "desc").get();
    const books = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify(books), {
      status: 200,
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
      status: 500,
    });
  }
}
