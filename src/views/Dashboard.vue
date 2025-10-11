<script setup>
import { ref, onMounted } from 'vue'
import { db, auth } from '../firebase'
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

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
// 🔹 Vérification du rôle utilisateur
// ===============================
onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Lecture directe du document utilisateur
        const userDocRef = doc(db, 'users', user.uid)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          userRole.value = userDocSnap.data().role
          console.log('✅ Rôle détecté :', userRole.value)
        } else {
          userRole.value = 'Utilisateur'
          console.warn('Aucun rôle trouvé pour cet utilisateur.')
        }

        await chargerMembres()
      } catch (err) {
        console.error('Erreur lors du chargement du rôle :', err)
      }
    } else {
      console.warn('Aucun utilisateur connecté')
      userRole.value = null
    }
  })
})

</script>

<template>
  <div class="p-6">
  

    <div class="flex fixed top-0 left-0 w-full bg-white p-4 shadow-2xl xl:mx-[15%] xl:w-[70%]">
      <h1 class="text-xl font-bold lg:px-2 lg:bg-gray-200">
        {{ userRole }} {{ userNom }} {{ userPrenom }}
      </h1>
      <div class="ml-auto shadow-2xl"></div>
    </div>

    <div v-if="membres.length" class="mt-4">
      <!-- <h3 class="font-semibold mb-2"> Liste des membres</h3> -->
      <div class="text-center my-2">
        <strong class="text-lg mb-2"> 📋 Liste des membres</strong>
      </div>
      <ul>
        <li
          v-for="m in membres"
          :key="m.id"
          class="flex justify-between items-center border p-2 rounded bg-white shadow"
        >
          <span>{{ m.nom }} {{ m.prenom }}</span>
          <div class="flex gap-3 text-xl">
            <button
              @click="voirDetails(m)"
              class="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
            >
              Voir
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
    </div>
    <p v-else class="text-gray-500 mt-4">Aucun membre enregistré.</p>

    <!-- Formulaire ajout membre -->
    <div
      v-if="userRole === 'Admin' || userRole === 'SuperAdmin'"
      class="mt-6 mb-6 border p-4 rounded shadow bg-gray-50"
    >
      <h3 class="font-semibold mb-2">➕ Ajouter un membre</h3>
      <input v-model="nouveauMembre.nom" placeholder="Nom" class="border p-2 m-1 rounded w-full" />
      <input
        v-model="nouveauMembre.prenom"
        placeholder="Prénom"
        class="border p-2 m-1 rounded w-full"
      />
      <input
        type="date"
        v-model="nouveauMembre.dateAnniversaire"
        class="border p-2 m-1 rounded w-full"
      />
      <input
        v-model="nouveauMembre.pole"
        placeholder="Pôle"
        class="border p-2 m-1 rounded w-full"
      />
      <input
        v-model="nouveauMembre.requete"
        placeholder="Requête"
        class="border p-2 m-1 rounded w-full"
      />
      <textarea
        v-model="nouveauMembre.commentaire"
        placeholder="Commentaire"
        class="border p-2 m-1 rounded w-full"
      ></textarea>
      <button
        @click="ajouterMembre"
        class="bg-blue-600 text-white px-4 py-2 mt-2 rounded hover:bg-blue-700"
      >
        Ajouter
      </button>
    </div>

    <!-- Liste des membres -->

    <!-- Modal détails membre -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
    >
      <div class="bg-white p-6 rounded shadow-lg w-1/2">
        <h2 class="text-xl font-bold mb-4">Détails du membre</h2>

        <input v-model="selectedMembre.nom" class="border p-2 w-full mb-2 rounded" />
        <input v-model="selectedMembre.prenom" class="border p-2 w-full mb-2 rounded" />
        <input
          type="date"
          v-model="selectedMembre.dateAnniversaire"
          class="border p-2 w-full mb-2 rounded"
        />
        <input v-model="selectedMembre.pole" class="border p-2 w-full mb-2 rounded" />
        <textarea
          v-model="selectedMembre.requete"
          class="border p-2 w-full mb-2 rounded"
        ></textarea>
        <textarea
          v-model="selectedMembre.commentaire"
          class="border p-2 w-full mb-2 rounded"
        ></textarea>

        <div class="flex justify-end gap-2 mt-4">
          <button
            @click="modifierMembre"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Enregistrer
          </button>
          <button
            @click="showModal = false"
            class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
