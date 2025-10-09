<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-gray-100">
    <h1 class="text-3xl font-bold mb-6">Connexion</h1>
    <div class="bg-white p-8 rounded shadow-md w-80">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class="border rounded w-full px-3 py-2 mb-3"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Mot de passe"
        class="border rounded w-full px-3 py-2 mb-3"
      />
      <button
        @click="login"
        class="bg-blue-600 text-white rounded w-full py-2 hover:bg-blue-700"
      >
        Connexion
      </button>
      <p v-if="errorMessage" class="text-red-500 mt-2 text-sm">{{ errorMessage }}</p>
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

      console.log("✅ Connecté avec succès :", user.email, "Rôle:", role);

      // Sauvegarde du rôle dans le localStorage pour usage global
      localStorage.setItem("userRole", role);

      // ✅ Redirection automatique selon le rôle
      if (role === "SuperAdmin") {
        router.push("/dashboard");
      } else if (role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/acces-refuse");
      }
    } else {
      console.error("❌ Aucun document trouvé pour cet utilisateur !");
      errorMessage.value = "Compte introuvable dans Firestore.";
    }
  } catch (error) {
    console.error("❌ Erreur :", error);
    errorMessage.value = "Identifiants invalides ou problème de connexion.";
  }
};
</script>
