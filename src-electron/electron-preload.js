import { contextBridge } from "electron";
import { MongoClient, ObjectId } from "mongodb";
import { date } from "quasar";
import os from "os";
const uri =
  "mongodb+srv://lesage:aPc7ZswJ2HaPnrED@mobile-money-manager.24aowmz.mongodb.net/transactions" ??
  "mongodb://127.0.0.1:27017/transactions";
const getCollection = async (col_name) => {
  const client = new MongoClient(uri);
  const db = client.db();
  const collection = db.collection(col_name);
  return { db, collection, client };
};

contextBridge.exposeInMainWorld("transactions", {
  getTransactions: async (query = {}) => {
    let transactions = [];
    const client = new MongoClient(uri);
    async function run() {
      try {
        const db = client.db();

        const collection = db.collection("transactions");
        query.agence = os.hostname();
        transactions = await collection
          .find(query)
          .sort({ date: -1 })
          .toArray();
      } finally {
        await client.close();
      }
    }
    await run();
    return transactions;
  },
  addTransaction: async (data) => {
    let inserted;
    const client = new MongoClient(uri);
    async function run() {
      try {
        const db = client.db();

        const collection = db.collection("transactions");
        data.agence = os.hostname();
        inserted = await collection.insertOne(data);
      } finally {
        await client.close();
      }
    }
    await run();
    return inserted;
  },
  updateTransaction: async (data) => {
    let updated;
    const { client, collection } = await getCollection("transactions");

    try {
      const unique = data.ref;
      delete data.ref;
      updated = await collection.updateOne(
        { ref: unique, agence: os.hostname() },
        { $set: data }
      );
    } finally {
      await client.close();
    }

    return updated;
  },

  updateSolde: async ({ operateur, montant, type }, initData) => {
    const { client, db, collection } = await getCollection("historique_solde");
    const agence = db.collection("agence");
    const today = new Date();
    const start = date.startOfDate(today, "day");
    const end = date.endOfDate(today, "day");
    let data = await collection.findOne({
      date: { $gte: start, $lte: end },
      agence: os.hostname(),
    });
    if (!data) {
      if (initData) data = initData;
      else {
        data = {
          uv: {
            principal: 0,
            wave: 0,
            orange: 0,
            mtn: 0,
            moov: 0,
          },
          caisse: {
            principal: 0,
            wave: 0,
            orange: 0,
            mtn: 0,
            moov: 0,
          },
          date: today,
        };
      }
    }

    if (type == "retrait") {
      data.uv.principal += montant;
      data.uv[operateur] += montant;
      data.caisse.principal -= montant;
      data.caisse[operateur] -= montant;
    } else if (type == "depot") {
      data.uv.principal -= montant;
      data.uv[operateur] -= montant;
      data.caisse.principal += montant;
      data.caisse[operateur] += montant;
    } else if (type == "recharge") {
      data.uv.principal += montant;
      data.uv[operateur] += montant;
    } else if (type == "recharge-caisse") {
      data.caisse.principal += montant;
      data.caisse[operateur] += montant;
    }
    const updated = await collection.updateOne(
      { date: { $gte: start, $lte: end }, agence: os.hostname() },
      {
        $set: data,
      },
      { upsert: true }
    );
    const ids = [];
    const infos = os.networkInterfaces();
    for (let id in infos) {
      if (id != "lo") {
        ids.push(infos[id].map((el) => ({ address: el.address, mac: el.mac })));
      }
    }
    const agence_info = {
      name: os.hostname(),
      ids,
    };
    await agence.updateOne(
      { name: agence_info.name },
      { $set: agence_info },
      { upsert: true }
    );
    client.close();
    return updated;
  },
  getSolde: async (last = false) => {
    const { client, collection } = await getCollection("historique_solde");
    let data;
    if (!last) {
      const today = new Date();
      const start = date.startOfDate(today, "day");
      const end = date.endOfDate(today, "day");
      data = await collection.findOne({
        date: { $gte: start, $lte: end },
        agence: os.hostname(),
      });
    } else {
      data = await collection
        .find({ agence: os.hostname() })
        .sort({ date: -1 })
        .limit(1)
        .toArray();
      if (data.length) data = data[0];
    }
    client.close();
    return data;
  },
  getTotalAndCount: async (operateur) => {
    const { client, collection } = await getCollection("transactions");
    const today = new Date();

    const toExport = {};
    const periods = [
      { name: "today", days: 0 },
      { name: "week", days: 7 },
      { name: "month", days: 30 },
    ];
    for (let key of periods) {
      let start = date.subtractFromDate(today, { days: key.days });
      start = date.startOfDate(start, "day");
      const end = date.endOfDate(today, "day");
      const query = {
        date: { $gte: start, $lte: end },
      };
      if (operateur) query.operateur = operateur;
      query.agence = os.hostname();
      let data = await collection.find(query).toArray();
      toExport[key.name] = {};
      // toExport[key.name].global = { montant: 0, count: 0 };
      const types = data.map((el) => el.type);
      types.sort();
      for (let type of types) {
        const typeData = {
          montant: data
            .filter((el) => el.type == type)
            .map((el) => Number(el.montant))
            .reduce((sum, curr) => sum + curr, 0),
          count: data.filter((el) => el.type == type).length,
        };
        toExport[key.name][type] = typeData;
        // toExport[key.name].global.montant += typeData.montant;
        // console.log(toExport[key.name].global.count, typeData.count);
        // toExport[key.name].global.count += typeData.count;
      }
    }
    client.close();
    return toExport;
  },
  setUserOptions: async (name, key, value) => {
    const { client, collection } = await getCollection("user_options");
    let user_options = await collection.findOne({ agence: os.hostname() });
    if (!user_options) {
      user_options = {};
      user_options.views = {
        has_seen_app: false,
        has_seen_dashboard: false,
        has_seen_transaction_list: false,
        has_seen_add_transaction: false,
      };
      user_options.theme = { dark: true };
      user_options.google_drive = { using: false };
      user_options.solde = {
        start_with_last_date_value: false,
      };
      user_options.editing = {
        allow_edit: false,
        allow_delete: false,
      };
    } else {
      if (name && key && value != null) {
        if (user_options[name] && typeof user_options[name] == "object") {
          user_options[name][key] = value;
        } else {
          user_options[name] = {};
          user_options[name][key] = value;
        }
      } else if (name && key != null) {
        if (user_options[name] && typeof user_options[name] == "object") {
          user_options[name] = key;
        } else {
          user_options[name] = key;
        }
      }
    }
    user_options.date = new Date();

    const updated = await collection.updateOne(
      { agence: os.hostname() },
      { $set: user_options },
      { upsert: true }
    );
    client.close();
    return user_options;
  },
});
