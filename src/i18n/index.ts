import { Locales } from "./locales";
import en from "./en.json";
import fi from "./fi.json";
import VueI18n from "vue-i18n";
import Vue from 'vue';

Vue.use(VueI18n)

export const messages = {
  [Locales.FI]: fi,
  [Locales.EN]: en
};

export const defaultLocale = Locales.FI;

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: defaultLocale,
  fallbackLocale: defaultLocale, // set locale
  messages, // set locale messages
});
console.log('index.ts i18n ', i18n)

export default i18n;