<template>
  <div class="w-full h-screen flex flex-row justify-center bg-neutral-100">
    <div class="w-full h-full flex flex-row max-w-4xl">
      <div
        class="w-72 h-full hidden md:flex flex-col flex-none bg-neutral-100 overflow-hidden"
      >
        <div
          @click="refresh()"
          class="w-full h-16 flex flex-row items-center gap-3 px-3 py-2 border-b-[1px] border-neutral-300 overflow-hidden"
        >
          <img src="../assets/ghost.png" alt="profile" class="w-8 h-8" />
          <div>
            <div class="text- text-base font-bold">Ghost AI</div>
            <div class="text- text-sm">Real you, unreal interactions</div>
          </div>
        </div>
        <div class="w-full h-full fle hidden flex-col overflow-hidden">
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
        <div class="w-full h-full flex flex-col gap-3 p-3 overflow-auto">
          <div
            v-for="(tab, index) in tabs"
            :key="index"
            class="w-full flex items-center gap-3 px-5 py-3 cursor-pointer"
            :class="
              tab.selected
                ? 'bg-neutral-900 font-bold text-white rounded-full'
                : ''
            "
            @click="selectTab(tab)"
          >
            <div class="flex justify-center items-center">
              <v-icon size="32"> {{ tab.icon }} </v-icon>
            </div>
            <div class="text-xl">
              {{ tab.title }}
            </div>
          </div>
        </div>
        <div class="w-full p-0" v-if="currentUser">
          <v-menu offset-y>
            <template v-slot:activator="{ props }">
              <div
                v-bind="props"
                class="w-full bg-neutral-00 flex flex-row items-center gap-3 p-3 rounded-full"
              >
                <div
                  class="w-10 h-10 flex-none bg-yellow-700 p-[2px] rounded-full"
                >
                  <img
                    :src="currentUser?.user_metadata?.avatar_url"
                    class="w-full h-full rounded-full border-2 border-neutral-300"
                  />
                </div>
                <div class="w-full text-sm">
                  <div class="flex items-center gap-1">
                    {{ currentUser?.user_metadata?.full_name }}
                    <div class="w-5 h-5 text-blue-500">
                      <!-- <img src="../assets/verify.png" /> -->
                      <svg
                        viewBox="0 0 22 22"
                        aria-label="Verified account"
                        role="img"
                        class="fill-blue-500"
                        data-testid="icon-verified"
                      >
                        <g>
                          <path
                            d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                          ></path>
                        </g>
                      </svg>
                    </div>
                  </div>
                  <div>
                    {{ currentUser?.user_metadata?.email }}
                  </div>
                </div>
              </div>
            </template>
            <v-list>
              <v-list-item @click="logout">
                <v-list-item-title>
                  <v-icon> mdi-logout </v-icon> Log Out
                </v-list-item-title>
                <!-- <v-list-item-icon>
                    <v-icon> mdi-logout </v-icon>
                  </v-list-item-icon> -->
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
      <div class="w-full h-full flex flex-col overflow-hidden">
        <div
          class="w-full h-full border-x-[1px] border-neutral-300 relative overflow-hidden"
        >
          <router-view />
        </div>
        <div
          class="w-full flex md:hidden flex-row items-center bg-neutral-50 border-t-[1px] border-x-[1px] border-neutral-300 px-3 py-2"
        >
          <!-- {{ tabs }} -->
          <div
            v-for="(tab, index) in tabs"
            :key="index"
            class="w-full flex items-center gap-1 px-3 cursor-pointer"
            :class="
              tab.selected
                ? 'bg-neutral-900 text-white rounded-full'
                : 'justify-center'
            "
            @click="selectTab(tab)"
          >
            <div class="w-10 h-10 flex justify-center items-center">
              <v-icon size="24"> {{ tab.icon }} </v-icon>
            </div>
            <div v-if="tab.selected" class="text-sm">
              {{ tab.title }}
            </div>
          </div>
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
import { mapActions, mapState } from "pinia";
import { useUserStore } from "@/stores/userStore";

import { supabase } from "@/lib/supabaseClient";
import { useFeedStore } from "@/stores/feedStore";

export default {
  name: "AboutView",
  async mounted() {
    this.tabs.forEach((tab) => {
      tab.selected = tab.routePathName === this.$route.name;
    });

    await this.checkAuth();
    // this.refresh();
  },
  data() {
    return {
      // currenPosts: [],
      // isLoading: false,
      tabs: [
        {
          icon: "mdi-home",
          title: "Home",
          routePathName: "home",
          selected: true,
        },
        {
          icon: "mdi-magnify",
          title: "Search",
          routePathName: "search",
          selected: false,
        },
        {
          icon: "mdi-bookmark",
          title: "Bookmark",
          routePathName: "bookmark",
          selected: false,
        },
        {
          icon: "mdi-tune",
          title: "Preferences",
          routePathName: "preferences",
          selected: false,
        },
      ],
    };
  },
  computed: {
    ...mapState(useUserStore, ["currentUser"]),
    ...mapState(useFeedStore, ["isLoading", "currenPosts"]),
    articles() {
      // unique articles
      let allArticle = this.currenPosts.map((post) => post?.article?.title);

      const uniqueArticles = [...new Set(allArticle)];
      return uniqueArticles;
    },
  },
  methods: {
    ...mapActions(useUserStore, ["checkAuth"]),
    ...mapActions(useFeedStore, ["fetchFeeds"]),
    getAvatarURL(username) {
      const svg = createAvatar(adventurer, {
        seed: username,
      });
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    },
    refresh() {
      this.fetchFeeds();
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
      this.tabs.forEach((t) => {
        t.selected = t.title === tab.title;
        if (t.selected) {
          this.$router.push({ name: t.routePathName });
        }
      });
    },
  },
};
</script>
