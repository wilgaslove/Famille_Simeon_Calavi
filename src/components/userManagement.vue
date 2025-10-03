<script setup>
import { ref } from "vue";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const email = ref("");
const password = ref("");
const role = ref("Member");

const usersCollection = collection(db, "users");

const creerUtilisateur = async () => {
  try {
    // 1. Créer compte dans Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const newUser = userCredential.user;

    // 2. Sauvegarder rôle dans Firestore
    await addDoc(usersCollection, {
      uid: newUser.uid,
      email: email.value,
      role: role.value,
      createdAt: serverTimestamp(),
    });

    alert("✅ Utilisateur créé avec succès !");
    email.value = "";
    password.value = "";
    role.value = "Member";
  } catch (error) {
    console.error("Erreur création utilisateur:", error.message);
    alert("❌ Erreur : " + error.message);
  }
};
</script>

<template>
  <div class="p-4 border rounded-lg bg-gray-100">
    <h2 class="text-lg font-bold mb-2">Créer un utilisateur</h2>
    <input v-model="email" placeholder="Email" type="email" class="border p-2 mb-2 w-full" />
    <input v-model="password" placeholder="Mot de passe" type="password" class="border p-2 mb-2 w-full" />

    <!-- Sélection du rôle -->
    <select v-model="role" class="border p-2 mb-2 w-full">
      <option value="Member">Member</option>
      <option value="Admin">Admin</option>
      <option value="SuperAdmin">SuperAdmin</option>
    </select>

    <button @click="creerUtilisateur" class="bg-blue-500 text-white p-2 rounded w-full">
      ➕ Créer l'utilisateur
    </button>
  </div>
</template>
