import { defineStore } from "pinia";

import { supabase } from "@/lib/supabaseClient";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    isAuthenticated: false,
  }),
  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },
  actions: {
    setUser(user) {
      this.user = user;
      this.isAuthenticated = true;
    },
    clearUser() {
      this.user = null;
      this.isAuthenticated = false;
    },
    async checkAuth() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      this.user = authUser;

      console.log("this.user", this.user);
    },
  },
});
