<template>
  <div class="twitter-profile__wrapper"></div>
</template>

<script lang="ts">
import Vue from "vue";
import { TwitterProfile } from "../utils";

export default Vue.extend({
  props: {
    value: String,
  },
  components: {},
  mounted() {},
  data() {
    return {};
  },
  methods: {},
  watch: {},
});
</script>

<style scoped>
.twitter-profile__wrapper {
  padding: 1rem;
}
</style>
