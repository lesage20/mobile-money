const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/IndexPage.vue"),
        children: [
          {
            path: "",
            component: () => import("components/MainCard.vue"),
            name: "dashboard",
          },
          {
            path: "transactions/:userType",
            component: () => import("components/TransactionTable.vue"),
            name: "transactions",
          },
        ],
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("pages/SettingPage.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
