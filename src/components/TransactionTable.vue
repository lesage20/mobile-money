<template>
  <div class="q-my-lg" v-if="operateur">
    <CreateTransaction
      id="creer-transaction"
      :operateur="operateur"
      @saved="getRows"
    />
  </div>
  <q-table
    id="liste-transaction"
    :class="$q.dark.isActive ? 'text-grey-5' : 'text-grey-9'"
    :rows="rows"
    flat
    v-bind="$attrs"
    :columns="columns"
  >
  </q-table>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import CreateTransaction from "./CreateTransaction.vue";
import { date } from "quasar";
import { driver } from "driver.js";
import { useOptionStore } from "src/stores/user-options";

const driverObj = driver({
  showProgress: true,
  steps: [
    {
      element: "#liste-filtre",
      popover: {
        title: "Les filtres",
        description:
          "Utilisez les filtres pour trouver facilement des transferts passés.",
      },
    },
    {
      element: "#liste-transaction",
      popover: {
        title: "Liste des transfert",
        description: "Cette sections affiche les transferts effectués",
      },
    },
  ],
  onDestroyed: async () =>
    await transactions.setUserOptions(
      "views",
      "has_seen_transaction_list",
      true
    ),
});

const route = useRoute();

const props = defineProps({
  operateur: {
    type: String,
    default: "",
  },
  filter: {
    type: Object,
  },
});

const columns = ref([
  {
    name: "Téléphone",
    align: "left",
    label: "Téléphone",
    field: "telephone",
  },
  {
    name: "Montant",
    align: "left",
    label: "Montant",
    field: "montant",
    sortable: true,
  },
  { name: "Type", align: "left", label: "Type", field: "type", sortable: true },
  {
    name: "Operateur",
    align: "left",
    label: "Operateur",
    field: "operateur",
    sortable: true,
  },
  {
    name: "Date",
    align: "left",
    label: "Date",
    field: "date",
    format: (val) => val.toLocaleString(),
    sortable: true,
  },
]);
const rows = ref([]);
const getRows = async () => {
  const query = {};
  if (props.operateur) {
    query.operateur = props.operateur;
  }
  if (props.filter?.date) {
    const dateProp = props.filter.date;
    const today = new Date();

    if (dateProp == "today") {
      query.date = {
        $gte: date.startOfDate(today, "day"),
        $lte: date.endOfDate(today, "day"),
      };
    } else if (dateProp == "week") {
      let start = date.subtractFromDate(today, { days: 6 });
      query.date = {
        $gte: date.startOfDate(start, "day"),
        $lte: date.endOfDate(today, "day"),
      };
      console.log(query.date);
    } else if (dateProp == "month") {
      query.date = {
        $gte: date.startOfDate(today, "month"),
        $lte: date.endOfDate(today, "month"),
      };
    }
  }
  if (props.filter?.type) {
    query.type = props.filter.type;
  }
  if (route.fullPath.endsWith("clients")) {
    query.fournisseur = false;
  } else {
    query.fournisseur = true;
  }
  if (props?.filter.telephone) {
    query.$where = `this.telephone.includes('${props.filter.telephone}')`;
  }
  rows.value = await transactions.getTransactions(query);
};
const optionStore = useOptionStore();

onMounted(async () => {
  getRows();
  const userOptions = await transactions.setUserOptions();

  optionStore.setUserOptions(userOptions);
  if (!optionStore.views.has_seen_transaction_list) {
    setTimeout(() => {
      driverObj.drive();
    }, 1000);
  }
});

watch(() => props.operateur, getRows, { immediate: true });

watch(() => props.filter, getRows);
</script>
