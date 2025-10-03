<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Login</h1>
    <input v-model="email" placeholder="Email" type="email" class="border p-2 mb-2 w-full" />
    <input v-model="password" placeholder="Mot de passe" type="password" class="border p-2 mb-2 w-full" />
    <button @click="login" class="bg-blue-500 text-white p-2 rounded w-full">Connexion</button>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const email = ref("");
const password = ref("");

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    alert("✅ Connecté avec succès !");
  } catch (err) {
    alert("❌ Erreur : " + err.message);
  }
};
</script>
