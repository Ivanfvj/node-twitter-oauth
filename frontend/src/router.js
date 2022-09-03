import VueRouter from "vue-router";
import HomePage from "./pages/Home.vue";
import CallbackPage from "./pages/Callback.vue";
import Tweet from './pages/Tweet.vue'

const routes = [
  { path: "/", component: HomePage },
  { path: "/callback", component: CallbackPage },
  { path: "/tweet", component: Tweet },
];

const router = new VueRouter({
  routes,
  mode: "history",
});

export default router;
