<template>
  <q-page padding class="q-mx-d">
    <div class="row justify-center">
      <div class="col-md-10 col-lg-8 col-xl-7">
        <q-card bordered flat class="fit-width">
          <q-card-section>
            <div class="text-h5 text-regular">Paramètres</div>
          </q-card-section>
          <q-card-section class="flex flex-center text-grey" v-if="loading">
            <q-spinner-ios size="lg"></q-spinner-ios>
            <q-item-label class="q-ml-md text-h5">
              En cours de traitement
            </q-item-label>
          </q-card-section>
          <q-card-section>
            <q-item header class="text-grey q-pl-none">Thème</q-item>
            <div class="text-subtitle1 align-center flex justify-between">
              <span>Mode sombre</span>
              <q-toggle
                v-on:click="setOption('theme', 'dark', !$q.dark.isActive)"
                v-model="dark"
              ></q-toggle>
            </div>
          </q-card-section>

          <q-card-section>
            <q-item header class="text-grey q-pl-none">Solde</q-item>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> Commencer la journée avec le dernier solde en date </span>
              <q-toggle
                v-on:click="
                  setOption(
                    'solde',
                    'start_with_last_date_value',
                    startWithLastDateValue
                  )
                "
                v-model="startWithLastDateValue"
              ></q-toggle>
              <div class="col-10 text-body text-grey">
                Activez cette options pour ne pas remplir les soldes
                manuellement chaque jour. Certaines agences ne reviennent pas
                avec les mêmes soldes que la veille. dans ce cas ils sont obligé
                de desactiver.
              </div>
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
              <q-toggle
                v-on:click="setOption('google_drive', 'using', google_drive)"
                disable
                v-model="google_drive"
              ></q-toggle>
            </div>
          </q-card-section>

          <q-card-section v-if="false">
            <q-item header class="text-grey q-pl-none">
              Guide de démarrage
            </q-item>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité l'ecran d'accueil </span>
              <q-toggle
                v-on:click="setOption('views', 'has_seen_app', has_seen_app)"
                v-model="has_seen_app"
              ></q-toggle>
            </div>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité la page des transactions </span>
              <q-toggle
                v-on:click="
                  setOption(
                    'views',
                    'has_seen_transaction_list',
                    has_seen_transaction_list
                  )
                "
                v-model="has_seen_transaction_list"
              ></q-toggle>
            </div>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité l'ajout de transfert </span>
              <q-toggle
                v-on:click="
                  setOption(
                    'views',
                    'has_seen_add_transaction',
                    has_seen_add_transaction
                  )
                "
                v-model="has_seen_add_transaction"
              ></q-toggle>
            </div>
            <div class="text-subtitle1 align-center flex justify-between">
              <span> J'ai déja visité le dashboard </span>
              <q-toggle
                v-on:click="
                  setOption('views', 'has_seen_dashboard', has_seen_dashboard)
                "
                v-model="has_seen_dashboard"
              ></q-toggle>
            </div>
          </q-card-section>

          <q-card-section>
            <q-item header class="text-grey q-pl-none">Modification</q-item>
            <div
              class="text-subtitle1 align-center flex justify-between text-grey"
            >
              <span>
                Autoriser suppression de données ( bientôt disponible )
              </span>
              <q-toggle
                v-on:click="setOption('editing', 'allow_delete', allow_delete)"
                disable
                v-model="allow_delete"
              ></q-toggle>
            </div>
            <div
              class="text-subtitle1 align-center flex justify-between text-grey"
            >
              <span>
                Autoriser odification de données ( bientôt disponible )</span
              >
              <q-toggle
                v-on:click="setOption('editing', 'allow_edit', allow_edit)"
                disable
                v-model="allow_edit"
              ></q-toggle>
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
const startWithLastDateValue = ref(
  optionStore.solde.start_with_last_date_value
);
const loading = ref(false);
const dark = ref(optionStore.theme.dark);
const google_drive = ref(optionStore.google_drive.using);
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

const setOption = async (name, key, value) => {
  loading.value = true;
  try {
    await transactions.setUserOptions(name, key, value);
    if (key == "dark") $q.dark.toggle();
    optionStore.setOption({ name, key, value });
  } catch (err) {
    console.log(err);
  } finally {
    loading.value = false;
  }
};
</script>
