// authService.js
import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import CryptoJS from "crypto-js";

// Hasher un mot de passe
function hashPassword(password) {
  return CryptoJS.SHA256(password).toString();
}

// Création d’un utilisateur (par un admin)
export async function createUser(userLogin, password, firstName, lastName, role = "user") {
  const hashedPassword = hashPassword(password);

  await addDoc(collection(db, "users"), {
    userLogin,
    password: hashedPassword,
    firstName,
    lastName,
    role,
    createdAt: new Date()
  });
}

// Connexion
export async function login(userLogin, password) {
  const hashedPassword = hashPassword(password);

  const q = query(
    collection(db, "users"),
    where("userLogin", "==", userLogin),
    where("password", "==", hashedPassword)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    throw new Error("Login ou mot de passe incorrect");
  }

  const user = querySnapshot.docs[0];
  return { id: user.id, ...user.data() };
}

// Modification du mot de passe
export async function changePassword(userId, newPassword) {
  const hashedPassword = hashPassword(newPassword);

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { password: hashedPassword });
}
