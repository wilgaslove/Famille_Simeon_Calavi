<script setup>
import { ref, onMounted } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import { getDocs, collection } from "firebase/firestore";
import { auth, db } from "./firebase";

const userRole = ref(null);

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const snapshot = await getDocs(collection(db, "users"));
      const currentUser = snapshot.docs.find((doc) => doc.data().uid === user.uid);
      if (currentUser) {
        userRole.value = currentUser.data().role;
      }
    }
  });
});
</script>

<template>
  <router-view :userRole="userRole" />
</template>
