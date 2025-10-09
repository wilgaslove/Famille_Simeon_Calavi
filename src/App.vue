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
  <div id="app" class="min-h-screen bg-gray-100">
    <router-view :userRole="userRole" />
  </div>
</template>
