import { NextResponse } from "next/server";
import { verifyFirebaseToken } from "@/middleware/verifyFirebaseToken";
import { getAuth } from "firebase-admin/auth";

export async function GET(request) {
  const result = await verifyFirebaseToken(request);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  const user = result.user;

  return NextResponse.json({
    message: "Protected data",
    email: user.email || null,
    uid: user.uid,
    displayName: user.name || user.displayName || null,
  });
}

export async function PATCH(request) {
  const result = await verifyFirebaseToken(request);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  const { uid } = result.user;
  const body = await request.json();

  const updateData = {};
  if (body.email) updateData.email = body.email;
  if (body.displayName) updateData.displayName = body.displayName;
  if (body.password) updateData.password = body.password;

  try {
    const updatedUser = await getAuth().updateUser(uid, updateData);

    return NextResponse.json({
      message: "User updated successfully",
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
      },
    });
  } catch (error) {
    console.error("User update failed:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
  const result = await verifyFirebaseToken(request);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: result.status });
  }

  const { uid } = result.user;

  try {
    await getAuth().deleteUser(uid);
    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("User deletion failed:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
