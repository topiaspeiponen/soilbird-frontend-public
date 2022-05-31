<template>
      <v-list dense nav>
          <v-list-item>
            <v-list-item-content>
              <p>
                Kirjautunut: {{ getUserInfo }}
              </p>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-content class="app-logo">
              <v-img src="@/assets/soilbird_logo.png" ></v-img>
            </v-list-item-content>
          </v-list-item>
          <v-list-item>
            <v-list-item-title> {{ $t('app.description') }} </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>

          
        <v-list-group
          :value="true"
          :prepend-icon="fieldIcon"
        >
          <template v-slot:activator>
            <v-list-item-title> {{ $t('navigation.drawerTitles.turf') }} </v-list-item-title>
          </template>
          <v-list-item
            v-for="property in sportsProperties"
            :key="property.name"
            :to="'/common/' + property.path_name"
            >
            <v-list-item-title> {{property.name}} </v-list-item-title>
          </v-list-item>
        </v-list-group>
        <v-list-item link>
            <v-list-item-title @click="changeMode"> {{ $t('navigation.drawerTitles.changeMode') }} </v-list-item-title>
          </v-list-item>
        <v-list-item link>
          <v-list-item-title @click="logout"> {{ $t('navigation.drawerTitles.logout') }} </v-list-item-title>
        </v-list-item>
      </v-list>
</template>

<script lang="ts">
import Vue from 'vue'
import {SportsProperty} from '@/static/SportsPropertyType'

export default Vue.extend({
    data: function() {
      return {
        fieldIcon: Vue.$stringLibrary.mdiIcons.field,
        sportsProperties : new Array<SportsProperty>()
      }
    },
    mounted() {
    this.getSportsProperties()
  },
    computed: {
      getUserInfo() {
        const user = localStorage.getItem('user')
        if (user) {
          const parsedUser = JSON.parse(user)
          return parsedUser.name;
        } else {
          return 'Guest'
        }
      }
    },
    methods: {
      async getSportsProperties() {
      this.sportsProperties = await Vue.$sportsPropertyAPI.getAllSportsProperties()
    },
      clearStorage: function() {
        localStorage.clear()
      },
      changeMode: function() {
        this.$router.push({ name: 'DashboardBoss'})
      },
      logout: function() {
        localStorage.clear()
        this.$router.push({path: '/login'})
      }
    }
})
</script>

<style>
</style>