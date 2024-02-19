<template>
  <q-page class="q-mx-md q-pb-md">
    <q-tabs
      id="list-operateurs"
      :active-class="activeClass"
      v-model="tab"
      no-caps
      align="left"
      class="q-mb-lg"
      :class="$q.dark.isActive ? 'bg-dark' : 'bg-white'"
      style="position: sticky; top: 0; z-index: 3"
    >
      <q-tab
        v-for="tab in tabs"
        :key="tab.name"
        :label="tab.name"
        :name="tab.value"
      ></q-tab>
    </q-tabs>
    <div
      id="liste-filtre"
      class="row q-py-md"
      v-if="$route.fullPath.includes('transaction')"
    >
      <q-select
        outlined=""
        style="min-width: 200px"
        borderless
        label="Type de transactions"
        v-model="type"
        :options="types"
        emit-value=""
        map-options=""
      ></q-select>
      <q-select
        outlined=""
        style="min-width: 200px"
        class="q-mx-md"
        borderless
        label="Date de transactions"
        v-model="date"
        :options="dates"
        map-options
        emit-value
      ></q-select>
      <q-input
        type="search"
        outlined
        v-model="telephone"
        label="Rechercher "
        placeholder="Saisissez un numéro de téléphone"
        style="min-width: 300px"
      />
    </div>
    <section>
      <router-view
        :operateur="tab"
        :filter="{ type, date, telephone }"
      ></router-view>
    </section>
  </q-page>
</template>

<script setup >
import { ref, computed, watch, inject } from "vue";
import TransactionTable from "src/components/TransactionTable.vue";
import { useQuasar } from "quasar";
import { setCssVar, colors } from "quasar";

const { getPaletteColor } = colors;

const activeClass = inject("activeClass");
const $q = useQuasar();
const tab = ref("");
const tabs = [
  { name: "Tout", value: "", color: "text-indigo" },
  { name: "Wave", value: "wave", color: "text-blue" },
  { name: "Orange Money", value: "orange", color: "text-orange" },
  { name: "MTN Money", value: "mtn", color: "text-yellow" },
  { name: "Flooz", value: "moov", color: "text-green" },
];

const types = ref([
  { label: "Tout", value: "" },
  { label: "Dépots", value: "depot" },
  { label: "Retraits", value: "retrait" },
]);
const type = ref("");
const telephone = ref("");
const op = computed(() => {
  const current = tabs.find((el) => el.value == tab.value);
  return current;
});
const dates = ref([
  { label: "Aujourd'hui", value: "today" },
  { label: "7 derniers jours", value: "week" },
  { label: "30 derniers jours", value: "month" },
  { label: "Autre date", value: "custom" },
]);
const date = ref("today");
const col = ref("primary");
watch(
  tab,
  (val) => {
    const color = tabs.find((el) => el.value == val)?.color;
    activeClass.value = $q.dark.isActive
      ? color
      : color + "-8 bg-" + color.split("-").at(-1) + "-1";
    col.value = activeClass.value.split("-").slice(1).join("-");
    setCssVar("primary", getPaletteColor(col.value));
  },
  {
    immediate: true,
  }
);
</script>
<style lang="scss">
</style>
