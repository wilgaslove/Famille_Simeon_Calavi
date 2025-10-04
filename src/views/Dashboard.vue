<script setup>
import { ref, onMounted } from "vue";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Données
const membres = ref([]);
const nouveauMembre = ref({
  nom: "",
  prenom: "",
  dateAnniversaire: "",
  pole: "",
  requete: "",
  commentaire: "",
});
const userRole = ref(null);
const selectedMembre = ref(null);
const showModal = ref(false);

// Référence collection Firestore
const membresCollection = collection(db, "membres");

// Charger membres
const chargerMembres = async () => {
  const snapshot = await getDocs(membresCollection);
  membres.value = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Ajouter membre
const ajouterMembre = async () => {
  if (userRole.value === "Admin" || userRole.value === "SuperAdmin") {
    await addDoc(membresCollection, nouveauMembre.value);
    nouveauMembre.value = {
      nom: "",
      prenom: "",
      dateAnniversaire: "",
      pole: "",
      requete: "",
      commentaire: "",
    };
    chargerMembres();
  } else {
    alert("⛔ Accès refusé !");
  }
};

// Supprimer membre
const supprimerMembre = async (id) => {
  if (userRole.value === "SuperAdmin") {
    await deleteDoc(doc(db, "membres", id));
    chargerMembres();
  } else {
    alert("⛔ Seul le SuperAdmin peut supprimer !");
  }
};

// Modifier membre
const modifierMembre = async () => {
  if (userRole.value === "Admin" || userRole.value === "SuperAdmin") {
    const docRef = doc(db, "membres", selectedMembre.value.id);
    await updateDoc(docRef, { ...selectedMembre.value });
    showModal.value = false;
    chargerMembres();
  } else {
    alert("⛔ Accès refusé !");
  }
};

// Ouvrir modal détails
const voirDetails = (membre) => {
  selectedMembre.value = { ...membre };
  showModal.value = true;
};

// Vérification de l'utilisateur connecté
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Récupérer le document correspondant dans "users"
      const usersSnap = await getDocs(collection(db, "users"));
      const userDoc = usersSnap.docs.find((doc) => doc.data().uid === user.uid);
      if (userDoc) {
        userRole.value = userDoc.data().role; // ⚠️ ici .data() avant .role
        console.log("Rôle détecté :", userRole.value);
      } else {
        userRole.value = "Utilisateur";
      }
      chargerMembres();
    } else {
      console.warn("Aucun utilisateur connecté");
    }
  });
});
</script>

<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Dashboard</h2>
    <p>Votre rôle : <strong>{{ userRole || "Chargement..." }}</strong></p>

    <div v-if="userRole === 'Admin' || userRole === 'SuperAdmin'">
      ✅ Vous pouvez gérer les membres (CRUD)
    </div>
    <div v-else-if="userRole">
      ⛔ Vous n'avez pas accès à cette section 😎
    </div>

    <!-- Formulaire ajout membre -->
    <div v-if="userRole === 'Admin' || userRole === 'SuperAdmin'" class="mb-6">
      <input v-model="nouveauMembre.nom" placeholder="Nom" class="border p-2 m-1" />
      <input v-model="nouveauMembre.prenom" placeholder="Prénom" class="border p-2 m-1" />
      <input type="date" v-model="nouveauMembre.dateAnniversaire" class="border p-2 m-1" />
      <input v-model="nouveauMembre.pole" placeholder="Pôle" class="border p-2 m-1" />
      <input v-model="nouveauMembre.requete" placeholder="Requête" class="border p-2 m-1" />
      <textarea v-model="nouveauMembre.commentaire" placeholder="Commentaire" class="border p-2 m-1"></textarea>
      <button @click="ajouterMembre" class="bg-blue-500 text-white p-2 rounded">Ajouter</button>
    </div>

    <!-- Liste membres -->
    <ul>
      <li v-for="m in membres" :key="m.id" class="border p-2 flex justify-between mb-2 rounded">
        <span>{{ m.nom }} {{ m.prenom }}</span>
        <div>
          <button @click="voirDetails(m)" class="bg-gray-500 text-white px-2 py-1 rounded">Voir</button>
          <button
            v-if="userRole === 'SuperAdmin'"
            @click="supprimerMembre(m.id)"
            class="bg-red-500 text-white px-2 py-1 rounded ml-2"
          >
            Supprimer
          </button>
        </div>
      </li>
    </ul>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded shadow-lg w-1/2">
        <h2 class="text-xl font-bold mb-4">Détails du membre</h2>
        <input v-model="selectedMembre.nom" class="border p-2 w-full mb-2" />
        <input v-model="selectedMembre.prenom" class="border p-2 w-full mb-2" />
        <input type="date" v-model="selectedMembre.dateAnniversaire" class="border p-2 w-full mb-2" />
        <input v-model="selectedMembre.pole" class="border p-2 w-full mb-2" />
        <textarea v-model="selectedMembre.requete" class="border p-2 w-full mb-2"></textarea>
        <textarea v-model="selectedMembre.commentaire" class="border p-2 w-full mb-2"></textarea>

        <div class="flex justify-end gap-2">
          <button
            @click="modifierMembre"
            class="bg-green-500 text-white px-4 py-2 rounded"
          >
            Enregistrer
          </button>
          <button
            @click="showModal = false"
            class="bg-gray-400 text-white px-4 py-2 rounded"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
