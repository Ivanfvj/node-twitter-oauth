<template>
  <div class="twitter-button__wrapper">
    <button
      class="twitter-button"
      :class="{
        loading: loading,
        error: error,
      }"
      :disabled="loading"
      @click.stop="onClick"
    >
      <TwitterLogo color="#fff" />
      <span>{{ buttonText }}</span>
    </button>
  </div>
</template>

<script lang="ts">
import api from "../services/index";
import TwitterLogo from "./TwitterLogo.vue";

export default {
  components: {
    TwitterLogo,
  },
  props: {
    scope: {
      type: Array,
      required: true,
    },
  },
  mounted() {
    this.requestTwitterLoginUrl();
  },
  data() {
    return {
      loading: false,
      error: false,
      errorMessage: "",
      OAuthLoginUrl: "",
    };
  },
  methods: {
    onClick() {
      if (this.error) {
        this.requestTwitterLoginUrl();
      } else if (this.OAuthLoginUrl) {
        this.openTwitterLogin();
      }
    },
    async retry() {
      this.requestTwitterLoginUrl();
    },
    /** User request login Url to the backend service. Once fetched, the application can redirect to this url to continue the auth flow. */
    async requestTwitterLoginUrl() {
      if (this.loading) return;
      this.loading = true;
      try {
        const response = await api.twitter.requestTwitterLoginUrl(this.scope);
        this.OAuthLoginUrl = response.url;
        this.error = false;
      } catch (error) {
        this.error = true;
        this.errorMessage = error.message;
        console.error("Error requesting Twitter OAuth link", error);
      }
      this.loading = false;
    },
    openTwitterLogin() {
      if (!this.OAuthLoginUrl) return;
      try {
        window.location = this.OAuthLoginUrl;
      } catch (e) {
        return Promise.reject(new Error("Error opening OAuth login url"));
      }
    },
  },
  computed: {
    buttonText() {
      if (this.loading) return "Loading...";
      else if (this.error) return "Error";
      else return "Login with Twitter";
    },
  },
};
</script>

<style>
.twitter-button__wrapper {
  width: 100%;
  max-width: 20rem;
}

.twitter-button {
  display: flex;
  align-items: center;
  width: 100%;
  border: 2px solid #00acee;
  background: #00acee;
  color: #fff;
  border-radius: 100vh;
  font-weight: 600;
  padding: 0.5rem 1.5rem;
}

.twitter-button .loading {
  background: red;
}

.twitter-button:hover {
  background: #007bac;
  border: 2px solid #01729e;
}

.twitter-button span {
  margin-left: 0.7rem;
}
</style>
