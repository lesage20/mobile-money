<template>
  <q-page padding class="q-mx-xl">
    <div class="row justify-center">
      <div class="col-md-10 col-lg-7">
        <q-card bordered flat class="fit-width">
          <q-card-section>
            <div class="text-h5 text-regular">Paramètres</div>
          </q-card-section>

          <q-card-section>
            <q-item header class="text-grey q-pl-none">Thème</q-item>
            <div class="text-subtitle1 align-center flex justify-between">
              <span>Mode sombre</span>
              <q-toggle v-on:click="$q.dark.toggle()" v-model="dark"></q-toggle>
            </div>
          </q-card-section>

          <q-card-section>
            <q-item header class="text-grey q-pl-none">Solde</q-item>
            <div
              class="text-subtitle1 align-center flex justify-between text-grey"
            >
              <span>
                Commencer la journée avec le dernier solde en date ( Vous ne
                pouvez pas desactiver )
              </span>
              <q-toggle v-model="startWithLastDateValue" disable></q-toggle>
            </div>
          </q-card-section>

          <q-card-section>
            <q-item header class="text-grey q-pl-none">Sauvegarde</q-item>
            <div
              class="text-subtitle1 align-center flex justify-between text-grey"
            >
              <span>
                Sauvegarder quotidiennement les données sur google drive (
                bientot disponible )
              </span>
              <q-toggle disable v-model="google_drive"></q-toggle>
            </div>
          </q-card-section>

          <q-card-section>
            <q-item header class="text-grey q-pl-none">
              Guide de démarrage
            </q-item>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité l'ecran d'accueil </span>
              <q-toggle v-model="has_seen_app"></q-toggle>
            </div>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité la page des transactions </span>
              <q-toggle v-model="has_seen_transaction_list"></q-toggle>
            </div>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité l'ajout de transfert </span>
              <q-toggle v-model="has_seen_add_transaction"></q-toggle>
            </div>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité le dashboard </span>
              <q-toggle v-model="has_seen_dashboard"></q-toggle>
            </div>
          </q-card-section>

          <q-card-section>
            <q-item header class="text-grey q-pl-none">Modification</q-item>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> Autoriser suppression de données </span>
              <q-toggle disable v-model="allow_delete"></q-toggle>
            </div>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> Autoriser odification de données </span>
              <q-toggle disable v-model="allow_edit"></q-toggle>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              size="lg"
              color="negative"
              label="Réinitialiser les paramètres"
              flat
              no-caps=""
            ></q-btn>
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { useQuasar } from "quasar";
import { ref } from "vue";
import { useOptionStore } from "src/stores/user-options";

const optionStore = useOptionStore();

const $q = useQuasar();
const dark = ref($q.dark.isActive);
const startWithLastDateValue = ref(
  optionStore.solde.start_with_last_date_value
);

const google_drive = ref(optionStore.backup.google_drive.using);
const has_seen_app = ref(optionStore.views.has_seen_app);
const has_seen_dashboard = ref(optionStore.views.has_seen_dashboard);
const has_seen_transaction_list = ref(
  optionStore.views.has_seen_transaction_list
);
const has_seen_add_transaction = ref(
  optionStore.views.has_seen_add_transaction
);
const allow_edit = ref(optionStore.editing?.allow_edit);
const allow_delete = ref(optionStore.editing?.allow_delete);
</script>
