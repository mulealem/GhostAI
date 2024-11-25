import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

import PrefernceView from "@/views/PrefernceView.vue";
import CategorySelectionView from "@/views/CategorySelectionView.vue";
import LoginView from "@/views/LoginView.vue";
import SearchView from "@/views/SearchView.vue";
import BookmarkView from "@/views/BookmarkView.vue";
import Index from "@/views/Index.vue";
import { useUserStore } from "@/stores/userStore";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      // name: "home",
      component: Index,
      children: [
        {
          path: "",
          name: "home",
          component: HomeView,
        },
        {
          path: "preferences",
          name: "preferences",
          component: PrefernceView,
        },
        {
          path: "bookmark",
          name: "bookmark",
          component: BookmarkView,
        },
        {
          path: "search",
          name: "search",
          component: SearchView,
        },
      ],
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  if (to.name !== "login" && !userStore.currentUser) {
    next({ name: "login" });
  } else {
    next();
  }
});

export default router;
