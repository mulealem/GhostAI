<template>
  <div class="w-full h-full flex justify-center bg-neutral-100">
    <div class="w-full max-w-4xl h-full p-3">
      <div class="w-full flex justify-between items-center px-3 py-2 text-lg">
        Please select categories
        <v-btn
          @click="saveCategories"
          :disabled="selectedCategories.length === 0"
          color="primary"
          elevation="0"
        >
          Continue
        </v-btn>
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
  </div>
</template>
<script>
import { supabase } from "@/lib/supabaseClient";
export default {
  data() {
    return {
      categories: [],
      userCategories: [],
    };
  },
  computed: {
    selectedCategories() {
      return this.categories.filter((category) => category.selected);
    },
  },
  methods: {
    async refresh() {
      const { data } = await supabase.from("categories").select();
      console.log(data);
      this.categories = data.map((category) => {
        return {
          ...category,
          selected: false,
        };
      });
      const { data: userCategories, error } = await supabase
        .from("user_categories")
        .select("category_id");
      if (error) {
        console.error("Error fetching user categories:", error);
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
    },
    selectCategory(category) {
      category.selected = !category.selected;
    },
    async saveCategories() {
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
          return;
        }
      }

      this.$router.push("/");
    },
  },
  mounted() {
    this.refresh();
  },
};
</script>
