<template>
  <div class="w-full h-full flex flex-col bg-white overflow-hidden">
    <div
      class="w-full flex items-center gap-3 font-bold p-3 border-b-[1px] border-neutral-300"
    >
      <v-icon size="24"> mdi-bookmark </v-icon>
      Bookmarks
    </div>
    <div class="w-full h-full overflow-hidden overflow-y-auto">
      <post v-for="(post, index) in bookmarkPosts" :key="index" :post="post" />
    </div>
  </div>
</template>
<script>
import { mapActions } from "pinia";

import { supabase } from "@/lib/supabaseClient";
import Post from "@/components/Post.vue";

export default {
  name: "BookmarkView",
  components: {
    Post,
  },
  mounted() {
    this.refresh();
  },
  data() {
    return {
      bookmarkPosts: [],
      isLoading: false,
    };
  },
  methods: {
    // ...mapActions
    async refresh() {
      this.isLoading = true;
      this.bookmarkPosts = [];

      const { data, error } = await supabase.from("user_bookmarks").select();
      // .select('post_id')
      // .eq('user_id', this.$store.user.id);

      if (error) {
        console.error(error);
        this.isLoading = false;
        return;
      }

      console.log("data", data);

      this.bookmarkPosts = data;
    },
  },
};
</script>
