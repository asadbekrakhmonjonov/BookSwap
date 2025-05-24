import { auth } from "@/lib/firebaseAdmin"; // adjust path if needed

export async function POST(request) {
  try {
    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: {
        "Set-Cookie": `session=${sessionCookie}; HttpOnly; Secure; Path=/; Max-Age=${expiresIn / 1000}; SameSite=Strict`,
        "Content-Type": "application/json",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
}
