<template>
  <q-item
    clickable
    :tag="link != null ? 'router-link' : 'a'"
    :to="link != null ? link : '/not'"
    :exact="link != null"
    style="border-end-end-radius: 30px; border-start-end-radius: 30px"
    :active-class="activeClass"
  >
    <q-item-section v-if="icon" avatar>
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "EssentialLink",
  inject: ["activeClass"],
  props: {
    title: {
      type: String,
      required: true,
    },

    caption: {
      type: String,
      default: "",
    },

    link: {
      type: [String, Object],
      default: "#",
    },

    icon: {
      type: String,
      default: "",
    },
  },
});
</script>

