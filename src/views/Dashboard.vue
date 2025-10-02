<script setup>
import { ref, onMounted } from "vue"
import { db } from "../firebase"
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore"
import { messaging } from "../firebase"
import { getToken, onMessage } from "firebase/messaging"

const members = ref([])
const showForm = ref(false)
const modalMember = ref(null)

const form = ref({
  firstName: "",
  lastName: "",
  birthday: "",
  service: "",
  prayerRequest: "",
  comment: ""
})

async function loadMembers() {
  const snap = await getDocs(collection(db, "membres"))
  members.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

async function saveMember() {
  // Ajouter birthMd pour notification
  const birthMd = form.value.birthday ? form.value.birthday.substring(5) : ""
  if (form.value.id) {
    // update
    await updateDoc(doc(db, "membres", form.value.id), { ...form.value, birthMd })
  } else {
    // create
    await addDoc(collection(db, "membres"), { ...form.value, birthMd })
  }
  form.value = { firstName:"", lastName:"", birthday:"", service:"", prayerRequest:"", comment:"" }
  showForm.value = false
  loadMembers()
}

function editMember(member) {
  form.value = { ...member }
  form.value.id = member.id
  showForm.value = true
}

async function deleteMember(id) {
  if (confirm("Voulez-vous supprimer ce membre ?")) {
    await deleteDoc(doc(db, "membres", id))
    loadMembers()
  }
}

function cancelForm() {
  form.value = { firstName:"", lastName:"", birthday:"", service:"", prayerRequest:"", comment:"" }
  showForm.value = false
}

function viewMember(member) {
  modalMember.value = member
}

// Notification anniversaire
const birthdayAlert = ref([])

async function checkBirthdays() {
  const today = new Date()
  today.setDate(today.getDate() + 1) // demain
  const mmdd = ("0"+(today.getMonth()+1)).slice(-2) + "-" + ("0"+today.getDate()).slice(-2)

  const snap = await getDocs(collection(db, "membres"))
  birthdayAlert.value = snap.docs
    .map(d => ({ id:d.id, ...d.data() }))
    .filter(m => m.birthMd === mmdd)

  if (birthdayAlert.value.length) {
    alert("🎉 Demain, anniversaire de: " + birthdayAlert.value.map(m => m.firstName + " " + m.lastName).join(", "))
  }
}

// FCM Token et permission
async function requestPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: "TA_VAPID_KEY" });
      console.log("Token FCM:", token);
      // Enregistrer ce token dans Firestore sous le user connecté pour envoyer les notifications
    } else {
      console.log("Permission refusée pour les notifications");
    }
  } catch (err) {
    console.error("Erreur permission notifications:", err);
  }
}


onMounted(() => {
  loadMembers()
  checkBirthdays()
   requestPermission();

  // Notifications reçues en temps réel (app ouverte)
  onMessage(messaging, (payload) => {
    console.log("Notification reçue:", payload);
    alert(payload.notification.title + "\n" + payload.notification.body);
  });
})
</script>


<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-4">Gestion des Membres</h2>

    <button @click="showForm = true" class="mb-4 bg-green-600 text-white p-2 rounded">Ajouter un membre</button>

    <!-- Formulaire d'ajout / édition -->
    <div v-if="showForm" class="mb-4 p-4 border rounded bg-gray-50">
      <input v-model="form.firstName" placeholder="Prénom" class="border p-1 m-1"/>
      <input v-model="form.lastName" placeholder="Nom" class="border p-1 m-1"/>
      <input v-model="form.birthday" type="date" class="border p-1 m-1"/>
      <input v-model="form.service" placeholder="Service" class="border p-1 m-1"/>
      <input v-model="form.prayerRequest" placeholder="Requête de prière" class="border p-1 m-1"/>
      <input v-model="form.comment" placeholder="Commentaire" class="border p-1 m-1"/>

      
      <button @click="saveMember" class="bg-blue-600 text-white p-1 m-1 rounded">Enregistrer</button>
      <button @click="cancelForm" class="bg-gray-400 text-white p-1 m-1 rounded">Annuler</button>
    </div>

    <!-- Liste des membres -->
    <table class="w-full border">
      <thead>
        <tr class="bg-gray-200">
          <th class="border p-2">Nom</th>
          <th class="border p-2">Prénom</th>
          <th class="border p-2">Service</th>
          <th class="border p-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in members" :key="member.id" class="border-b">
          <td class="p-2">{{ member.lastName }}</td>
          <td class="p-2">{{ member.firstName }}</td>
          <td class="p-2">{{ member.service }}</td>
          <td class="p-2 space-x-1">
            <button @click="editMember(member)" class="bg-yellow-500 text-white p-1 rounded">Modifier</button>
            <button @click="deleteMember(member.id)" class="bg-red-600 text-white p-1 rounded">Supprimer</button>
            <button @click="viewMember(member)" class="bg-blue-400 text-white p-1 rounded">Voir</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Modal -->
    <div v-if="modalMember" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div class="bg-white p-6 rounded w-96">
        <h3 class="font-bold text-xl mb-2">{{ modalMember.firstName }} {{ modalMember.lastName }}</h3>
        <p>Service: {{ modalMember.service }}</p>
        <p>Anniversaire: {{ modalMember.birthday }}</p>
        <p>Requête: {{ modalMember.prayerRequest }}</p>
        <p>Commentaire: {{ modalMember.comment }}</p>
        <button @click="modalMember=null" class="mt-3 bg-gray-400 text-white p-2 rounded">Fermer</button>
      </div>
    </div>
  </div>
</template>

