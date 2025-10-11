<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 p-4">
    <div class="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-sm p-8 text-white">
      <h1 class="text-3xl font-bold text-center mb-6">🔥 Connexion</h1>
      <p class="text-center text-sm text-gray-200 mb-6">
        Accédez à votre espace sécurisé
      </p>

      <div class="flex flex-col gap-[5rem]">
        <input
          v-model="email"
          type="email"
          placeholder="Adresse e-mail"
          class="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-300 text-white focus:ring-2 focus:ring-blue-400 outline-none transition"
        />
        <input
          v-model="password"
          type="password"
          placeholder="Mot de passe"
          class="w-full px-4 py-3 rounded-lg bg-white/20 placeholder-gray-300 text-white focus:ring-2 focus:ring-blue-400 outline-none transition mt-[8rem]"
        />
        <div>
          <button
            @click="login"
            class="mt-[7rem] w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 font-semibold text-white shadow-md transition active:scale-95"
          >
            Connexion
          </button>
        </div>
        <p v-if="errorMessage" class="text-red-400 text-center text-sm mt-2">
          {{ errorMessage }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const router = useRouter();

const auth = getAuth();
const db = getFirestore();

const login = async () => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );

    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (userDoc.exists()) {
      const role = userDoc.data().role;
      localStorage.setItem("userRole", role);

      if (role === "SuperAdmin" || role === "Admin") {
        router.push("/dashboard");
      } else {
        router.push("/acces-refuse");
      }
    } else {
      errorMessage.value = "Compte introuvable dans Firestore.";
    }
  } catch (error) {
    errorMessage.value = "Identifiants invalides ou problème de connexion.";
  }
};
</script>
