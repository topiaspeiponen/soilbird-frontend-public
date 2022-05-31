import Vue from 'vue'
import { UsersAPI } from './UsersAPI'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $usersAPI: UsersAPI;
    }
  }
