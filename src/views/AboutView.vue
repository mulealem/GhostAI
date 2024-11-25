<template>
  <div class="w-full h-screen flex flex-row justify-center bg-neutral-100">
    <div class="w-full h-full flex flex-row max-w-4xl">
      <div
        class="w-72 h-full flex flex-col flex-none bg-neutral-100 border-r-[1px] overflow-hidden"
      >
        <div
          class="w-full flex flex-row items-center gap-3 px-3 py-2 border-b-[1px] border-neutral-300"
        >
          <img src="../assets/ghost.png" alt="profile" class="w-8 h-8" />
          <div>
            <div class="text- text-base font-bold">Ghost AI</div>
            <div class="text- text-sm">Real you, unreal interactions</div>
          </div>
        </div>
        <div class="w-full h-full flex flex-col overflow-hidden">
          <div class="px-3 py-2">Articles</div>
          <div class="w-full flex flex-col overflow-auto gap-2 pr-2">
            <div v-for="(article, index) in articles" :key="index">
              <div
                class="p-3 border-b-[0px] border-neutral-300 bg-neutral-200 rounded-md text-sm"
              >
                {{ article }}
              </div>
            </div>
          </div>
          <!-- {{ articles }} -->
        </div>
      </div>
      <div class="w-full min-w-3xl h-full bg-white overflow-auto">
        <div
          class="w-full flex flex-row gap-3 px-3 py-3 border-b-[1px] border-neutral-300"
          v-for="(post, index) in posts"
          :key="index"
        >
          <div class="p3">
            <div
              class="w-10 h-10 border-pink-500 border-[2px] rounded-full p-p2xp"
            >
              <img :src="getAvatarURL(post.username)" alt="avatar" />
            </div>
          </div>
          <div class="w-full flex flex-col">
            <div class="w-full flex gap-1">
              <span class="font-bold">
                {{ post.full_name }}
              </span>
              <span>
                {{ post.username }}
              </span>
            </div>
            <div class="pb-2">
              <div>
                {{ post.post }}
              </div>
              <div v-if="post.image">
                <img :src="post.image" alt="post image" class="rounded-lg" />
              </div>
            </div>
            <div class="w-full flex justify-start gap-5">
              <!-- <v-btn color="primary">Follow</v-btn> -->
              <div class="text-sm flex items-center gap-2">
                <v-icon size="16"> mdi-bookmark-outline </v-icon>
                {{ post.bookmarks }}
                <!-- bookmarks 10 -->
              </div>
              <div class="text-sm flex items-center gap-2">
                <v-icon size="16"> mdi-comment-outline </v-icon>
                {{ post.comments }}
                <!-- comments 25 -->
              </div>
              <div class="text-sm flex items-center gap-2">
                <v-icon size="16"> mdi-share-variant </v-icon>
                {{ post.shares }}
                <!-- shares 38 -->
              </div>
            </div>
          </div>
        </div>
        <div class="w-full flex justify-center items-center p-3">
          <v-progress-circular
            v-if="isLoading"
            color="primary"
            indeterminate
          ></v-progress-circular>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { createAvatar } from "@dicebear/core";

import {
  lorelei,
  croodles,
  openPeeps,
  bottts,
  bigSmile,
  adventurer,
} from "@dicebear/collection";
import axios from "axios";
export default {
  name: "AboutView",
  mounted() {
    this.refresh();
  },
  data() {
    return {
      posts: [],
      isLoading: false,
    };
  },
  computed: {
    articles() {
      // unique articles
      let allArticle = this.posts.map((post) => post?.article?.title);

      const uniqueArticles = [...new Set(allArticle)];
      return uniqueArticles;
    },
  },
  methods: {
    getAvatarURL(username) {
      const svg = createAvatar(adventurer, {
        seed: username,
      });
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    },
    refresh() {
      // axios.get("https://jsonplaceholder.typicode.com/posts").then((res) => {
      //   console.log(res.data);
      //   this.posts = res.data;
      // }).catch((err) => {
      //   console.error(err);
      // });

      this.isLoading = true;

      const data = {
        categories: ["politics"],
      };

      axios
        .post("http://localhost:8000/", data)
        .then((res) => {
          console.log(res.data);
          this.posts = res.data.socialMediaPosts;
          console.log(this.posts);
          this.isLoading = false;
        })
        .catch((err) => {
          console.error(err);
          this.isLoading = false;
        });
    },
  },
};
</script>
