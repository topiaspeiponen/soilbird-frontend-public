import Vue from 'vue'
import { AuthAPI } from './AuthAPI'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $authAPI: AuthAPI;
    }
  }
