<template>
  <div class="bg-yellow-500">
    <input v-model="username" placeholder="Enter your username" />
    <img width="100" v-if="user" :src="getAvatarURL(username)" alt="avatar" />
    {{ user }}
    <button v-if="!user" @click="signInWithGitHub">Sign In with GitHub</button>
    <ul v-else>
      <li v-for="country in countries" :key="country.id">{{ country.name }}</li>
    </ul>
  </div>
</template>

<script>
import { supabase } from "@/lib/supabaseClient";

import { createAvatar } from "@dicebear/core";
import {
  lorelei,
  croodles,
  openPeeps,
  bottts,
  bigSmile,
  adventurer,
} from "@dicebear/collection";
export default {
  created() {
    this.checkAuth();
  },
  mounted() {
    this.getCountries();
  },
  data() {
    return {
      username: "",
      user: null,
      countries: [],
    };
  },
  methods: {
    getAvatarURL(username) {
      const svg = createAvatar(adventurer, {
        seed: username,
      });
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    },
    async getCountries() {
      const { data } = await supabase.from("countries").select();
      console.log(data);
      this.countries = data;
    },
    async checkAuth() {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      this.user = authUser;
      if (this.user) {
        this.getCountries();
      }
    },
    async signInWithGitHub() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
      });
      if (error) {
        console.error("Error signing in with GitHub:", error);
      } else {
        this.checkAuth();
      }
    },
  },
};
</script>
