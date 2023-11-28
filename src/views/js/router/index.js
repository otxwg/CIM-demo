import Vue from "vue";
import VueRouter from "vue-router";
import Base from "@/views/Base.vue";
// import FrontEnd from "@/views/FrontEnd.vue";


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "base",
    component: Base,
    children: [],
  },
  // {
  //   path: "/frontend",
  //   name: "frontend",
  //   component: FrontEnd,
  //   children: [],
  // },
  {
    path: "*",
    redirect: "/",
    meta: {
      keepAlive: true,
    },
  },
];

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes,
});
export function resetRouter() {
  router.matcher = new VueRouter({
    routes: [],
  }).matcher;
}

const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch((error) => error);
};

export default router;
