import { defineStore } from "pinia";

export const useOptionStore = defineStore("option", {
  state: () => ({
    views: {},
    backup: {},
    solde: {},
    theme: {},
    date: new Date(),
  }),

  actions: {
    setOption({ name, key, value }) {
      if (this[name]) {
        this[name][key] = value;
      } else {
        this[name] = {};
        this[name][key] = value;
      }

      this.date = new Date();
    },
    setUserOptions(data) {
      if (data && typeof data == "object") {
        for (let key in data) {
          this[key] = data[key];
        }
        this.date = new Date();
      }
    },
  },
});
