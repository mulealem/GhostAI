<template>
  <div
    class="w-full flex flex-row gap-3 px-3 py-3 border-b-[1px] border-neutral-300"
  >
    <div class="p3">
      <div
        class="w-10 h-10 border-neutral-300 border-[1px] rounded-full p-0 overflow-hidden"
      >
        <img v-if="post.isUserPost" :src="post.avatar" alt="avatar" />
        <img v-else :src="getAvatarURL(post.username)" alt="avatar" />
      </div>
    </div>
    <div class="w-full flex flex-col">
      <div class="w-full flex justify-between items-center">
        <div class="w-full flex items-center gap-1">
          <span class="font-bold">
            {{ post.full_name }}
          </span>
          <span>
            {{ post.username }}
          </span>
          <span class="text-neutral-700">
            {{ post.date }}
          </span>
        </div>
        <div class="opacity-85">
          <v-icon size="16"> mdi-dots-horizontal </v-icon>
        </div>
      </div>
      <div class="pb-2" @click="isCommentsVisible = !isCommentsVisible">
        <div>
          {{ post.post }}
        </div>
        <div v-if="post.image" class="py-2">
          <img :src="post.image" alt="post image" class="rounded-lg" />
        </div>
      </div>
      <div class="w-full flex justify-start gap-5">
        <!-- <v-btn color="primary">Follow</v-btn> -->
        <div
          class="text-sm flex items-center gap-2"
          :class="{ '!text-blue-500': post.isBookmarked }"
          @click="bookmarkPost()"
        >
          <v-icon size="20">
            {{ post.isBookmarked ? "mdi-bookmark" : "mdi-bookmark-outline" }}
          </v-icon>
          {{ post.bookmarks }}
          <!-- bookmarks 10 -->
        </div>
        <div class="text-sm flex items-center gap-2" @click="commentPost()">
          <v-icon size="20"> mdi-comment-outline </v-icon>
          {{ post.comments }}
          <!-- comments 25 -->
        </div>
        <div class="text-sm flex items-center gap-2" @click="sharePost()">
          <v-icon size="20"> mdi-share-variant </v-icon>
          {{ post.shares }}
          <!-- shares 38 -->
        </div>
      </div>
    </div>
  </div>
  <div
    v-if="isCommentsVisible"
    class="w-full h-full absolute bottom-0 right-0 z-50 bg-neutral-900 opacity-70"
  ></div>
  <div
    v-if="isCommentsVisible"
    class="w-full h-96 flex flex-col absolute bottom-0 right-0 z-50 bg-white rounded-t-xl"
  >
    <div class="w-full flex flex-row justify-between px-3 py-2">
      <div>
        <div class="text-lg font-bold p-3">Comments</div>
      </div>
      <div>
        <div
          @click="isCommentsVisible = !isCommentsVisible"
          class="text-lg font-bold p-3 cursor-pointer"
        >
          Close
        </div>
      </div>
    </div>
    <div class="w-full h-full flex flex-col overflow-auto">
      <div
        class="w-full flex flex-row gap-3 px-3 py-3 border-b-[1px] border-neutral-300"
        v-for="(ai_comment, index) in post.ai_comments"
      >
        <div class="p3">
          <div
            class="w-10 h-10 border-neutral-300 border-[1px] rounded-full p-0 overflow-hidden"
          >
            <img :src="getAvatarURL(ai_comment.username)" alt="avatar" />
          </div>
        </div>
        <div class="w-full flex flex-col">
          <div class="w-full flex justify-between items-center">
            <div class="w-full flex gap-1">
              <span class="font-bold">
                {{ ai_comment.full_name }}
              </span>
              <span>
                {{ ai_comment.username }}
              </span>
            </div>
            <div class="opacity-85">
              <v-icon size="16"> mdi-dots-horizontal </v-icon>
            </div>
          </div>
          <div class="pb-2">
            <div>
              {{ ai_comment.post }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useFeedStore } from "@/stores/feedStore";
import { mapActions } from "pinia";

import { supabase } from "@/lib/supabaseClient";

export default {
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      isCommentsVisible: false,
    };
  },
  methods: {
    ...mapActions(useFeedStore, ["getAvatarURL", "toggleBookmark"]),

    commentPost() {
      console.log("comment", this.post);
    },
    async bookmarkPost() {
      console.log("bookmark", this.post);
      this.toggleBookmark(this.post.id);

      const { data, error } = await supabase.from("user_bookmarks").insert({
        post: this.post.post,
        username: this.post.username,
        full_name: this.post.full_name,
        bookmarks: this.post.bookmarks,
        comments: this.post.comments,
        shares: this.post.shares,
        image: this.post.image,
        article: this.post.article,
      });

      if (error) {
        console.error("Error bookmarking post:", error);
      } else {
        console.log("Bookmarked post:", data);
      }
    },
    sharePost() {
      console.log("share", this.post);
    },
  },
};
</script>
