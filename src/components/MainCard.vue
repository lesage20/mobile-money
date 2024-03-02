<template>
  <SoldeCard id="card-solde" :operateur="operateur"></SoldeCard>
  <div id="card-periode" v-if="!loading">
    <q-card
      bordered
      flat
      style="border-radius: 10px"
      v-for="(stat, key) in stats"
      :key="key"
      class="q-my-md"
      :class="$q.dark.isActive ? 'text-grey-5' : ''"
    >
      <q-card-section horizontal>
        <q-card-section class="col">
          <div class="text-h5 q-pb-sm" v-if="!loading">{{ labels[key] }}</div>
          <q-skeleton width="200px" animation="pulse-y" type="rect" v-else />
        </q-card-section>
        <q-card-section class="">
          <q-icon
            size="md"
            color="positive"
            name="trending_up"
            v-if="!loading"
          ></q-icon>
          <q-skeleton animation="pulse" type="circle" v-else />
        </q-card-section>
      </q-card-section>

      <q-card-section horizontal v-if="!loading">
        <q-card-section
          class="col"
          v-for="(val, k) in stat"
          :key="`${val.count} ${k}`"
        >
          <div class="text-h6 q-pb-none">{{ k }}</div>
          <div class="text-h5">{{ val.count?.toLocaleString() }}</div>
          <div class="text-body1 text-bold">
            {{ val.montant?.toLocaleString() }} f
          </div>
        </q-card-section>
      </q-card-section>
      <q-card-section horizontal v-else>
        <q-card-section class="col" v-for="i in 3" :key="i">
          <q-skeleton width="100px" animation="fade" type="text" />
          <q-skeleton width="30px" animation="fade" type="text" />
          <q-skeleton width="300px" animation="fade" type="text" />
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
  <div id="card-periode-skeleton" v-else>
    <q-card
      bordered
      flat
      style="border-radius: 10px"
      v-for="ind in 3"
      :key="ind + 20"
      class="q-my-md"
      :class="$q.dark.isActive ? 'text-grey-5' : ''"
    >
      <q-card-section horizontal>
        <q-card-section class="col">
          <q-skeleton width="200px" animation="pulse-y" type="rect" />
        </q-card-section>
        <q-card-section class="">
          <q-skeleton animation="pulse" type="circle" />
        </q-card-section>
      </q-card-section>

      <q-card-section horizontal>
        <q-card-section class="col" v-for="i in 3" :key="i">
          <q-skeleton width="100px" animation="fade" type="text" />
          <q-skeleton width="30px" animation="fade" type="text" />
          <q-skeleton width="300px" animation="fade" type="text" />
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useSoldeStore } from "src/stores/solde";
import { useOptionStore } from "src/stores/user-options";
import SoldeCard from "./SoldeCard.vue";
import { driver } from "driver.js";

const driverObj = driver({
  showProgress: true,
  steps: [
    {
      element: "#card-solde",
      popover: {
        title: "Les soldes",
        description:
          "Cette sections affiche le solde uv et le montant dans la caisse",
      },
    },
    {
      element: "#card-periode",
      popover: {
        title: "Les statistiques courant",
        description:
          "Cette sections affiche les information concernant les transfert allant du jour actuel a 30 jour avant",
      },
    },
  ],
  onDestroyed: async () =>
    await transactions.setUserOptions("views", "has_seen_dashboard", true),
});
const optionStore = useOptionStore();
const soldeStore = useSoldeStore();
const props = defineProps({
  filter: Object,
  operateur: String,
});
const stats = ref({});
const labels = {
  today: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
};
const loading = ref(true);
const getStats = async () => {
  try {
    loading.value = true;
    const data = await transactions.getTotalAndCount(props.operateur);
    stats.value = data;
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  getStats();
  // const userOptions = await transactions.setUserOptions();

  // optionStore.setUserOptions(userOptions);
  // if (userOptions.views.has_seen_dashboard ) {
  //   setTimeout(() => {
  //     driverObj.drive();
  //   }, 1000);
  // }
});
watch(() => props.operateur, getStats);
</script>
