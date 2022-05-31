import Vue from 'vue'
import { NotificationsAPI } from './NotificationsAPI'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $notificationsAPI: NotificationsAPI;
    }
  }
