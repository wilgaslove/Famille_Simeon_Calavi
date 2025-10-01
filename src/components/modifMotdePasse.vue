<script setup>
import { ref } from "vue";
import { changePassword } from "../authService";

const userId = ref("ID_UTILISATEUR_CONNECTÉ"); // à récupérer après login
const newPassword = ref("");

async function handleChangePassword() {
  try {
    await changePassword(userId.value, newPassword.value);
    alert("Mot de passe changé avec succès !");
  } catch (e) {
    alert(e.message);
  }
}
</script>

<template>
  <div>
    <h2>Changer mot de passe</h2>
    <input v-model="newPassword" type="password" placeholder="Nouveau mot de passe" />
    <button @click="handleChangePassword">Changer</button>
  </div>
</template>
