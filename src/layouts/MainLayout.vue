<template>
  <q-layout view="lHh Lpr lFf">
    <q-drawer persistent show-if-above>
      <q-list id="liste-navigation">
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
      <div class="fixed-bottom flex column q-pt-sm" id="liste-configuration">
        <EssentialLink
          dense
          title="paramètres"
          icon="settings"
          link="/settings"
          :active-class="activeClass"
        />
        <!-- <EssentialLink
          dense
          :title="$q.dark.isActive ? 'Mode Claire' : 'Mode Sombre'"
          icon="contrast"
          @click.prevent="$q.dark.toggle"
          :link="null"
          :active-class="activeClass"
          :class="$q.dark.isActive ? 'text-primary' : ''"
        /> -->

        <EssentialLink
          @click.prevent
          dense
          title="A propos"
          icon="info"
          :link="null"
        />
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer
      id="footer"
      class="text-center text-primary"
      :class="$q.dark.isActive ? 'bg-dark ' : 'bg-white'"
    >
      Ce produit est gratuit ne l'achetez sous aucun pretexte &#128151; Le Sage
      Code {{ "+225 07 87 57 20 30" }} &#128151;
    </q-footer>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, provide } from "vue";
import { useQuasar } from "quasar";
import EssentialLink from "components/EssentialLink.vue";

const activeClass = ref("text-primary");
provide("activeClass", activeClass);
const $q = useQuasar();
const essentialLinks = [
  {
    title: "Appercue",
    link: "/",
    icon: "dashboard_customize",
  },
  {
    title: "Transaction Clients",
    link: { name: "transactions", params: { userType: "clients" } },
    icon: "receipt_long",
  },
  {
    title: "Recharge fournisseurs",
    link: { name: "transactions", params: { userType: "fournisseurs" } },
    icon: "currency_exchange",
  },
];

const darkMode = ref($q.dark.isActive);
</script>
