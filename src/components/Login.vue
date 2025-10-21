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
          
        />

        <input
          v-model="password"
          type="password"
          placeholder="Mot de passe"
          
        />

        <button
          @click="login"
          
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
