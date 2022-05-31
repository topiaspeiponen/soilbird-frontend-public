<template>
<div>
  <div class="all-fields-container" v-if="!turfsLoading">
    <v-tabs v-model="active_tab" class="main-tabs">
      <v-tab
        v-model="active_tab"
        v-for="field in getFilteredTurfs()"
        :key="field.path_name"
        @click="changeSelectedTurf(field)"
      >
        {{ field.name }}
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="active_tab">
      <v-tab-item v-for="field in getFilteredTurfs()" :key="field.path_name + 'item'">
        <field :turf="field" :propertyName="selectedProperty"></field>
      </v-tab-item>
    </v-tabs-items>
  </div>
  <v-progress-circular v-if="turfsLoading"></v-progress-circular>
</div>
</template>

<script lang="ts">
//import router from '@/router';
import Vue from "vue";
import { SportsProperty } from "../static/SportsPropertyType";
import { Turf } from "../static/TurfType";
import Field from './Field.vue';

export default Vue.extend({
  components: {
    Field
  },
  data: () => ({
    active_tab: 0,
    selectedProperty: "",
    selectedTurf: {} as Turf,
    footballFieldsInSelectedProperty: new Array<Turf>(),
    turfsLoading: true
  }),
  // Set initial fields
  created: async function() {
    
  },
  mounted() {
    this.setupTurfs()
  },
  computed: {
    path_prefix() {
      if (this.$route.path.includes('common')) {
        return 'common'
      } else if (this.$route.path.includes('boss')) {
        return 'boss'
      } else {
        return 'common'
      }
    }
  },

  methods: {
    changeSelectedTurf(turf: Turf) {
      this.selectedTurf = turf
    },
    async setupTurfs() {
      await this.getTurfs().then((response) => {
        console.log('Turfs returned in created ', response)
        this.footballFieldsInSelectedProperty = response
        this.turfsLoading = false
      })
    },

    getFilteredTurfs() {
      if (this.footballFieldsInSelectedProperty.length <= 2) {
        return this.footballFieldsInSelectedProperty
      } else {
        return this.footballFieldsInSelectedProperty
      }
    },

    async getTurfs() {
      
     const turfs : Turf[] = await this.getSportsProperties().then(async (properties) => {
       var returnedTurfs : Turf[] = []

       // Loop through sports properties to see if current path matches with any sports properties and return turfs for that property
        for (const property in properties) {
          const value = properties[property]
          console.log('Foreach turf in property ', value, value.path_name === this.$route.params.property, this.$route.params.property)
          if (value.path_name === this.$route.params.property) {
            this.selectedProperty = value.path_name
            console.log('Path matched with property ', this.selectedProperty)
            const foundTurfs = await Vue.$sportsPropertyAPI.getTurfsInSportsProperty(value.id).then(async(turfsInProperty: Turf[]) => {
              console.log('Found turf in property ', turfsInProperty)
              var turfsToReturn: Turf[] = [];
              turfsToReturn = turfsInProperty
              if (turfsInProperty.length > 1) {
                const allTurfs : Turf = {
                  id: 0,
                  name: "Kaikki",
                  path_name: "kaikki",
                  sports_properties_id: value.id,
                  sensors_group: "kaikki",
                  sprinklers: [""],
                  coordinates: {
                    lat: value.coordinates.lat,
                    lon: value.coordinates.lon
                  },
                  water_gauges: ""
                }
                turfsToReturn.unshift(allTurfs)
              }
              
              
              console.log('Turfsss ', turfsToReturn)

              // Set currently selected turf based on path
              this.selectedTurf = turfsInProperty[0]

              return turfsToReturn;
            })
            console.log('FoundTurfs', foundTurfs)
            returnedTurfs = foundTurfs
          }
        }
        return returnedTurfs
        })
      console.log('Turfs in the end ', turfs)
      return turfs;
    },

    async getSportsProperties() : Promise<SportsProperty[]> {
      const sportsProperties : SportsProperty[] = await Vue.$sportsPropertyAPI.getAllSportsProperties()
      console.log('sports properties ', sportsProperties)
      return sportsProperties
    }
  },

  watch: {
    $route: function() {
      // Check if the property is still the same, change tabs only upon property change
      if (this.footballFieldsInSelectedProperty && this.$route.params.property !== this.selectedProperty) {
        // Set new tabs when property is changed
        this.setupTurfs()

      }
    },
    footballFieldsInSelectedProperty: () => {
      console.log('asd')
    },
    selectedTurf: function() {
      console.log('Selected turf changed ', this.selectedTurf)
    }
  },
});
</script>

<style lang="scss">
  .main-tabs {
    margin-bottom: 8px;
  }
</style>
