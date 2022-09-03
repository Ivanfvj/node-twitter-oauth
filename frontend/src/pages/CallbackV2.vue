<!-- Example callback page to handle OAuth flow -->
<template>
  <div class="callback-page">
    <div style="margin-bottom: 2rem">
      <router-link to="/" class="router-link">Back to Home</router-link>
    </div>
    <div v-if="error">
      <div v-if="callbackError" class="text-left my-5 max-w-3xl">
        <h1 class="mb-5" style="color: red">
          Callback url without query params
        </h1>
        <h2 class="mb-2 text-lg font-bold">
          This page handle Twitter OAuth Callback
        </h2>
        <div class="space-y-2">
          <p class="">Callback url query params not founded</p>
          <p>
            This page expect <u>code and state query params</u> from
            <a
              class="underline font-bold hover:text-blue-500"
              href="https://developer.twitter.com/en/docs/apps/callback-urls"
              target="_blank"
            >
              Twitter OAuth Callback </a
            >.
          </p>
          <p>
            If the user access this page directly then you should check if he is
            already logged in and redirect him to another page.
          </p>
          <p>
            If the user is not logged in, you can redirect him immediately to
            your login page in your application so he can continue the OAuth
            flow normally.
          </p>
        </div>
        <div
          class="mt-5 p-5 text-center border border-red-500 bg-red-50 rounded w-full"
        >
          <p class="mb-5">Query params not founded.</p>
          <router-link to="/" class="router-link">Back to Home</router-link>
        </div>
      </div>
      <div v-else>
        <h1 style="color: red">Error on login</h1>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
    <div v-else-if="loading">
      <p>Loading...</p>
    </div>

    <div
      v-else
      class="w-full text-center p-5 border border-green-500 bg-green-50 rouded"
    >
      <h2 class="text-xl font-bold">Twitter login successful! 👍</h2>
      <div class="my-5">
        <p>The twitter code and state from callbackUrl</p>
        <p>{{ twitterCode }}</p>
        <p>{{ twitterState }}</p>
      </div>
      <div>
        <p class="font-bold">Twitter Access Token</p>
        <small>Saved on local storage</small>
        <p class="font-bold">{{ accessToken }}</p>
      </div>
      <div class="my-5">
        Redirecting to application in {{ secondsToRedirect }}
      </div>

      <details class="text-left">
        <summary>Backend service response</summary>
        <pre class="text-left">{{ JSON.stringify(response, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import api from "../services/index";
import Tweet from "../pages/Tweet.vue";

export default Vue.extend({
  components: {
    Tweet,
  },
  mounted() {
    // Get code and state from url query (twitter callbackUrl)
    const { code, state } = this.$route.query;

    this.accessToken = this.getTokenFromLocalStorage();

    if (this.accessToken) {
      return this.redirectToDashboard();
    }

    this.twitterCode = code;
    this.twitterState = state;

    if (!code || !state) {
      return this.showLoginError();
    }
    this.generateToken();
  },
  data() {
    return {
      twitterCode: "",
      twitterState: "",
      accessToken: "",

      loading: false,
      callbackError: false,
      error: false,
      errorMessage: "",

      response: null,
      secondsToRedirect: 5,
    };
  },
  methods: {
    redirectToDashboard() {
      const timer = setInterval(() => {
        if (this.secondsToRedirect === 0) {
          clearInterval(timer);
          this.$router.push("/tweet");
        }
        this.secondsToRedirect--;
      }, 1000);
    },
    showLoginError() {
      this.error = true;
      this.callbackError = true;
    },
    async generateToken() {
      if (this.loading) return;
      this.loading = true;
      try {
        // Request accessToken exchange to the backend service
        const response = await api.twitterV2.generateAccessTokenAndLogin(
          this.twitterCode,
          this.twitterState
        );
        console.log("the response", response);
        this.response = response;
        this.saveOnLocalStorage(response.accessToken);
        this.redirectToDashboard();
      } catch (error) {
        console.error("error on login", error);
        this.error = true;
        this.errorMessage = error.message;
      }
      this.loading = false;
    },
    saveOnLocalStorage(token) {
      localStorage.setItem("accessToken", token);
    },
    getTokenFromLocalStorage() {
      const accessToken = localStorage.getItem("accessToken");
      return accessToken;
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
.callback-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.router-link {
  font-size: 1.2rem;
  border-radius: 100vh;
  padding: 0.5rem 1rem;
  font-weight: bold;
  border: 1px solid blue;
}

.router-link:hover {
  background: rgb(226, 244, 255);
}
</style>
