<script setup>
import { ref, onMounted } from "vue"
import { db, auth } from "../firebase"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc} from "firebase/firestore"

  // gestion de role
const userRole = ref(null)
const accessDenied = ref(false)
// Vérifie le rôle de l’utilisateur connecté
async function checkRole(user) {
  const snap = await getDoc(doc(db, "users", user.uid))
  if (snap.exists()) {
    userRole.value = snap.data().role
    if (userRole.value !== "Admin" && userRole.value !== "SuperAdmin") {
      accessDenied.value = true
      await signOut(auth) // déconnexion automatique si non autorisé
    } else {
      fetchMembres()
    }
  } else {
    accessDenied.value = true
    await signOut(auth)
  }
}

// Références
const membres = ref([])
const newMembre = ref({ firstName: "", lastName: "", birthday: "", service: "", request: "", comment: "" })
const selectedMembre = ref(null) // pour le modal
const showModal = ref(false)

// Charger les membres
async function fetchMembres() {
  membres.value = []
  const snap = await getDocs(collection(db, "membres"))
  snap.forEach((d) => {
    membres.value.push({ id: d.id, ...d.data() })
  })
}

// Ajouter un membre
async function addMembre() {
  if (!newMembre.value.firstName || !newMembre.value.lastName) return
  await addDoc(collection(db, "membres"), newMembre.value)
  newMembre.value = { firstName: "", lastName: "", birthday: "", service: "", request: "", comment: "" }
  fetchMembres()
}

// Modifier un membre
async function updateMembre(m) {
  const docRef = doc(db, "membres", m.id)
  await updateDoc(docRef, {
    firstName: m.firstName,
    lastName: m.lastName,
    birthday: m.birthday,
    service: m.service,
    request: m.request,
    comment: m.comment
  })
  fetchMembres()
}

// Supprimer un membre
async function deleteMembre(id) {
  await deleteDoc(doc(db, "membres", id))
  fetchMembres()
}

// Ouvrir modal
function openModal(membre) {
  selectedMembre.value = { ...membre }
  showModal.value = true
}

// Fermer modal
function closeModal() {
  showModal.value = false
  selectedMembre.value = null
}



onMounted(() => {
  fetchMembres(),
  onAuthStateChanged(auth, (user) => {
    if (user) {
      checkRole(user)
    } else {
      accessDenied.value = true
    }
  })
})
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <!-- Accès refusé -->
    <div v-if="accessDenied" class="p-6 bg-red-200 text-red-800 font-bold rounded-lg">
      ❌ Accès refusé — réservé aux Admins et SuperAdmins
    </div>

    <!-- Dashboard -->
    <div v-else>
      <h1 class="text-2xl font-bold mb-4">Gestion des Membres</h1>

      <!-- Formulaire ajout -->
      <div class="mb-6 p-4 border rounded-lg shadow bg-white">
        <h2 class="text-lg font-semibold mb-2">Ajouter un membre</h2>
        <div class="grid grid-cols-2 gap-4">
          <input v-model="newMembre.firstName" placeholder="Prénom" class="p-2 border rounded" />
          <input v-model="newMembre.lastName" placeholder="Nom" class="p-2 border rounded" />
          <input v-model="newMembre.birthday" type="date" class="p-2 border rounded" />
          <input v-model="newMembre.service" placeholder="Pôle de service" class="p-2 border rounded" />
          <input v-model="newMembre.request" placeholder="Requête de prière" class="p-2 border rounded col-span-2" />
          <textarea v-model="newMembre.comment" placeholder="Commentaire" class="p-2 border rounded col-span-2"></textarea>
        </div>
        <button @click="addMembre" class="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          ➕ Ajouter
        </button>
      </div>

      <!-- Liste des membres -->
      <h2 class="text-lg font-semibold mb-3">Liste des membres</h2>
      <table class="w-full border-collapse">
        <thead>
          <tr class="bg-gray-200">
            <th class="p-2 border">Nom</th>
            <th class="p-2 border">Anniversaire</th>
            <th class="p-2 border">Service</th>
            <th class="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in membres" :key="m.id" class="hover:bg-gray-50">
            <td class="p-2 border">{{ m.firstName }} {{ m.lastName }}</td>
            <td class="p-2 border">{{ m.birthday }}</td>
            <td class="p-2 border">{{ m.service }}</td>
            <td class="p-2 border flex gap-2">
              <button @click="openModal(m)" class="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">👀 Voir</button>
              <button @click="updateMembre(m)" class="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">✏️ Modifier</button>
              <button @click="deleteMembre(m.id)" class="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700">🗑️ Supprimer</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Modal -->
      <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 class="text-xl font-bold mb-3">Détails du membre</h2>
          <p><strong>Nom :</strong> {{ selectedMembre.firstName }} {{ selectedMembre.lastName }}</p>
          <p><strong>Anniversaire :</strong> {{ selectedMembre.birthday }}</p>
          <p><strong>Service :</strong> {{ selectedMembre.service }}</p>
          <p><strong>Requête :</strong> {{ selectedMembre.request }}</p>
          <p><strong>Commentaire :</strong> {{ selectedMembre.comment }}</p>

          <div class="mt-4 flex justify-end gap-2">
            <button @click="closeModal" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Fermer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
