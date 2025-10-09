// src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import { auth, db } from "../firebase";
import { getIdTokenResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import Login from "../components/Login.vue";
import Dashboard from "../views/Dashboard.vue";

const routes = [
  { path: "/", name: "Login", component: Login },
  { path: "/dashboard", name: "Dashboard", component: Dashboard, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

async function fetchRoleFromFirestore(uid) {
  try {
    const d = await getDoc(doc(db, "users", uid));
    if (d.exists()) return d.data().role;
    return null;
  } catch {
    return null;
  }
}

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth) return next();

  const user = auth.currentUser;
  if (!user) {
    return next({ name: "Login" });
  }

  try {
    const tokenResult = await getIdTokenResult(user);
    let role = tokenResult?.claims?.role ?? null;
    if (!role) role = await fetchRoleFromFirestore(user.uid);

    if (role === "Admin" || role === "SuperAdmin") return next();
    await auth.signOut();
    return next({ name: "Login" });
  } catch (e) {
    console.error("route guard error:", e);
    await auth.signOut();
    return next({ name: "Login" });
  }
});

export default router;
