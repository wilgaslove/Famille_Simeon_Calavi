<template>
<div class="p-4">
<h2>Créer un utilisateur (admin)</h2>


<input v-model="userLogin" placeholder="Login (ex: John.Doe)" />
<input v-model="firstName" placeholder="Prénom" />
<input v-model="lastName" placeholder="Nom" />
<input v-model="password" type="password" placeholder="Mot de passe temporaire" />
<select v-model="role">
<option value="user">User</option>
<option value="admin">Admin</option>
</select>
<button @click="handleCreate">Créer</button>


<p v-if="message">{{ message }}</p>
</div>
</template>


<script setup>
import { ref } from "vue";
import { createUserAdmin } from "../services/authService";


const userLogin = ref("");
const password = ref("");
const firstName = ref("");
const lastName = ref("");
const role = ref("user");
const message = ref("");


async function handleCreate() {
try {
await createUserAdmin({ userLogin: userLogin.value, password: password.value, firstName: firstName.value, lastName: lastName.value, role: role.value });
message.value = "Utilisateur créé !";
userLogin.value = password.value = firstName.value = lastName.value = "";
} catch (e) {
message.value = e.message;
}
}
</script>