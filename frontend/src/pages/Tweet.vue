<template>
  <div class="tweet-page">
    <h1 class="mb-5">Create a Tweet on your account</h1>
    <router-link
      to="/"
      class="border-2 rounded-full border-blue-400 px-5 py-3 font-bold hover:bg-blue-100"
    >
      Back to home
    </router-link>
    <div class="border border-green-500 bg-green-50 w-full my-5 p-5 rounded">
      <h2 class="text-xl mb-2 font-bold">You are logged in</h2>
      <p><b>Twitter Access Token:</b> {{ accessToken }}</p>
    </div>

    <div class="tweet-container shadow-md">
      <label for="message">Tweet Message</label>
      <text-area v-model="message" id="message" name="message" />
      <label for="imageUrl">Tweet Image Url (optional)</label>
      <text-field
        v-model="imageUrl"
        id="imageUrl"
        name="imageUrl"
        type="text"
      />
      <button class="border-2 border-gray-800 px-2 py-2 bg-blue-50 hover:bg-blue-200" @click.stop="tweet">Create tweet</button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";

import api from "../services/index";
import { getTokenFromLocalStorage } from "../utils";
import TextArea from "../components/TextArea.vue";
import TextField from "../components/TextField.vue";

export default Vue.extend({
  props: {},
  components: {
    TextArea,
    TextField,
  },
  mounted() {
    this.accessToken = this.getToken();
  },
  data() {
    return {
      message: "A test description",
      loading: false,
      error: false,
      errorMessage: null,
      imageUrl: null,
      accessToken: "",
    };
  },
  methods: {
    getToken() {
      return getTokenFromLocalStorage();
    },
    async tweet() {
      if (this.loading) return;
      this.loading = true;
      try {
        const response = await api.twitter.createTweet(
          this.accessToken,
          this.message,
          this.imageUrl
        );
        console.log("the response", response);
      } catch (error) {
        console.error("Error creating tweet", error);
      }
      this.loading = false;
    },
  },
  computed: {
    userIsLoggedIn() {
      return !!this.accessToken;
    },
  },
});
</script>

<style scoped>
.tweet-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.tweet-container {
  width: 100%;
  max-width: 30rem;
  margin: 0 auto;
  text-align: left;
  border: 1px solid #ccc;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tweet-container > * + * {
  margin-bottom: 1rem;
}

.tweet-container > label {
  margin-bottom: 1rem;
  font-weight: bold;
}
</style>
