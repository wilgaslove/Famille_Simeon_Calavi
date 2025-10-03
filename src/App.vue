<script setup>
import { ref, onMounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { getDocs, collection } from "firebase/firestore";
import { auth, db } from "./firebase";

const userRole = ref(null);
const currentUser = ref(null);

onMounted(() => {
   console.log("✅ Firebase connecté :", auth, db);
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser.value = user;

      // On récupère le rôle depuis Firestore
      const snapshot = await getDocs(collection(db, "users"));
      const currentUserDoc = snapshot.docs.find((doc) => doc.data().uid === user.uid);
      if (currentUserDoc) {
        userRole.value = currentUserDoc.data().role;
      }
    } else {
      currentUser.value = null;
      userRole.value = null;
    }
  });
});
</script>

<template>

     <h1 class="text-center mt-10 text-2xl font-bold">Test Firebase 🚀</h1>


  <div>
    <!-- Header simple -->
    <header class="bg-gray-800 text-white p-4">
      <h1 class="text-xl font-bold">Gestion du Groupe</h1>
      <p v-if="currentUser">Connecté en tant que : {{ currentUser.email }} ({{ userRole }})</p>
      <p v-else>Non connecté</p>
    </header>

    <!-- Les routes reçoivent le rôle -->
    <router-view :userRole="userRole" :currentUser="currentUser" />
  </div>
</template>
