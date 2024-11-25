import { defineStore } from "pinia";

import axios from "axios";

import { createAvatar } from "@dicebear/core";

import { v4 as uuidv4 } from "uuid";

import {
  lorelei,
  croodles,
  openPeeps,
  bottts,
  bigSmile,
  adventurer,
} from "@dicebear/collection";

export const useFeedStore = defineStore("feed", {
  state: () => ({
    posts: [],
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 1,
    hasMore: true,
  }),
  getters: {
    currenPosts: (state) => {
      return state.posts;
    },
    isLoading: (state) => {
      return state.loading;
    },
  },
  actions: {
    async fetchFeeds(query = null) {
      if (this.loading) return;
      this.loading = true;

      const data = {
        page: this.currentPage,
        pageSize: this.pageSize,
      };

      if (query) {
        data.categories = [query];
      } else {
        data.categories = [
          "politics",
          "sports",
          "business",
          "entertainment",
          "technology",
          "science",
          "health",
        ];
      }

      return axios
        .post("https://ghost-feed.deno.dev/", data)
        .then((res) => {
          console.log(res.data);
          this.posts = [
            ...this.posts,
            ...res.data.socialMediaPosts.map((post) => {
              return {
                ...post,
                id: uuidv4(),
              };
            }),
          ];
          this.hasMore = res.data.length >= this.pageSize;
          console.log("this.posts", this.posts);
          this.currentPage++;
          this.loading = false;
          return Promise.resolve();
        })
        .catch((err) => {
          console.error(err);
          this.loading = false;
          return Promise.reject();
        });
    },
    addFeed(feed) {
      this.feeds.push(feed);
    },
    removeFeed(feedId) {
      this.feeds = this.feeds.filter((feed) => feed.id !== feedId);
    },
    setPosts(posts) {
      this.posts = posts;
    },
    getAvatarURL(username) {
      const svg = createAvatar(adventurer, {
        seed: username,
      });
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    },
    toggleBookmark(postId) {
      const post = this.posts.find((post) => post.id === postId);
      post.isBookmarked = !post.isBookmarked;
      // increase or decrease the bookmark count
      if (post.isBookmarked) {
        post.bookmarks++;
      } else {
        post.bookmarks--;
      }
    },
    addUserPost(post) {
      this.posts.unshift(post);
    },
    randomlyInsertUserPosts(posts) {
      const postIds = this.posts.map((post) => post.id);
      const postsDoesNotExist = posts.filter(
        (post) => !postIds.includes(post.id)
      );

      console.log("postsDoesNotExist", postsDoesNotExist);

      if (postsDoesNotExist && postsDoesNotExist.length > 0) {
        // insert user posts at random index
        postsDoesNotExist.forEach((post) => {
          const randomIndex = Math.floor(Math.random() * this.posts.length);
          this.posts.splice(randomIndex, 0, post);
        });
        // const randomIndex = Math.floor(Math.random() * postsDoesNotExist.length);
        // this.posts.splice(randomIndex, 0, ...postsDoesNotExist);
      } else {
        console.log("All posts already exist");
      }
    },
  },
});
