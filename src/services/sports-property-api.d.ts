import Vue from 'vue'
import { SportsPropertyAPI } from './SportsPropertyAPI'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $sportsPropertyAPI: SportsPropertyAPI;
    }
  }
