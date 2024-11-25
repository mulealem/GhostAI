<template>
  <div class="w-full px-3 pt-2 pb-1 border-b-[1px] border-neutral-300">
    <v-textarea
      v-model="newPost"
      placeholder="What's on your mind?"
      rows="2"
      class="w-full"
      hide-details
    ></v-textarea>
    <div class="w-full flex flex-row justify-between items-center px-1 pt-1">
      <v-btn icon size="small" elevation="0" class="!text-blue-500">
        <v-icon> mdi-image-outline </v-icon>
      </v-btn>

      <div
        class="bg-blue-500 text-white px-5 py-1 rounded-full"
        @click="createPost"
      >
        Post
      </div>
    </div>
  </div>
</template>
<script>
import { supabase } from "@/lib/supabaseClient";
import { mapActions, mapState } from "pinia";
import { useFeedStore } from "@/stores/feedStore";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";

export default {
  data() {
    return {
      newPost: "",
    };
  },
  computed: {
    ...mapState(useUserStore, ["currentUser"]),
  },
  methods: {
    ...mapActions(useFeedStore, ["addUserPost"]),
    async createPost() {
      if (this.newPost.trim() === "") return;

      const { data, error } = await supabase
        .from("user_posts")
        .insert([
          {
            post: this.newPost,
          },
        ])
        .select();

      if (error) {
        console.error("Error creating post", error);
      } else {
        axios
          .post("https://ghost-commentor.deno.dev/", {
            post: this.newPost,
            id: data[0].id,
          })
          .then((res) => {
            console.log("commentor::>> ", res);
          })
          .catch((err) => {
            console.error(err);
          });
        this.addUserPost({
          id: data[0].id,
          post: this.newPost,
          isUserPost: true,
          bookmarks: 0,
          comments: 0,
          shares: 0,
          isBookmarked: false,
          username: "@" + this.currentUser?.user_metadata?.user_name,
          full_name: this.currentUser?.user_metadata?.full_name,
          avatar: this.currentUser?.user_metadata?.avatar_url,
        });
        this.newPost = "";
        // this.$store.feed.fetchPosts();
      }
    },
  },
};
</script>
