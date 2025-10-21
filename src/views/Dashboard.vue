<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { useRoute } from 'vue-router'

// ===============================
// 🔹 Variables réactives
// ===============================
const membres = ref([])
const nouveauMembre = ref({
  nom: '',
  prenom: '',
  dateAnniversaire: '',
  pole: '',
  requete: '',
  commentaire: '',
})
const userRole = ref(null)
const userNom = ref(null)
const userPrenom = ref(null)
const selectedMembre = ref(null)
const showModal = ref(false)
const showAddForm = ref(false)

// Référence de la collection Firestore
const membresCollection = collection(db, 'membres')

// ===============================
// 🔹 Charger les membres
// ===============================
const chargerMembres = async () => {
  try {
    const snapshot = await getDocs(membresCollection)
    membres.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
  } catch (error) {
    console.error('Erreur lors du chargement des membres :', error)
  }
}

// ===============================
// 🔹 Ajouter un membre
// ===============================
const ajouterMembre = async () => {
  if (userRole.value === 'Admin' || userRole.value === 'SuperAdmin') {
    try {
      await addDoc(membresCollection, nouveauMembre.value)
      nouveauMembre.value = {
        nom: '',
        prenom: '',
        dateAnniversaire: '',
        pole: '',
        requete: '',
        commentaire: '',
      }
      showAddForm.value = false
      await chargerMembres()
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error)
    }
  } else {
    alert('⛔ Accès refusé !')
  }
}

// ===============================
// 🔹 Supprimer un membre
// ===============================
const supprimerMembre = async (id) => {
  if (userRole.value === 'SuperAdmin') {
    try {
      await deleteDoc(doc(db, 'membres', id))
      await chargerMembres()
    } catch (error) {
      console.error('Erreur lors de la suppression :', error)
    }
  } else {
    alert('⛔ Seul le SuperAdmin peut supprimer !')
  }
}

// ===============================
// 🔹 Modifier un membre
// ===============================
const modifierMembre = async () => {
  if (userRole.value === 'Admin' || userRole.value === 'SuperAdmin') {
    try {
      const docRef = doc(db, 'membres', selectedMembre.value.id)
      await updateDoc(docRef, { ...selectedMembre.value })
      showModal.value = false
      await chargerMembres()
    } catch (error) {
      console.error('Erreur lors de la modification :', error)
    }
  } else {
    alert('⛔ Accès refusé !')
  }
}

// ===============================
// 🔹 Voir les détails (modal)
// ===============================
const voirDetails = (membre) => {
  selectedMembre.value = { ...membre }
  showModal.value = true
}

// ===============================
// 🔹 Déconnexion
// ===============================
 
// ===============================
// 🔹 Vérification du rôle utilisateur
// ===============================
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)
        if (userDocSnap.exists()) {
          userRole.value = userDocSnap.data().role
          await chargerMembres()
        } else {
          userRole.value = 'Utilisateur'
        }
      } catch (err) {
        console.error('Erreur rôle utilisateur :', err)
      }
    }
  })
})
</script>

<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- ✅ Barre du haut -->
    <div class="fixed top-0 left-0 w-full bg-white p-4 shadow-md flex justify-between items-center">
      <h1 class="font-bold text-lg">👤 {{ userRole || 'Utilisateur' }}</h1>
      <button
        v-if="userRole === 'Admin' || userRole === 'SuperAdmin'"
        @click="showAddForm = !showAddForm"
        class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
      >
        {{ showAddForm ? 'Fermer le formulaire' : '➕ Ajouter un membre' }}
      </button>
    </div>

    <div class="mt-24">
      <!-- ✅ Liste des membres -->
      <div class="text-center mb-4">
        <h2 class="text-xl font-bold">📋 Liste des membres</h2>
      </div>

      <ul class="space-y-3">
        <li
          v-for="m in membres"
          :key="m.id"
          class="flex justify-between items-center bg-white p-3 rounded shadow-sm hover:shadow-md transition"
        >
          <div>
            <span class="font-semibold">{{ m.nom }} {{ m.prenom }}</span>
            <p class="text-sm text-gray-500">{{ m.pole }}</p>
          </div>
          <div class="flex gap-2">
            <button
              @click="voirDetails(m)"
              class="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
            >
              Détails
            </button>
            <button
              v-if="userRole === 'SuperAdmin'"
              @click="supprimerMembre(m.id)"
              class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </li>
      </ul>

      <!-- ✅ Formulaire ajout membre -->
      <transition name="fade">
        <div
          v-if="showAddForm"
          class="mt-8 p-6 bg-white rounded shadow-md w-full md:w-2/3 mx-auto"
        >
          <h3 class="font-bold mb-3 text-blue-700">Ajouter un nouveau membre</h3>
          <div class="grid gap-3 md:grid-cols-2">
            <input v-model="nouveauMembre.nom" placeholder="Nom" class="border p-2 rounded" />
            <input v-model="nouveauMembre.prenom" placeholder="Prénom" class="border p-2 rounded" />
            <input type="date" v-model="nouveauMembre.dateAnniversaire" class="border p-2 rounded" />
            <input v-model="nouveauMembre.pole" placeholder="Pôle" class="border p-2 rounded" />
            <input v-model="nouveauMembre.requete" placeholder="Requête" class="border p-2 rounded col-span-2" />
            <textarea v-model="nouveauMembre.commentaire" placeholder="Commentaire" class="border p-2 rounded col-span-2"></textarea>
          </div>
          <button
            @click="ajouterMembre"
            class="bg-blue-600 text-white px-4 py-2 mt-4 rounded hover:bg-blue-700"
          >
            Ajouter
          </button>
        </div>
      </transition>
    </div>

    <!-- ✅ Modal détails membre -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg p-6 w-11/12 md:w-1/2 shadow-lg">
        <h2 class="text-xl font-bold text-blue-700 mb-4">Détails du membre</h2>
        <p><strong>Nom :</strong> {{ selectedMembre.nom }}</p>
        <p><strong>Prénom :</strong> {{ selectedMembre.prenom }}</p>
        <p><strong>Date de naissance :</strong> {{ selectedMembre.dateAnniversaire }}</p>
        <p><strong>Pôle :</strong> {{ selectedMembre.pole }}</p>
        <p><strong>Requête :</strong> {{ selectedMembre.requete }}</p>
        <p><strong>Commentaire :</strong> {{ selectedMembre.commentaire }}</p>

        <div class="flex justify-end gap-3 mt-6">
          <button
            v-if="userRole === 'Admin' || userRole === 'SuperAdmin'"
            @click="modifierMembre"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Modifier
          </button>
          <!-- <button
            @click="showModal = false"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Fermer
          </button> -->
        </div>
      </div>
    </div>

    <!-- ✅ Bouton de déconnexion -->
    <!-- <button
      @click="deconnect"
      class="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-700 transition"
    >
      Déconnexion
    </button> -->
  </div>
</template>

<style scoped>
/* .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
} */
</style>
