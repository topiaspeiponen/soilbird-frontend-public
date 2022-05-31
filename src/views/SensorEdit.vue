<template>
  <div>
    <v-tabs v-model="selectedTab" v-if="!activatedPropertyCreation">
      <v-tab
      v-for="property in sportsProperties"
      :key="property.id">
        {{ property.name }} 
      </v-tab>
      <div class="add-property-fab-container">
      </div>
      <v-tabs-items v-model="selectedTab">
        <v-tab-item
        v-for="(property, index) in sportsProperties"
        :key="'item' + property.id + index">
          <v-list>
            <v-list-item-group v-if="!activatedPropertyForms.includes(property.id)">
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.id') }}
                  </v-list-item-title>
                  <v-list-item-subtitle >
                    {{property.id}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
                <v-list-item v-for="device in getDevicesForProperty(property.id)" :key="device.serial_number">
                    <v-list-item-title>
                        {{ device.serial_number }} asd
                    </v-list-item-title>
                </v-list-item>
              </v-list-item-group>
            
            <v-divider/>
            <v-list-item>
              <v-list-item-content v-if="!activatedTurfCreation">
                <v-list-item-title>
                  {{ $t('property.turfs') }}
                </v-list-item-title>
                <v-expansion-panels focusable>
                  <v-expansion-panel v-for="(turf) in getTurfsForProperty(property.id)" :key="turf.id" >
                    <v-expansion-panel-header>
                      {{ turf.name }}
                    </v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-list
                      v-if="!activatedTurfForms.includes(turf.id)">
                      </v-list>

                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>

    
  </div>
</template>

<style lang="scss">
  .add-property-fab-container {
    position: relative;
    margin-left: 8px;
  }
  .add-property-fab {
    top: 50%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
  }
  .property-creation-back {
  }
  .turf-creation-card {
    margin-top: 16px;
  }
  .confirm-actions {
    justify-content: flex-end;
  }
</style>

<script lang="ts">
  import { i18n } from '@/main';
import { SoilscoutDevice } from '@/services/SoilscoutAPIResponseTypes';
import { SportsProperty } from '@/static/SportsPropertyType';
import { Turf } from '@/static/TurfType';
import Vue from 'vue'

  export default Vue.extend({
    data: function() {
      return {
        selectedTab: 0,
        model: null,
        sportsProperties: new Array<SportsProperty>(),
        turfs: new Array<Turf>(),
        devices: new Array<SoilscoutDevice>(),
        propertyDeletionDialog: false,
        activatedPropertyCreation: false,
        activatedPropertyForms: new Array<string>(),
        activatedTurfCreation: false,
        activatedTurfForms: new Array<number>(),
        formRules: {
          required: (value : any) => !!value || i18n.t('logic.formRuleRequired'),
          isZip: (value: any) => (!value || /\d{5}/.test(value)) || i18n.t('property.notZip'),
          isCoordinateLat: (value: any) => /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/.test(value) || i18n.t('property.notCoord'),
          isCoordinateLon: (value: any) => /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/.test(value) || i18n.t('property.notCoord'),
          isID: (value: any) => /^(\d{1,4})$/.test(value) || i18n.t('property.notID')
        },
        propertyFormValid: true,
        propertyCreationFormValid: true,
        turfCreationFormValid: true,
        propertyCreationForm: {
          id: "",
          name: "",
          coordinatesLat: null,
          coordinatesLon: null,
          zip: "",
          waterGauges: ""
        },
        turfCreationForm: {
          name: null,
          sports_properties_id: null,
          sensors_group: null,
          sprinklers: null,
          coordinatesLat: null,
          coordinatesLon: null,
          waterGauges: null
        },
        propertyForm: {
          id: {} as { [id: number]: number },
          name: {} as { [id: number]: string },
          coordinatesLat: {} as { [id: number]: number },
          coordinatesLon: {} as { [id: number]: number },
          zip: {} as { [id: number]: string },
          waterGauges: {} as { [id: number]: string },
      },
      turfForm: {
        name: {} as { [id: number]: string },
        path_name: {} as { [id: number]: string },
        sports_properties_id: {} as { [id: number]: number },
        sensors_group: {} as { [id: number]: string },
        sprinklers: {} as { [id: number]: string },
        coordinatesLat: {} as { [id: number]: number },
        coordinatesLon: {} as { [id: number]: number },
        water_gauges: {} as { [id: number]: string }
      }
      }
    },
    computed: {
      
    },
    methods: {
      async getSportsProperties() {
        return await Vue.$sportsPropertyAPI.getAllSportsProperties();
      },
      async getTurfs() {
        return await Vue.$sportsPropertyAPI.getAllTurfs();
      },
      getTurfsForProperty(propertyId: number) {
        return this.turfs.filter(turf => turf.sports_properties_id === propertyId)
      },
      async submitNewPropertyForm() {
        console.log('Huisin hauskaa tämä työnteko ', this.propertyCreationFormValid)
        const refs : any = this.$refs
        refs['propertyCreationForm'].validate()
        if (this.propertyCreationFormValid) {
          const newProperty : SportsProperty = {
            primary_id: 0,
            id: 0,
            name: this.propertyCreationForm.name,
            path_name: this.propertyCreationForm.name.split(' ')[0].toLowerCase(),
            coordinates: {
              lat: this.propertyCreationForm.coordinatesLat!,
              lon: this.propertyCreationForm.coordinatesLon!
            },
            zip: this.propertyCreationForm.zip,
            water_gauges: this.propertyCreationForm.waterGauges
            
          }
          console.log('SubmitNewPropertyForm ', newProperty)
          await Vue.$sportsPropertyAPI.createSportsProperty(newProperty)
          await this.updateData()
          this.activatedPropertyCreation = false
        }
      },
      async submitPropertyForm(index: number) {
        // Due to the fact that V-model doesn't support default value setting for dynamic fields,
        // get each form value from pure HTML element reference
        const refs : any = this.$refs
        console.log(' ref ', refs['zipField'+index][0].$refs.input._value)
        console.log(' ref ', refs['nameField'+index][0].$refs.input._value)
        console.log(refs['propertyForm' + index][0].validate())
        if (refs['propertyForm'+index][0].validate()) {
          const name : string = refs['nameField'+index][0].$refs.input._value

          let newProperty : SportsProperty = {
            primary_id: 0,
            id: refs['idField'+index][0].$refs.input._value,
            name: name,
            path_name: name.split(' ')[0].toLowerCase(),
            coordinates: {
              lat: refs['latField'+index][0].$refs.input._value,
              lon: refs['lonField'+index][0].$refs.input._value
            },
            zip: refs['zipField'+index][0].$refs.input._value,
            water_gauges: refs['waterGaugesField'+index][0].$refs.input._value

          }
          console.log('new prop ', newProperty)
          await Vue.$sportsPropertyAPI.updateSportsProperty(newProperty)
          await this.updateData()
          this.activatedPropertyForms = []
        }
      },

      async deleteProperty(propertyId: number) {
        await Vue.$sportsPropertyAPI.deleteSportsProperty(propertyId)
        await this.updateData()
        this.propertyDeletionDialog = false
      },

      async submitTurfForm(turf: Turf) {
        const refs : any = this.$refs

        if (refs['turfForm' + turf.id][0].validate()) {
          let newTurf : Turf = {
            id: turf.id,
            name: refs['nameFieldTurf' + turf.id][0].$refs.input._value,
            path_name: turf.path_name,
            sports_properties_id: refs['parentFieldTurf' + turf.id][0].$refs.input._value,
            sensors_group: refs['sensorsGrpFieldTurf' + turf.id][0].$refs.input._value,
            sprinklers: turf.sprinklers,
            coordinates: {
              lat: refs['latFieldTurf' + turf.id][0].$refs.input._value,
              lon: refs['lonFieldTurf' + turf.id][0].$refs.input._value
            },
            water_gauges: refs['waterGaugesFieldTurf' + turf.id][0].$refs.input._value
          }
          console.log('new turf ', newTurf)
          await Vue.$sportsPropertyAPI.updateTurf(newTurf)
          await this.updateData()
          this.activatedTurfForms = []
        }
      },

      async fetchDevicesForProperty(propertyId: number) {
          const devices = await Vue.$soilscoutAPI.getSiteDevices(propertyId)
          return devices.filter((dev : SoilscoutDevice) => dev.device_type === 'hydra')
      },

    getDevicesForProperty(propertyId: number) {
      console.log('propertyID ', propertyId)
        return this.devices.filter(dev => dev.site === propertyId)
    },


      async updateData() {
        this.sportsProperties = await this.getSportsProperties()
        this.turfs = await this.getTurfs()
        let allDevices = new Array<SoilscoutDevice>()
        for (const i in this.sportsProperties) {
            const devicesForSite = await this.fetchDevicesForProperty(this.sportsProperties[i].id)
            allDevices = allDevices.concat(devicesForSite)
        }
        this.devices = allDevices
      }
    },
    async created() {
      await this.updateData()
      console.log('PropertyEdit created() ', this.sportsProperties, this.turfs, this.devices)
    }
  })
</script>
