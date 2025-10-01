<script setup>
import { ref } from "vue";
import { login } from "../authService";

const userLogin = ref("");
const password = ref("");
const currentUser = ref(null);

async function handleLogin() {
  try {
    const user = await login(userLogin.value, password.value);
    currentUser.value = user;
    alert(`Bienvenue ${user.firstName} ${user.lastName}`);
  } catch (e) {
    alert(e.message);
  }
}
</script>

<template>
  <div>
    <h2>Connexion</h2>
    <input v-model="userLogin" placeholder="Login (ex: John.Doe)" />
    <input v-model="password" type="password" placeholder="Mot de passe" />
    <button @click="handleLogin">Se connecter</button>

    <div v-if="currentUser">
      <p>Connecté en tant que {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
    </div>
  </div>
</template>
