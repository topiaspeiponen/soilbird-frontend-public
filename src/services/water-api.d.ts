import Vue from 'vue'
import { WaterAPI } from './WaterAPI'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $waterAPI: WaterAPI;
    }
  }
