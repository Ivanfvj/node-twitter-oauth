<template>
  <input
    v-model="localValue"
    class="text-field__input p-3 border-2 border-gray-700"
    rows="5"
    :id="id"
    :name="name"
    :type="type"
  />
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  props: {
    value: String,
    id: String,
    name: String,
    type: {
      type: String,
      default: "text",
    },
  },
  model: {
    prop: "value",
    event: "update:value",
  },
  components: {},
  mounted() {
    if (typeof this.value !== "undefined") {
      this.localValue = this.value;
    }
  },
  data() {
    return {
      localValue: "",
    };
  },
  methods: {},
  watch: {
    localValue(value: string) {
      this.$emit("update:value", value);
    },
  },
});
</script>

<style scoped>
.text-field__input {
  display: block;
  padding: 1rem;
}
</style>
