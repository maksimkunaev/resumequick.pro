import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseInit";
import { API_CONFIG } from '../api/config'

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    const token = await user.getIdToken();

    // User signed in successfully

    // 🔁 Зарегистрировать пользователя на сервере
    await fetch(`${API_CONFIG.baseUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    return user;
  } catch (error) {
    console.error("❌ Sign-in error:", error);
    throw error;
  }
}

export function listenToAuthChanges(callback) {
  onAuthStateChanged(auth, callback);
  // console.log("🔁 [AUTH_CHANGE] triggered",auth);
}

export async function signOutUser() {
  try {
    await signOut(auth);
    // User signed out
  } catch (error) {
    console.error("❌ Sign-out error:", error);
  }
}
