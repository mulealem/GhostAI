<template>
  <div class="w-full h-full flex flex-col bg-white overflow-hidden">
    <div
      class="w-full h-16 px-3 flex flex-row items-center border-b-[1px] border-neutral-300 overflow-hidden"
    >
      <v-text-field
        v-model="searchTerm"
        label="Search"
        variant="outlined"
        density="compact"
        class="w-full"
        hide-details
        append-inner-icon="mdi-magnify"
        @click:append-inner="onClick"
        clearable
        rounded
      ></v-text-field>
    </div>
    <div
      class="w-full min-w-3xl h-full bg-white overflow-hidden overflow-y-auto"
      @scroll="onScroll"
    >
      <div
        class="w-full flex flex-row gap-3 px-3 py-3 border-b-[1px] border-neutral-300"
        v-for="(post, index) in currenPosts"
        :key="index"
      >
        <div class="p3">
          <div
            class="w-10 h-10 border-neutral-300 border-[1px] rounded-full p-0 overflow-hidden"
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
            <div v-if="post.image" class="py-2">
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
</template>
<script>
import { useFeedStore } from "@/stores/feedStore";
import { useUserStore } from "@/stores/userStore";
import { mapActions, mapState } from "pinia";

export default {
  name: "SearchView",
  mounted() {
    this.refresh();
  },
  data() {
    return {
      searchTerm: "",
      previousSearchTerm: "",
    };
  },
  computed: {
    ...mapState(useUserStore, ["currentUser"]),
    ...mapState(useFeedStore, ["isLoading", "currenPosts", "getAvatarURL"]),
    // articles() {
    //   let allArticle = this.currenPosts.map((post) => post?.article?.title);

    //   const uniqueArticles = [...new Set(allArticle)];
    //   return uniqueArticles;
    // },
  },
  methods: {
    ...mapActions(useFeedStore, ["setPosts", "fetchFeeds"]),
    refresh() {
      this.setPosts([]);
    },
    onClick() {
      //   console.log("Clicked");
      // check if search term is empty or null
      if (this.searchTerm === "" || this.searchTerm === null) {
        return;
      } else {
        this.setPosts([]);
        this.fetchFeeds(this.searchTerm);
        this.previousSearchTerm = this.searchTerm;
      }
    },
    onScroll(event) {
      const element = event.target;
      const { scrollTop, scrollHeight, clientHeight } = element;

      // Check if near 70% of the container
      if (scrollTop / (scrollHeight - clientHeight) >= 0.7 && !this.isLoading) {
        this.fetchFeeds(this.previousSearchTerm);
        console.log("fetching more data");
      }
    },
  },
};
</script>
