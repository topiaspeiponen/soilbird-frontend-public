import Vue from 'vue'
import { SoilscoutAPILibrary } from './SoilscoutAPILibrary'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $soilscoutAPI: SoilscoutAPILibrary;
    }
  }
