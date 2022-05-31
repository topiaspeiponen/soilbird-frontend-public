<template>
  <v-app>

    <v-navigation-drawer v-if="$route.path.includes('/boss')" app>
      <nav-drawer-boss/>
    </v-navigation-drawer>
    <v-navigation-drawer v-else-if="$route.path.includes('/common')" app>
      <nav-drawer-common/>
    </v-navigation-drawer>
    
    <v-main>
      <v-toolbar class="toolbar" flat dense v-if="$route.path.includes('/boss') || $route.path.includes('/common')">
        <v-breadcrumbs
        :items="getBreadcrumbItems()">
        </v-breadcrumbs>
      </v-toolbar>
      <v-container fluid >
        <router-view/>
      </v-container>
    </v-main>

  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import './components/NavDrawerBoss';
import NavDrawerBoss from './components/NavDrawerBoss.vue';
import NavDrawerCommon from './components/NavDrawerCommon.vue';
import { SportsProperty } from './static/SportsPropertyType';
import { Turf } from './static/TurfType';


export default Vue.extend({
  components: { NavDrawerBoss, NavDrawerCommon },
  name: 'App',

  
  data() {
    return {
      sportsProperties: new Array<SportsProperty>(),
      turfs: new Array<Turf>()
    }
  },
  methods: {
    getBreadcrumbItems() {
      let items = new Array<{text: string}>()
      if (this.$route.meta.breadCrumb instanceof Function) {
        console.log('item ', this.$route.meta.breadCrumb(this.$route))
        const breadcrumbArray = this.$route.meta.breadCrumb(this.$route);
        for (const i in breadcrumbArray) {
          let matchingProperty = {
            text: ''
          }
          this.sportsProperties.map((property : SportsProperty) => {
            if (property.path_name === breadcrumbArray[i].text) {
              matchingProperty.text = property.name
            }
          })
          if (matchingProperty.text !== '') {
            items.push(matchingProperty)
          } else {
            items.push(breadcrumbArray[i])
          }
          }
        
        
      } else {
        console.log('item ', this.$route.meta.breadCrumb)
      }
      console.log('breadcrumb items ', items)
      return items
    }
  },
  mounted() {
    console.log('route ', this.$route)
  },
  async created() {
    const fetchedSportsProperties = await Vue.$sportsPropertyAPI.getAllSportsProperties();
    this.sportsProperties = fetchedSportsProperties;
  }
}
);
</script>

<style lang="scss">

  .app-logo {
    max-width: 100px;
    height: auto;
    margin: auto;
  }

  .v-toolbar__content {
    padding: 0px !important;
  }

</style>
