<template>
  <router-view />
  <q-dialog v-model.number="openDialog" persistent>
    <q-card bordered flat>
      <q-card-section>
        <div class="text-h4">Ouverture de la caisse</div>
      </q-card-section>

      <q-card-section>
        <q-item class="q-pl-none text-h6" header>Solde Uv</q-item>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model.number="form_data.uv.wave"
              type="number"
              min="0"
              outlined
              label="Wave"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form_data.uv.orange"
              type="number"
              min="0"
              outlined
              label="Orange Money"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form_data.uv.mtn"
              type="number"
              min="0"
              outlined
              label="Mtn Money"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form_data.uv.moov"
              type="number"
              min="0"
              outlined
              label="Flooz"
            ></q-input>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-item class="q-pl-none text-h6" header>Solde Caisse</q-item>
        <div class="row q-col-gutter-sm">
          <div class="col-6">
            <q-input
              v-model.number="form_data.caisse.wave"
              outlined
              label="Wave"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form_data.caisse.orange"
              outlined
              label="Orange Money"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form_data.caisse.mtn"
              outlined
              label="Mtn Money"
            ></q-input>
          </div>
          <div class="col-6">
            <q-input
              v-model.number="form_data.caisse.moov"
              outlined
              label="Flooz"
            ></q-input>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-item class="q-pl-none text-h6" header>Tout</q-item>
        <q-toggle
          v-model.number="prefill"
          label="réremplir avec la clôture d'hier"
        ></q-toggle>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="fermer"
          @click="openDialog = false"
          color="negative"
          flat
        ></q-btn>
        <q-btn
          label="enregistrer"
          @click="updateSolde()"
          flat
          color="primary"
        ></q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { onMounted, ref, watch } from "vue";
import { useSoldeStore } from "./stores/solde";
import { useOptionStore } from "./stores/user-options";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useQuasar } from "quasar";

const $q = useQuasar();
const driverObj = driver({
  showProgress: true,
  steps: [
    {
      element: "#liste-navigation",
      popover: {
        title: "Les liens de navigation ",
        description:
          "Cette sections contient les liens necessaire pour naviguer dans l'application",
      },
    },
    {
      element: "#liste-configuration",
      popover: {
        title: "Les boutons de configurations",
        description:
          "Cette sections contient les boutons  necessaire pour personnaliser l'apparence et le comportement de application",
      },
    },
    {
      element: "#list-operateurs",
      popover: {
        title: "Les operateurs",
        description: `C'est la liste des operateurs. Choisir un operateur permet d'acceder à des fonctionnalités lié à celui ci.
          \nExemple: si vous ne choisissez pas d'opérateur vous ne pouvez pas enregistrer de transaction, ou avoir les statistiques de cet operateur`,
      },
    },
    {
      element: "#footer",
      popover: {
        title: "Rappel",
        description:
          "Ce produit est entièrement gratuit, si vous voulez plus de fonctionnalités veuillez me contacter au +225 0787572030. Merci",
      },
    },
  ],
  onDestroyed: async () =>
    await transactions.setUserOptions("views", "has_seen_app", true),
});

const optionStore = useOptionStore();
const soldeStore = useSoldeStore();
const openDialog = ref(false);
const prefill = ref(false);
let data;
const form_data = ref({
  uv: { wave: 0, orange: 0, mtn: 0, moov: 0 },
  caisse: { wave: 0, orange: 0, mtn: 0, moov: 0 },
});
const updateSolde = async (data, initData = null) => {
  if (!data) {
    data = {};
    if (!initData) {
      initData = {};
      for (let key in form_data.value) {
        const val = form_data.value[key];
        if (val instanceof Date) initData[key] = val;
        else {
          initData[key] = { ...val };
          initData[key].principal = Object.keys(val)
            .filter((el) => el != "principal")
            .map((el) => val[el])
            .reduce((sum, curr) => sum + curr, 0);
        }
      }
    }
  }

  const updated = await transactions.updateSolde(data, initData);
  if (updated?.acknowledged) {
    const soldes = await transactions.getSolde();
    soldeStore.setSolde(soldes);

    form_data.value = {};
    openDialog.value = false;
  }
};
onMounted(async () => {
  const userOptions = await transactions.setUserOptions();
  $q.dark.set(userOptions.theme.dark);
  optionStore.setUserOptions(userOptions);
  if (!optionStore.views.has_seen_app) {
    setTimeout(() => {
      driverObj.drive();
    }, 2000);
  }
  data = await transactions.getSolde();
  if (!data && optionStore.solde.start_with_last_date_value) {
    data = await transactions.getSolde(true);
    data.date = new Date();
    delete data._id;
    updateSolde({}, data);
  } else if (!data && !optionStore.solde.start_with_last_date_value) {
    data = await transactions.getSolde(true);
    delete data._id;
    openDialog.value = true;
  } else {
    if (data) soldeStore.setSolde(data);
  }
});

watch(prefill, (val) => {
  if (val) {
    for (let key in data) {
      form_data.value[key] = data[key];
    }
    form_data.value.date = new Date();
  }
});
</script>
