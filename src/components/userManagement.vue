<script setup>
import { ref, onMounted } from "vue";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

const email = ref("");
const password = ref("");
const role = ref("Member");

const userRole = ref(null); // rôle de l'utilisateur connecté
const usersCollection = collection(db, "users");

const creerUtilisateur = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const newUser = userCredential.user;

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
    alert("❌ Erreur : " + error.message);
  }
};

// Récupérer le rôle du user connecté
onMounted(async () => {
  const snapshot = await getDocs(usersCollection);
  const currentUser = snapshot.docs.find((doc) => doc.data().uid === auth.currentUser?.uid);
  if (currentUser) {
    userRole.value = currentUser.data().role;
  }
});
</script>

<template>
  <div v-if="userRole === 'Admin' || userRole === 'SuperAdmin'" class="p-4 border rounded-lg bg-gray-100">
    <h2 class="text-lg font-bold mb-2">Créer un utilisateur</h2>
    <input v-model="email" placeholder="Email" type="email" class="border p-2 mb-2 w-full" />
    <input v-model="password" placeholder="Mot de passe" type="password" class="border p-2 mb-2 w-full" />

    <!-- Sélection du rôle avec restriction -->
    <select v-model="role" class="border p-2 mb-2 w-full">
      <option value="Member">Member</option>
      <option v-if="userRole === 'SuperAdmin'" value="Admin">Admin</option>
      <option v-if="userRole === 'SuperAdmin'" value="SuperAdmin">SuperAdmin</option>
    </select>

    <button @click="creerUtilisateur" class="bg-blue-500 text-white p-2 rounded w-full">
      ➕ Créer l'utilisateur
    </button>
  </div>

  <!-- Si Member, on bloque -->
  <div v-else class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
    ⛔ Vous n'avez pas accès à la création d'utilisateurs.
  </div>
</template>
