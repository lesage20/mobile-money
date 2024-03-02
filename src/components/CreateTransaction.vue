<template>
  <div v-bind="$attrs">
    <div class="q-py-md text-h6">
      Ajouter une
      {{ $route.fullPath.endsWith("clients") ? "transaction" : "recharge" }}
      <span :class="'text-' + op?.color + '-8'"> ( {{ op?.label }} ) </span>
    </div>
    <div class="row q-gutter-sm">
      <div class="col">
        <q-input
          v-model="data.telephone"
          outlined
          name="telephone"
          type="tel"
          label="Téléphone"
          :rules="phoneRules"
        ></q-input>
      </div>
      <div class="col">
        <q-input
          v-model.number="data.montant"
          outlined
          name="montant"
          type="number"
          label="Montant"
          :min="500"
        ></q-input>
      </div>
      <div class="col">
        <q-select
          v-model="data.type"
          name="type"
          label="Type de transaction"
          flat
          outlined
          map-options
          emit-value
          :options="
            $route.fullPath.endsWith('clients')
              ? [
                  { label: 'Dépot', value: 'depot' },
                  { label: 'Retrait', value: 'retrait' },
                ]
              : [
                  { label: 'Recharge Uv', value: 'recharge-uv' },
                  { label: 'Recharge Caisse', value: 'recharge-caisse' },
                ]
          "
        ></q-select>
      </div>
      <!-- <div class="col">
        <q-select
          v-model="data.operateur"
          outlined
          name="operateur"
          label="Operateur"
          :options="operateurs"
          map-options
          emit-value
        ></q-select>
      </div> -->
      <div class="d-flex align-bottom">
        <q-btn
          :loading="loading"
          @click="saveTransaction"
          :class="activeClass"
          size="lg"
          outline=""
          no-caps
          :label="`Enrengistrer (${op?.label})`"
        ></q-btn>
        <span></span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useQuasar } from "quasar";
import { ref, computed, inject, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import { v4 as uniqueId } from "uuid";
import { useSoldeStore } from "src/stores/solde";
import { driver } from "driver.js";
import { useOptionStore } from "src/stores/user-options";

const driverObj = driver({
  showProgress: true,
  steps: [
    {
      element: "#creer-transaction",
      popover: {
        title: "Enregistrer un transfert",
        description:
          "C'est ici que vous ajouter un tranfert (depot, retrait ou recharge de votre fournisseur). Il est dynamique en fonction de l'opérateur choisi",
      },
    },
  ],
  onDestroyed: async () =>
    await transactions.setUserOptions(
      "views",
      "has_seen_add_transaction",
      true
    ),
});

const soldeStore = useSoldeStore();
const activeClass = inject("activeClass");
const route = useRoute();
const emits = defineEmits(["saved"]);
const props = defineProps({
  operateur: {
    type: String,
    default: "",
  },
});
const $q = useQuasar();

const operateurs = ref([
  { label: "Wave", value: "wave", color: "blue" },
  { label: "Orange Money", value: "orange", color: "orange", start: "07" },
  { label: "MTN Money", value: "mtn", color: "yellow", start: "05" },
  { label: "Flooz", value: "moov", color: "green", start: "01" },
]);
const op = computed(() => {
  const current = operateurs.value.find((el) => el.value == props.operateur);
  return current;
});
const data = ref({ telephone: null, montant: 0, type: null });
const loading = ref(false);
const saveTransaction = async () => {
  loading.value = true;
  try {
    const toSave = {};
    for (let key in data.value) {
      if (!data.value[key]) {
        $q.notify(`${key}: Veuillez renseigner ce champs.`);
        return;
      }
      toSave[key] = data.value[key];
    }
    toSave.operateur = props.operateur;

    if (toSave.type == "retrait") {
      if (!(soldeStore.caisse[toSave.operateur] > toSave.montant)) {
        $q.notify({
          message: `Montant : Le solde de votre caisse est insuffisant pour effectuer ce transfert.\n Montant caisse : ${soldeStore.caisse[
            toSave.operateur
          ]?.toLocaleString()}f.`,
          type: "negative",
        });
        return;
      }
    } else if (toSave.type == "depot") {
      if (!(soldeStore.uv[toSave.operateur] > toSave.montant)) {
        $q.notify({
          message: `Montant : Le solde de votre uv est insuffisant pour effectuer ce transfert.\n Montant uv :${soldeStore.uv[
            toSave.operateur
          ]?.toLocaleString()}f.`,
          type: "negative",
        });
        return;
      }
    }

    if (props.operateur == "orange") {
      if (!toSave.telephone.startsWith("07")) {
        $q.notify({
          message: `Téléphone : Veuillez renseigner un numéro ${props.operateur}.`,
          type: "negative",
        });
        return;
      }
    } else if (props.operateur == "mtn") {
      if (!toSave.telephone.startsWith("05")) {
        $q.notify({
          message: `Téléphone : Veuillez renseigner un numéro ${props.operateur}.`,
          type: "negative",
        });
        return;
      }
    } else if (props.operateur == "moov") {
      if (!toSave.telephone.startsWith("01")) {
        $q.notify({
          message: `Téléphone : Veuillez renseigner un numéro ${props.operateur}.`,
          type: "negative",
        });
        return;
      }
    }
    toSave.date = new Date();

    if (route.fullPath.endsWith("fournisseurs")) {
      toSave.fournisseur = true;
    } else {
      toSave.fournisseur = false;
    }
    toSave.ref = uniqueId().toString();
    const inserted = await transactions.addTransaction(toSave);

    if (inserted?.acknowledged) {
      await transactions.updateSolde(toSave);
      soldeStore.addTransaction(toSave);
      $q.notify({
        message: "Transactions eneregistré avec succès",
        type: "positive",
      });
      emits("saved", toSave);
      data.value = {};
    } else {
      $q.notify({
        message: "Nous n'avons pas pu enregistrer cette transaction",
        type: "negative",
      });
    }
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};

let phoneRules = ref([]);

watch(
  () => op.value.value,
  () => {
    if (op.value.value != "wave") {
      phoneRules.value = [
        (val) =>
          !val ||
          /^\d+$/g.test(val) ||
          "Le numero de telephone ne peut pas contenir de lettre ou de symbole",
        (val) =>
          !val ||
          val.length >= 10 ||
          "Veuillez saisir un numéro d'au moins 10 chiffre",
        (val) =>
          !val ||
          val.startsWith(op.value?.start) ||
          `Ce numéro n\'est pas un numéro ${op?.value.value}`,
      ];
    } else {
      phoneRules.value = [
        (val) =>
          !val ||
          /^\d+$/g.test(val) ||
          "Le numero de telephone ne peut pas contenir de lettre ou de symbole",
        (val) =>
          !val ||
          val.length >= 10 ||
          "Veuillez saisir un numéro d'au moins 10 chiffre",
      ];
    }
  },
  { immediate: true }
);
watch(route, () => (data.value.type = ""));

const optionStore = useOptionStore();
onMounted(async () => {
  const userOptions = await transactions.setUserOptions();

  optionStore.setUserOptions(userOptions);
  // if (!optionStore.views.has_seen_add_transaction) {
  //   setTimeout(() => {
  //     driverObj.drive();
  //   }, 1000);
  // }
});
</script>
