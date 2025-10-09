import { createRouter, createWebHistory } from "vue-router";
import Login from "@/components/Login.vue";
import Dashboard from "@/views/Dashboard.vue";
import AccesRefuse from "@/views/AccesRefuse.vue";

const routes = [
  { path: "/", name: "Login", component: Login },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true, role: "SuperAdmin" },
  },
  { path: "/acces-refuse", name: "AccesRefuse", component: AccesRefuse },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware de vérification du rôle
router.beforeEach((to, from, next) => {
  const role = localStorage.getItem("userRole");

  if (to.meta.requiresAuth && to.meta.role && role !== to.meta.role) {
    next("/acces-refuse");
  } else {
    next();
  }
});

export default router;
