import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { app } from "./config";

const auth = getAuth(app);

export const signUp = async (email, password, name) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser && name) {
    await updateProfile(auth.currentUser, {
      displayName: name,
    });
  }
  return userCredential;
};

export const signIn = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await userCredential.user.getIdToken();

  await fetch("/api/sessionLogin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  return userCredential;
};

export const logout = async () => {
  await fetch("/api/sessionLogout", { method: "POST" });
  return await signOut(auth);
};

export const fetchProtectedData = async () => {
  const res = await fetch("/api/protected");
  if (!res.ok) throw new Error("Access denied");
  return await res.json();
};

export default auth;
