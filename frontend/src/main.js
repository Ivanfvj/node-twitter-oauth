import Vue from "vue";
import VueRouter from "vue-router";
import App from "./App.vue";
import Router from "./router";
import "./style.css";

Vue.use(VueRouter);
const app = new Vue({
  render: (h) => h(App),
  router: Router,
});

app.$mount("#app");
