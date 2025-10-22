<template>
  <div >
    <div >
      <h1 >
        
      </h1>

      <div >
        <input
          v-model="email"
          type="email"
          placeholder="Adresse e-mail"
          class="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
        />

        <input
          v-model="password"
          type="password"
          placeholder="Mot de passe"
          class="w-full px-4 py-2 bg-blue-50 border border-blue-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700"
        />

        <button
          @click="login"
          class="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-semibold transition duration-300"
        >
          Se connecter
        </button>

        <p v-if="errorMessage" class="text-red-500 text-center text-sm mt-2">
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
