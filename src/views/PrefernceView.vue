<template>
  <div class="w-full h-full flex flex-col bg-white overflow-hidden">
    <div
      v-if="currentUser"
      class="w-full bg-neutral-100 flex flex-row items-center gap-3 border-b-[1px] border-neutral-300 p-3"
    >
      <div class="w-10 h-10 flex-none bg-neutral-200 p-[2px] rounded-full">
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
    <div
      class="w-full flex items-center gap-3 font-bold p-3 border-b-[1px] border-neutral-300"
    >
      <v-icon size="24"> mdi-bookmark </v-icon>
      Category Preferences
    </div>
    <div class="w-full h-full overflow-auto">
      <div class="w-full flex justify-center items-center p-3" v-if="isLoading">
        <v-progress-circular
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
      <div class="w-full grid grid-cols-2 md:grid-cols-3 gap-3 p-3">
        <div
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category)"
          :class="{
            'bg-blue-500': category.selected,
            'bg-neutral-500': !category.selected,
          }"
          class="w-full h-24 flex flex-col justify-end items-end text-lg text-white hover:bg-opacity-85 px-5 py-3 rounded-lg cursor-pointer relative"
        >
          {{ category.title }}
          <div class="absolute top-2 left-3 text-white">
            <v-icon v-if="category.selected" size="24">mdi-check-circle</v-icon>
          </div>
        </div>
      </div>
    </div>
    <div class="w-full p-3">
      <v-btn
        @click="saveCategories"
        color="primary"
        block
        elevation="0"
        size="large"
        :loading="isSaving"
      >
        Save
      </v-btn>
    </div>
  </div>
</template>
<script>
import { mapActions, mapState } from "pinia";

import { supabase } from "@/lib/supabaseClient";
import Post from "@/components/Post.vue";
import { useUserStore } from "@/stores/userStore";

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
      categories: [],
      userCategories: [],
      isLoading: false,
      isSaving: false,
    };
  },
  computed: {
    ...mapState(useUserStore, ["currentUser"]),
    selectedCategories() {
      return this.categories.filter((category) => category.selected);
    },
  },
  methods: {
    async refresh() {
      this.isLoading = true;
      this.isSaving = false;
      this.categories = [];
      const { data, error } = await supabase.from("categories").select();
      console.log(data);
      this.categories = data.map((category) => {
        return {
          ...category,
          selected: false,
        };
      });

      if (error) {
        console.error(error);
        this.isLoading = false;
        return;
      }

      const { data: userCategories, error: userCategoriesError } =
        await supabase.from("user_categories").select("category_id");
      if (userCategoriesError) {
        console.error("Error fetching user categories:", error);
        this.isLoading = false;
        return;
      }

      this.userCategories = userCategories;

      userCategories.forEach((userCategory) => {
        const category = this.categories.find(
          (category) => category.id === userCategory.category_id
        );
        if (category) {
          category.selected = true;
        }
      });
      this.isLoading = false;
    },
    selectCategory(category) {
      category.selected = !category.selected;
    },
    async saveCategories() {
      this.isSaving = true;
      const selectedCategories = this.selectedCategories.map((category) => {
        return {
          category_id: category.id,
        };
      });
      console.log(selectedCategories);
      // await supabase.from("user_categories").insert(selectedCategories);
      const { error } = await supabase
        .from("user_categories")
        .insert(selectedCategories);
      if (error) {
        console.error("Error saving categories:", error);
        this.isSaving = false;
        return;
      }

      // if user already has categories but unseltected, delete them
      const unselectedUserCategories = this.userCategories.filter(
        (userCategory) => {
          return !selectedCategories.some(
            (selectedCategory) =>
              selectedCategory.category_id === userCategory.category_id
          );
        }
      );

      if (unselectedUserCategories.length > 0) {
        const { error } = await supabase
          .from("user_categories")
          .delete()
          .in(
            "category_id",
            unselectedUserCategories.map((category) => category.category_id)
          );
        if (error) {
          console.error("Error deleting categories:", error);
          this.isSaving = false;
          return;
        }
      }

      this.isSaving = false;

      this.refresh();
    },
  },
};
</script>
