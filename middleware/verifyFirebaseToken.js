import { admin } from "@/lib/firebaseAdmin";
import cookie from "cookie";

export async function verifyFirebaseToken(req) {
  try {
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    const sessionCookie = cookies.session || "";

    if (!sessionCookie) {
      return { success: false, message: "No session cookie provided", status: 401 };
    }

    const decodedToken = await admin.auth().verifySessionCookie(sessionCookie, true);
    return { success: true, user: decodedToken };
  } catch (error) {
    return { success: false, message: "Invalid or expired session cookie", status: 401 };
  }
}
