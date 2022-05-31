<template>
      <v-list dense nav>
        <v-list-item>
          <v-list-item-content class="app-logo">
            <v-img src="@/assets/soilbird_logo.png" ></v-img>
          </v-list-item-content>
        </v-list-item>

          <v-list-item>
            <v-list-item-title> {{ $t('app.description') }} </v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
        
        <v-list-item-group v-model="selected" mandatory>
          <v-list-item
          :key="$t('navigation.drawerTitles.summary')"
          link
        >
          <v-list-item-icon>
            <v-icon> {{summaryIcon}} </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title @click="navigateToSummary"> {{ $t('navigation.drawerTitles.summary') }} </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-group
          :value="false"
          :prepend-icon="fieldIcon"
        >
          <template v-slot:activator>
            <v-list-item-title> {{ $t('navigation.drawerTitles.turf') }} </v-list-item-title>
          </template>
          <v-list-item
            v-for="property in sportsProperties"
            :key="property.name"
            :to="'/boss/property/' + property.path_name"
            >
            <v-list-item-title>
              {{property.name}}
            </v-list-item-title>
          </v-list-item>
        </v-list-group>
        <v-list-item
          :key="$t('navigation.drawerTitles.compare')"
          link
        >
          <v-list-item-icon>
            <v-icon> {{compareIcon}} </v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title @click="navigateToCompare"> {{ $t('navigation.drawerTitles.compare') }} </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <!-----
        <v-list-item disabled>
            <v-list-item-subtitle class="list-subheader"> {{ $t('navigation.drawerSubheaders.editActions') }} </v-list-item-subtitle>
          </v-list-item>--->
          <v-list-group
          :value="false"
          :prepend-icon="systemControlIcon"
          >
            <template v-slot:activator>
              <v-list-item-title>{{ $t('navigation.drawerTitles.systemControl') }}  </v-list-item-title>
            </template>
            <v-list-item>
              <v-list-item-title @click="navigateToUsers">
                {{ $t('navigation.drawerSubheaders.users') }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title @click="navigateToLogic">
                {{ $t('navigation.drawerSubheaders.logic') }}
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title @click="navigateToProperties">
                {{ $t('navigation.drawerSubheaders.property') }}
              </v-list-item-title>
            </v-list-item>
          </v-list-group>
          <v-divider></v-divider>
          <v-list-item link>
            <v-list-item-title @click="changeMode"> {{ $t('navigation.drawerTitles.changeMode') }} </v-list-item-title>
          </v-list-item>
          <v-list-item link>
            <v-list-item-title @click="logout"> {{ $t('navigation.drawerTitles.logout') }} </v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
</template>

<script lang="ts">
import Vue from 'vue'
import {SportsProperty} from '@/static/SportsPropertyType'
//import {SoilscoutAPILibrary} from '../services/SoilscoutAPILibrary'

export default Vue.extend({
  mounted() {
    this.getSportsProperties()
  },
    data: function() {
      return {
        summaryIcon: Vue.$stringLibrary.mdiIcons.summary,
        fieldIcon: Vue.$stringLibrary.mdiIcons.field,
        compareIcon: Vue.$stringLibrary.mdiIcons.compare,
        systemControlIcon: Vue.$stringLibrary.mdiIcons.systemControl,
        selected: 0,
        sportsProperties : new Array<SportsProperty>()
      }
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
      changeMode: function() {
        this.$router.push({ name: 'DashboardCommon'})
      },
      logout: function() {
        localStorage.clear()
        this.$router.push({path: '/login'})
      },
      navigateToCompare: function() {
        this.$router.replace({path: "/boss/compare"})
      },
      navigateToSummary: function() {
        this.$router.replace({path: "/boss/summary"})
      },
      navigateToUsers: function() {
        this.$router.replace({path: "/boss/settings/users"})
      },
      navigateToLogic: function() {
        this.$router.replace({path: "/boss/settings/logic"})
      },
      navigateToProperties: function() {
        this.$router.replace({path: "/boss/settings/properties"})
      }
    },
    watch: {
      $route: function() {
        console.log('Route changed in NavDrawerBoss ', this.$route)
        
      },
      selected: function() {
        console.log('Selected navigation box changed ', this.selected)
      }
    }
})
</script>

<style lang="scss">
@import '~vuetify/src/styles/main.sass';

  .list-subheader {
    @extend .text-subtitle-2;
    color: black !important; 
  }
</style>