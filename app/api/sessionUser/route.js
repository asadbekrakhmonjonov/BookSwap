import { getAuth } from "firebase-admin/auth";
import { verifyFirebaseToken } from "@/middleware/verifyFirebaseToken";

export async function GET(request) {
  const result = await verifyFirebaseToken(request);

  if (!result.success) {
    return new Response(JSON.stringify({ error: result.message }), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const userRecord = await getAuth().getUser(result.user.uid);

    return new Response(
      JSON.stringify({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
