<template>
  <div class="">
    <!-- <h1 class="text-3xl font-bold mb-6">Connexion</h1> -->
    <div class="flex flex-col gap-4">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
        class=""
      />
      <input
        v-model="password"
        type="password"
        placeholder="Mot de passe"
        class=""
      />
      <button
        @click="login"
        class=""
      >
        Connexion
      </button>
      <p v-if="errorMessage" class="">{{ errorMessage }}</p>
    </div>
  </div>
  <button @click="deconnect">Déconnexion</button>
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

      console.log("✅ Connecté avec succès :", user.email, "Rôle:", role);

      // Sauvegarde du rôle dans le localStorage pour usage global
      localStorage.setItem("userRole", role);

      // ✅ Redirection automatique selon le rôle
      if (role === "SuperAdmin") {
        router.push("/dashboard");
      } else if (role === "Admin") {
        router.push("/admin");
      } else {
        router.push("/acces-refuse");
      }
    } else {
      console.error("❌ Aucun document trouvé pour cet utilisateur !");
      errorMessage.value = "Compte introuvable dans Firestore.";
    }
  } catch (error) {
    console.error("❌ Erreur :", error);
    errorMessage.value = "Identifiants invalides ou problème de connexion.";
  }
};

const deconnect = () => {
  auth.signOut().then(() => {
    localStorage.removeItem("userRole");
    router.push("/login");
  });
};
</script>
