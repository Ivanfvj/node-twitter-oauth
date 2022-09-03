<template>
  <div class="home-page">
    <div class="space-y-2 mb-5">
      <h1>Vue2 + Twitter Login</h1>
      <p>Vue demo application for sending tweets with text and image</p>
    </div>
    <div class="text-left w-full space-y-2 max-w-2xl p-5 border rounded">
      <p class="font-bold text-lg">Steps to follow</p>
      <ol class="list-outside list-decimal space-y-1 ml-5">
        <li>
          Login with your Twitter Account using the button bellow. The default
          OAuth scope requested is {{ scopeAsString }}.
        </li>
        <li>
          Once you authenticate with Twitter you will be redirected to
          <router-link
            class="underline font-bold hover:text-blue-500"
            to="/callback"
          >
            /callback
          </router-link>
          route. Twitter append authentication code and state on the url query
          and this application client will send a request to our backend service
          with this data to exchange an access_token following the OAuth 2.0
          (with PCKE) flow.
        </li>
        <li>
          <u>This accessToken has 2 hours lifetime</u> and is saved on web
          LocalStorage for the following requests. Our backend service can
          refresh this token hence we use the scope offline.access. The
          refreshToken is only stored in our backend and client can't access to
          it.
        </li>
        <li>
          Vue frontend application can use this Twitter access_token to consume
          Twitter API or use our backend server as proxy to communicate with the
          Twitter API.
        </li>
      </ol>
    </div>
    <div class="flex justify-center mt-5">
      <div v-if="isUserLoggedIn">
        <div
          class="border border-green-500 bg-green-50 w-full my-5 p-5 rounded"
        >
          <h2 class="text-xl mb-2 font-bold">You are logged in</h2>
          <p><b>Twitter Access Token:</b> {{ accessToken }}</p>
        </div>
        <div class="flex justify-between">
          <button
            class="border-2 rounded-full border-red-400 px-5 py-3 font-bold hover:bg-red-100"
            @click.stop="logout"
          >
            Logout
          </button>
          <router-link
            to="/tweet"
            class="border-2 rounded-full border-blue-400 px-5 py-3 font-bold hover:bg-blue-100"
          >
            Create a tweet
          </router-link>
        </div>
      </div>
      <TwitterLoginButton v-else :scope="scope" />
    </div>
  </div>
</template>

<script>
import TwitterLoginButton from "../components/TwitterLoginButton.vue";

import { getTokenFromLocalStorage, tokenKeyLocalStorage } from "../utils";

export default {
  components: {
    TwitterLoginButton,
  },
  mounted() {
    this.accessToken = this.getToken();
  },
  data() {
    return {
      scope: ["tweet.read", "tweet.write", "users.read", "offline.access"],
      accessToken: "",
    };
  },
  methods: {
    getToken() {
      return getTokenFromLocalStorage();
    },
    logout() {
      localStorage.removeItem(tokenKeyLocalStorage);
      this.accessToken = "";
      // Force page refresh
      this.$router.go(0);
    },
  },
  computed: {
    isUserLoggedIn() {
      return !!this.accessToken;
    },
    scopeAsString() {
      return this.scope.join(",");
    },
  },
};
</script>

<style scoped>
.home-page {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
