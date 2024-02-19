<template>
  <div class="row justify-between">
    <q-card flat bordered style="width: 49%">
      <q-card-section horizontal>
        <q-card-section class="col">
          <div class="text-h5 q-pb-sm">
            Solde {{ operateur || "principal" }} ( UV )
          </div>
          <div
            class="text-h4 text-bold"
            :class="isUvSufficient ? 'text-positive' : 'text-negative'"
          >
            {{ soldeStore.uv[props.operateur || "principal"].toLocaleString() }}
            f
          </div>
        </q-card-section>
        <q-card-section class="d-flex align-center">
          <q-icon
            :color="isUvSufficient ? 'positive' : 'negative'"
            size="xl"
            :name="isUvSufficient ? 'check' : 'close'"
          ></q-icon>
        </q-card-section>
      </q-card-section>
    </q-card>
    <q-card flat bordered style="width: 49%">
      <q-card-section horizontal>
        <q-card-section class="col">
          <div class="text-h5 q-pb-sm">
            Solde {{ operateur || "principal" }} ( caisse )
          </div>
          <div
            class="text-h4 text-bold"
            :class="isCaisseSufficient ? 'text-positive' : 'text-negative'"
          >
            {{ soldeStore.caisse[operateur || "principal"].toLocaleString() }} f
          </div>
        </q-card-section>
        <q-card-section class="d-flex align-center">
          <q-icon
            :color="isCaisseSufficient ? 'positive' : 'negative'"
            size="xl"
            :name="isCaisseSufficient ? 'check' : 'close'"
          ></q-icon>
        </q-card-section>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup>
import { useSoldeStore } from "src/stores/solde";
import { computed } from "vue";

const props = defineProps({
  operateur: { type: String, default: "principal" },
});
const soldeStore = useSoldeStore();
const isUvSufficient = computed(
  () => soldeStore.uv[props.operateur || "principal"] > 50_000
);
const isCaisseSufficient = computed(
  () => soldeStore.caisse[props.operateur || "principal"] > 50_000
);
</script>
