import { verifyFirebaseToken } from "@/middleware/verifyFirebaseToken";
import { db } from "@/lib/firebaseAdmin";

export async function GET(request) {
  const authResult = await verifyFirebaseToken(request);

  if (!authResult.success) {
    return new Response(JSON.stringify({ error: authResult.message }), {
      status: authResult.status,
    });
  }

  try {
    const booksSnapshot = await db
      .collection("books")
      .where("userId", "==", authResult.user.uid)
      .get();

    const books = booksSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return new Response(JSON.stringify(books), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to fetch books" }), {
      status: 500,
    });
  }
}
