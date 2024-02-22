import { defineStore } from "pinia";

export const useSoldeStore = defineStore("solde", {
  state: () => ({
    uv: { principal: 0, wave: 0, orange: 0, mtn: 0, moov: 0 },
    caisse: { principal: 0, wave: 0, orange: 0, mtn: 0, moov: 0 },
    date: new Date(),
  }),
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
  actions: {
    addTransaction({ montant, type, operateur, date }) {
      if (type == "retrait") {
        this.uv.principal += montant;
        this.uv[operateur] += montant;
        this.caisse.principal -= montant;
        this.caisse[operateur] -= montant;
      } else if (type == "depot") {
        this.uv.principal -= montant;
        this.uv[operateur] -= montant;
        this.caisse.principal += montant;
        this.caisse[operateur] += montant;
      } else if (type == "recharge-uv") {
        this.uv.principal += montant;
        this.uv[operateur] += montant;
      } else if (type == "recharge-caisse") {
        this.caisse.principal += montant;
        this.caisse[operateur] += montant;
      }

      this.date = date;
    },
    setSolde(data) {
      if (data && typeof data == "object") {
        for (let key in data) {
          this[key] = data[key];
        }
      }
    },
  },
});
