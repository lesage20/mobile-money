<template>
  <router-view />
</template>

<script setup>
import { onMounted } from "vue";
import { useSoldeStore } from "./stores/solde";
import { useOptionStore } from "./stores/user-options";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

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
onMounted(async () => {
  const userOptions = await transactions.setUserOptions();

  optionStore.setUserOptions(userOptions);
  if (!optionStore.views.has_seen_app) {
    setTimeout(() => {
      driverObj.drive();
    }, 2000);
  }
  let data = await transactions.getSolde();
  if (!data && optionStore.solde.start_with_last_date_value) {
    data = await transactions.getSolde(true);
    data.date = new Date();
    delete data._id;
    await transactions.updateSolde({}, data);
  }
  soldeStore.setSolde(data);
});
</script>
