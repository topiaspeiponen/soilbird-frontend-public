<template>
  <div>
    <v-tabs v-model="selectedTab" v-if="!activatedPropertyCreation">
      <v-tab
      v-for="property in sportsProperties"
      :key="property.id">
        {{ property.name }} 
      </v-tab>
      <div class="add-property-fab-container">
        <v-btn x-small fab elevation="2" class="add-property-fab" @click="activatedPropertyCreation = true">
          <v-icon>
            mdi-plus
          </v-icon>
        </v-btn>
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
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.name') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{property.name}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.coordinates') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('property.latitude') }} {{property.coordinates.lat}}
                  </v-list-item-subtitle>
                  <v-list-item-subtitle>
                    {{ $t('property.longitude') }} {{property.coordinates.lon}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.zip') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{property.zip || $t('property.notDefined')}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.waterGauges') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{property.water_gauges || $t('property.notDefined')}}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
              
              <v-dialog v-model="propertyDeletionDialog" width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item>
                    <v-btn @click="activatedPropertyForms.push(property.id)" tile>
                      <v-icon>
                        mdi-pencil
                      </v-icon>
                    </v-btn>
                    <v-btn color="red a700" tile v-bind="attrs" v-on="on">
                      <v-icon>
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </v-list-item>
                </template>
                  <v-card>
                    <v-card-title>
                      {{ $t('property.confirmDeletePropertyTitle') }}
                    </v-card-title>
                    <v-card-subtitle>
                      {{ $t('property.confirmDeletePropertySubtitle') }}
                    </v-card-subtitle>
                    <v-card-actions class="confirm-actions">
                      <v-btn @click="propertyDeletionDialog = false">
                        {{ $t('property.confirmDeleteBackBtn') }}
                      </v-btn>
                      <v-btn color="red a700" @click="deleteProperty(property.primary_id)">
                        {{ $t('property.confirmDeleteBtn') }}
                      </v-btn>
                    </v-card-actions>
                  </v-card>
              </v-dialog>
              </v-list-item-group>
              <v-form
              :ref="'propertyForm' + index"
              v-if="activatedPropertyForms.includes(property.id)"
              v-model="propertyFormValid">
                <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.id') }}
                  </v-list-item-title>
                  <v-text-field
                  :ref="'idField' + index"
                  :value="property.id"
                  :rules="[formRules.required, formRules.isID]">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.name') }}
                  </v-list-item-title>
                  <v-text-field
                  :ref="'nameField' + index"
                  :value="property.name"
                  :rules="[formRules.required]">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.coordinates') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('property.latitude') }}
                  </v-list-item-subtitle>
                  <v-text-field
                  :ref="'latField' + index" 
                  :value="property.coordinates.lat"
                  :rules="[formRules.required, formRules.isCoordinateLat]">
                  </v-text-field>
                  <v-list-item-subtitle>
                    {{ $t('property.longitude') }}
                  </v-list-item-subtitle>
                  <v-text-field
                  :ref="'lonField' + index" 
                  :value="property.coordinates.lon"
                  :rules="[formRules.required, formRules.isCoordinateLon]">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.zip') }}
                  </v-list-item-title>
                  <v-text-field
                  :ref="'zipField' + index"
                  :rules="[formRules.isZip]"
                  :value="property.zip">

                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.waterGauges') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('property.hintWaterGauge') }}
                  </v-list-item-subtitle>
                  <v-text-field
                  :ref="'waterGaugesField' + index"
                  :value="property.water_gauges">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
                <v-list-item>
                  <v-btn @click="submitPropertyForm(index)">
                    <v-icon>
                      mdi-check
                    </v-icon>
                  </v-btn>
                  <v-btn @click="activatedPropertyForms = []">
                    <v-icon>
                      mdi-window-close
                    </v-icon>
                  </v-btn>
                </v-list-item>
              </v-form>
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
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ $t('property.name') }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{turf.name || $t('property.notDefined')}}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ $t('property.parentProperty') }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{turf.name || $t('property.notDefined')}}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ $t('property.sensorsGroup') }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{turf.sensors_group || $t('property.notDefined')}}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ $t('property.pathName') }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{turf.path_name || $t('property.notDefined')}}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ $t('property.coordinates') }}
                            </v-list-item-title>
                             <v-list-item-subtitle>
                                {{ $t('property.latitude') }} {{turf.coordinates.lat}}
                              </v-list-item-subtitle>
                              <v-list-item-subtitle>
                                {{ $t('property.longitude') }} {{turf.coordinates.lon}}
                              </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                         <v-list-item>
                          <v-list-item-content>
                            <v-list-item-title>
                              {{ $t('property.waterGauges') }}
                            </v-list-item-title>
                            <v-list-item-subtitle>
                              {{turf.water_gauges || $t('property.notDefined')}}
                            </v-list-item-subtitle>
                          </v-list-item-content>
                        </v-list-item>
                        <v-list-item>
                          <v-btn @click="activatedTurfForms.push(turf.id)">
                            <v-icon>
                              mdi-pencil
                            </v-icon>
                          </v-btn>
                          <v-btn>
                            <v-icon>
                              mdi-delete
                            </v-icon>
                          </v-btn>
                        </v-list-item>
                      </v-list>
                      <v-form
                      :ref="'turfForm' + turf.id"
                      v-if="activatedTurfForms.includes(turf.id)">
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.name') }}
                          </v-list-item-title>
                          <v-text-field
                          :ref="'nameFieldTurf' + turf.id" 
                          :value="turf.name"
                          :rules="[formRules.required]">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.coordinates') }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ $t('property.latitude') }}
                          </v-list-item-subtitle>
                          <v-text-field
                          :ref="'latFieldTurf' + turf.id" 
                          :value="turf.coordinates.lat"
                          :rules="[formRules.required, formRules.isCoordinateLat]">
                          </v-text-field>
                          <v-list-item-subtitle>
                            {{ $t('property.longitude') }}
                          </v-list-item-subtitle>
                          <v-text-field
                          :ref="'lonFieldTurf' + turf.id" 
                          :value="turf.coordinates.lon"
                          :rules="[formRules.required, formRules.isCoordinateLon]">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.parentProperty') }}
                          </v-list-item-title>
                          <v-text-field
                          :ref="'parentFieldTurf' + turf.id"
                          :value="turf.sports_properties_id"
                          :rules="[formRules.required]">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.sensorsGroup') }}
                          </v-list-item-title>
                          <v-text-field
                          :ref="'sensorsGrpFieldTurf' + turf.id"
                          :value="turf.sensors_group"
                          :rules="[formRules.required]">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.waterGauges') }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ $t('property.hintWaterGauge') }}
                          </v-list-item-subtitle>
                          <v-text-field
                          :ref="'waterGaugesFieldTurf' + turf.id"
                          :label="turf.water_gauges ? $t('logic.currentThreshold', {n: turf.water_gauges}) : $t('property.notYetDefined')"
                          :value="turf.water_gauges">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item>
                        <v-btn>
                          <v-icon @click="submitTurfForm(turf)">
                            mdi-check
                          </v-icon>
                        </v-btn>
                        <v-btn @click="activatedTurfForms = []">
                          <v-icon>
                            mdi-window-close
                          </v-icon>
                        </v-btn>
                      </v-list-item>
                      </v-form>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
                <v-btn small elevation="2" @click="activatedTurfCreation = true">
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
              </v-list-item-content>
              <v-slide-y-transition hide-on-leave>
                <v-card v-if="activatedTurfCreation" class="turf-creation-card" rounded>
                  <v-btn icon class="property-creation-back" @click="activatedTurfCreation = false">
                  <v-icon>
                    mdi-arrow-left
                  </v-icon>
                </v-btn>
                <v-card-title>
                  {{ $t('property.turfCreationTitle', {n: property.name}) }}
                </v-card-title>
                <v-form
                v-model="turfCreationFormValid"
                >
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.name') }}
                          </v-list-item-title>
                          <v-text-field
                          v-model="turfCreationForm.name"
                          :rules="[formRules.required]">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.coordinates') }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ $t('property.latitude') }}
                          </v-list-item-subtitle>
                          <v-text-field
                          v-model="turfCreationForm.coordinatesLat"
                          :rules="[formRules.required, formRules.isCoordinateLat]">
                          </v-text-field>
                          <v-list-item-subtitle>
                            {{ $t('property.longitude') }}
                          </v-list-item-subtitle>
                          <v-text-field
                          v-model="turfCreationForm.coordinatesLon"
                          :rules="[formRules.required, formRules.isCoordinateLon]">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.parentProperty') }}
                          </v-list-item-title>
                          <v-list-item>
                            {{ property.id }}
                          </v-list-item>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.sensorsGroup') }}
                          </v-list-item-title>
                          <v-text-field
                          v-model="turfCreationForm.sensorsGroup"
                          :rules="[formRules.required]">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-content>
                          <v-list-item-title>
                            {{ $t('property.waterGauges') }}
                          </v-list-item-title>
                          <v-list-item-subtitle>
                            {{ $t('property.hintWaterGauge') }}
                          </v-list-item-subtitle>
                          <v-text-field
                          v-model="turfCreationForm.waterGauges">
                          </v-text-field>
                        </v-list-item-content>
                      </v-list-item>

                      <v-list-item>
                        <v-btn>
                          <v-icon @click="submitNewTurfForm(turf)">
                            mdi-check
                          </v-icon>
                        </v-btn>
                        <v-btn @click="activatedTurfCreation = false">
                          <v-icon>
                            mdi-window-close
                          </v-icon>
                        </v-btn>
                      </v-list-item>
                      </v-form>
                </v-card>
              </v-slide-y-transition>
            </v-list-item>
          </v-list>
        </v-tab-item>
      </v-tabs-items>
    </v-tabs>
    <v-slide-y-transition hide-on-leave>
      <v-card v-if="activatedPropertyCreation">
        <v-btn icon class="property-creation-back" @click="activatedPropertyCreation = false">
          <v-icon>
            mdi-arrow-left
          </v-icon>
        </v-btn>
        <v-card-title>
          {{ $t('property.propertyCreationTitle') }}  
        </v-card-title>
        <v-form 
        ref="propertyCreationForm"
        v-model="propertyCreationFormValid">
                <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.id') }}
                  </v-list-item-title>
                  <v-text-field
                  v-model.number="propertyCreationForm.id"
                  :rules="[formRules.required, formRules.isID]">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.name') }}
                  </v-list-item-title>
                  <v-text-field
                  v-model="propertyCreationForm.name"
                  :rules="[formRules.required]">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.coordinates') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('property.latitude') }}
                  </v-list-item-subtitle>
                  <v-text-field
                  v-model.number="propertyCreationForm.coordinatesLat"
                  :rules="[formRules.required, formRules.isCoordinateLat]">
                  </v-text-field>
                  <v-list-item-subtitle>
                    {{ $t('property.longitude') }}
                  </v-list-item-subtitle>
                  <v-text-field
                  v-model.number="propertyCreationForm.coordinatesLon"
                  :rules="[formRules.required, formRules.isCoordinateLon]">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.zip') }}
                  </v-list-item-title>
                  <v-text-field
                  v-model.number="propertyCreationForm.zip"
                  :rules="[formRules.isZip]">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ $t('property.waterGauges') }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ $t('property.hintWaterGauge') }}
                  </v-list-item-subtitle>
                  <v-text-field
                  v-model="propertyCreationForm.waterGauges">
                  </v-text-field>
                </v-list-item-content>
              </v-list-item>
                <v-list-item>
                  <v-btn @click="submitNewPropertyForm()">
                    <v-icon>
                      mdi-check
                    </v-icon>
                  </v-btn>
                  <v-btn @click="activatedPropertyCreation = false">
                    <v-icon>
                      mdi-window-close
                    </v-icon>
                  </v-btn>
                </v-list-item>
              </v-form>
      </v-card>
    </v-slide-y-transition>

    
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

      async updateData() {
        this.sportsProperties = await this.getSportsProperties()
        this.turfs = await this.getTurfs()
      }
    },
    async created() {
      await this.updateData()
      console.log('PropertyEdit created() ', this.sportsProperties, this.turfs)
    }
  })
</script>
