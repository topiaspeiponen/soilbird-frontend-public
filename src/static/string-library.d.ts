import Vue from 'vue'
import { StringLibrary } from './StringLibrary'

declare module 'vue/types/vue' {
  interface VueConstructor {
    $stringLibrary: StringLibrary
    }
  }
