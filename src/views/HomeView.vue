<template>
  <div
    class="w-full min-w-3xl h-full bg-white overflow-hidden overflow-y-auto"
    @scroll="onScroll"
  >
    <div
      class="w-full flex flex-row sticky top-0 z-30 bg-white border-b-[1px] border-neutral-300"
    >
      <div
        v-for="(tab, index) in tabs"
        :key="index"
        class="w-full py-3 flex justify-center border-b-2 cursor-pointer"
        :class="
          tab.selected
            ? 'border-neutral-900 rounded-t-lg'
            : 'border-transparent'
        "
        @click="selectTab(tab)"
      >
        {{ tab.title }}
      </div>
    </div>
    <div class="w-full flex flex-row"></div>
    <create-new-post />
    <post v-for="(post, index) in filteredFeeds" :key="index" :post="post" />

    <div class="w-full flex justify-center items-center p-3">
      <v-progress-circular
        v-if="isLoading"
        color="primary"
        indeterminate
      ></v-progress-circular>
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
import { mapActions, mapState } from "pinia";
import { useUserStore } from "@/stores/userStore";

import { supabase } from "@/lib/supabaseClient";
import { useFeedStore } from "@/stores/feedStore";

import Post from "@/components/Post.vue";
import CreateNewPost from "@/components/CreateNewPost.vue";

export default {
  name: "AboutView",
  components: {
    Post,
    CreateNewPost,
  },
  async mounted() {
    // await this.checkAuth();
    this.refresh();
  },
  data() {
    return {
      tabs: [
        {
          title: "For You",
          icon: "mdi-home",
          routePathName: "home",
          selected: true,
        },
        {
          title: "You",
          icon: "mdi-account",
          routePathName: "profile",
          selected: false,
        },
      ],
    };
  },
  computed: {
    ...mapState(useUserStore, ["currentUser"]),
    ...mapState(useFeedStore, ["isLoading", "currenPosts"]),
    selectedTab() {
      return this.tabs.find((tab) => tab.selected);
    },
    filteredFeeds() {
      return this.currenPosts.filter((post) =>
        this.selectedTab?.title === "For You" ? post : post.isUserPost
      );
    },
    articles() {
      // unique articles
      let allArticle = this.currenPosts.map((post) => post?.article?.title);

      const uniqueArticles = [...new Set(allArticle)];
      return uniqueArticles;
    },
  },
  methods: {
    ...mapActions(useUserStore, ["checkAuth"]),
    ...mapActions(useFeedStore, [
      "fetchFeeds",
      "setPosts",
      "getAvatarURL",
      "randomlyInsertUserPosts",
    ]),

    async refresh() {
      this.setPosts([]);
      this.fetchFeeds()
        .then(async () => {
          const { data, error } = await supabase
            .from("user_posts")
            .select("*,ai_comments(*)");
          //   `
          // );

          if (error) {
            console.error("Error fetching posts", error);
            return;
          }

          console.log("Posts", data);
          this.randomlyInsertUserPosts(
            data.map((post) => {
              return {
                id: post.id,
                post: post.post,
                isUserPost: true,
                bookmarks: 0,
                comments: post?.ai_comments?.length,
                ai_comments: post?.ai_comments,
                shares: 0,
                isBookmarked: false,
                username: "@" + this.currentUser?.user_metadata?.user_name,
                full_name: this.currentUser?.user_metadata?.full_name,
                avatar: this.currentUser?.user_metadata?.avatar_url,
              };
            })
          );
        })
        .catch((err) => {
          console.error(err);
        });
      // axios.get("https://jsonplaceholder.typicode.com/currenPosts").then((res) => {
      //   console.log(res.data);
      //   this.currenPosts = res.data;
      // }).catch((err) => {
      //   console.error(err);
      // });

      // this.isLoading = true;

      // const data = {
      //   categories: ["politics"],
      // };

      // axios
      //   .post("http://localhost:8000/", data)
      //   .then((res) => {
      //     console.log(res.data);
      //     this.currenPosts = res.data.socialMediacurrenPosts;
      //     console.log(this.currenPosts);
      //     this.isLoading = false;
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //     this.isLoading = false;
      //   });

      // user_posts
    },
    async logout() {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.log("Error while logout");
        return;
      }

      this.$router.push("/login");
    },
    onScroll(event) {
      const element = event.target;
      const { scrollTop, scrollHeight, clientHeight } = element;

      // Check if near 70% of the container
      if (scrollTop / (scrollHeight - clientHeight) >= 0.7 && !this.isLoading) {
        this.fetchFeeds();
        console.log("fetching more data");
      }
    },
    selectTab(tab) {
      this.tabs.forEach((t) => (t.selected = false));
      tab.selected = true;
    },
  },
};
</script>
