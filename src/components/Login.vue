<script setup>
import { ref } from "vue";
import { signInWithEmailAndPassword, signOut, getIdTokenResult } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");
const router = useRouter();

async function fetchRoleFromFirestore(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid));
    if (d.exists()) return d.data().role;
    return null;
  } catch (e) {
    console.error("fetchRoleFromFirestore:", e);
    return null;
  }
}

async function login() {
  error.value = "";
  try {
    const cred = await signInWithEmailAndPassword(auth, email.value, password.value);

    // 1) Essaye les custom claims
    const idTokenResult = await getIdTokenResult(cred.user);
    let role = idTokenResult?.claims?.role ?? null;

    // 2) Fallback: si pas de claim, cherche dans users/{uid} (utile pour config initiale)
    if (!role) {
      role = await fetchRoleFromFirestore(cred.user.uid);
    }

    if (role !== "Admin" && role !== "SuperAdmin") {
      await signOut(auth);
      error.value = "Accès refusé — réservé aux Admins / SuperAdmins.";
      return;
    }

    // OK -> redirige vers le dashboard (ou route protégée)
    router.push({ name: "Dashboard" });
  } catch (e) {
    console.error(e);
    error.value = "Email ou mot de passe invalide.";
  }
}
</script>


<template>
  <div class="h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white shadow-lg p-6 rounded-xl w-96">
      <h2 class="text-2xl font-bold mb-4 text-center">Connexion Admin</h2>

      <form @submit.prevent="login" class="space-y-3">
        <input v-model="email" type="email" placeholder="Email" class="w-full p-2 border rounded" required />
        <input v-model="password" type="password" placeholder="Mot de passe" class="w-full p-2 border rounded" required />

        <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded">
          Se connecter
        </button>
      </form>

      <p v-if="error" class="text-red-500 mt-3">{{ error }}</p>
    </div>
  </div>
</template>

