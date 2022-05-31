import { UsersAPI } from "./services/UsersAPI";
import { SportsPropertyAPI } from "./services/SportsPropertyAPI";
import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import VueApexCharts from "vue-apexcharts";
import "leaflet/dist/leaflet.css";
import { SoilscoutAPILibrary } from "./services/SoilscoutAPILibrary";
import { AuthAPI } from "./services/AuthAPI";
import { NotificationsAPI } from "./services/NotificationsAPI";
import StringLibrary from "./static/StringLibrary";
import VueI18n from "vue-i18n";
import i18n from "./i18n";
import Vuelidate from "vuelidate";
import { BaseAPI } from "./services/BaseAPI";
import {WaterAPI} from "./services/WaterAPI";
import PerfectScrollbar from 'vue2-perfect-scrollbar'
import 'vue2-perfect-scrollbar/dist/vue2-perfect-scrollbar.css'
import {defaultLocale, messages} from "./i18n";
 
Vue.use(PerfectScrollbar)
Vue.use(Vuelidate);


Vue.config.productionTip = false;
Vue.use(VueApexCharts);

const baseAPI = new BaseAPI();
const soilscoutAPI = new SoilscoutAPILibrary();
const authAPI = new AuthAPI();
const sportsPropertyAPI = new SportsPropertyAPI();
const notificationsAPI = new NotificationsAPI();
const usersAPI = new UsersAPI();
const waterAPI = new WaterAPI();

const start = async () => {
  Vue.$baseAPI = baseAPI;
  Vue.$soilscoutAPI = soilscoutAPI;
  Vue.$stringLibrary = StringLibrary;
  Vue.$authAPI = authAPI;
  Vue.$sportsPropertyAPI = sportsPropertyAPI;
  Vue.$notificationsAPI = notificationsAPI;
  Vue.$usersAPI = usersAPI;
  Vue.$waterAPI = waterAPI;
  console.log('18asn ', i18n)
  new Vue({
    beforeCreate: async function() {
      Vue.$baseAPI.init();
    },
    i18n,
    router,
    data: {
      appLoading: true,
      appError: null,
      isAuthenticated: false,
      user: {},
    },
    methods: {},
    store,
    vuetify,
    render: (h) => h(App),
  }).$mount("#app");
};
start();

export { i18n };
