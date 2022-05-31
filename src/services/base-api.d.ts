import Vue from 'vue'
import { BaseAPI } from './BaseAPI'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $baseAPI: BaseAPI;
    }
  }
