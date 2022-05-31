<template>
  <v-card class="device-monitor-parent-card" elevation="6" outlined>
    <v-card-title class="text-h3 monitor-title">
      <div class="monitor-title-text">
        {{ $t('turfMonitorPage.deviceMonitor.titleAlt') }}
      </div>
    </v-card-title>
    <div class="device-monitor-container">
      <div class="field-img-container default-border-shadow">
        <l-map
          ref="fieldMap"
          :zoom="zoom"
          :center="center"
          :options="{
            zoomControl: false,
            minZoom: 16.5,
            attributionControl: false,
          }"
          style="width: 100%; height: 100%; z-index: 0;"
          @update:zoom="zoomUpdated"
          @update:center="centerUpdated"
          @update:bounds="boundsUpdated"
        >
          <l-tile-layer :url="url"> </l-tile-layer>
          <l-control position="bottomright">
            <v-btn @click="centerButtonClicked">
              <v-icon>
                mdi-image-filter-center-focus
              </v-icon>
            </v-btn>
          </l-control>
          <l-marker
            v-for="(sensor, i) in sensors"
            class-name="marker"
            :key="'sensormarker' + sensor.name + sensor.serial_number"
            :ref="sensor.serial_number"
            :lat-lng="
              formulateSensorLocation(
                sensor.location.latitude,
                sensor.location.longitude
              )
            "
            :icon="setMarkerIcon(i)"
            :options="{
              title: sensor.name,
              zIndexOffset: 300,
              riseOnHover: true,
              riseOffset: 10,
              alt: sensor.name,
            }"
            v-on:popupclose="popupClosed(sensor.name, i)"
            v-on:popupopen="popupOpen(i)"
            @mousedown="sensorMarkerPressed(sensor, i)"
          >
            <l-popup :options="{ className: 'map-popup' }">
              <div class="text-subtitle-2 map-popup-title">
                {{ sensor.name }}
              </div>
              <v-simple-table dense class="map-popup-table">
                <tbody>
                  <tr>
                    <td class="text-left">
                      {{ $t("turfMonitorPage.sensors.latitude") }}
                    </td>
                    <td class="text-left">{{ sensor.location.latitude }}</td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      {{ $t("turfMonitorPage.sensors.longitude") }}
                    </td>
                    <td class="text-left">{{ sensor.location.longitude }}</td>
                  </tr>
                  <tr>
                    <td class="text-left">
                      {{ $t("turfMonitorPage.sensors.depth") }}
                    </td>
                    <td class="text-left">
                      {{ sensor.location.height * -100 }} cm
                    </td>
                  </tr>
                </tbody>
              </v-simple-table>
              <v-progress-linear
                class="value-chip"
                :color="moistureColor"
                rounded
                :value="getMoisture"
                height="30"
              >
                <v-icon>
                  mdi-water
                </v-icon>
                <strong> {{ getMoisture }} % </strong>
              </v-progress-linear>
              <v-progress-linear
                class="value-chip"
                :color="temperatureColor"
                rounded
                :value="getTemp"
                height="30"
              >
                <v-icon>
                  mdi-thermometer
                </v-icon>
                <strong> {{ getTemp }} °C </strong>
              </v-progress-linear>
              <v-progress-linear
                class="value-chip"
                :color="salinityColor"
                rounded
                :value="getSalinity"
                height="30"
              >
                <v-icon>
                  mdi-shaker-outline
                </v-icon>
                <strong> {{ getSalinity }} dS/m </strong>
              </v-progress-linear>
            </l-popup>
          </l-marker>
          <v-icon>
            mdi-check
          </v-icon>
        </l-map>
      </div>
      <v-divider vertical class="divider"></v-divider>
      <div class="sensor-data-container">
        <v-progress-circular
          v-if="loading"
          indeterminate
          size="80"
          width="7"
          class="list-loading"
        ></v-progress-circular>
        <v-btn v-if="loadFailed" class="load-failed-dm" icon @click="setupDeviceMonitorData()">
          <v-icon x-large>
            mdi-refresh
          </v-icon>
        </v-btn>
        <v-card class="general-data-container" outlined v-if="!loading && !loadFailed">
          <div class="data-container" v-if="!loading">
            <v-card-title class="averages-title text-overline">
              {{ $t('turfMonitorPage.deviceMonitor.averages') }}
            </v-card-title>
            <div class="average-chips">
            <v-chip color="light blue a400" class="average-chip">
              <v-icon>
                  mdi-water
              </v-icon>
              {{ getMoistureAverage }} %
            </v-chip>
            <v-chip color="red 500" class="average-chip">
              <v-icon>
                  mdi-thermometer
              </v-icon>
              {{ getTemperatureAverage }} °C
            </v-chip>
            <v-chip color="teal a700" class="average-chip">
              <v-icon>
                  mdi-shaker
              </v-icon>
              {{ getSalinityAverage }} dS/m
            </v-chip>
            </div>
          </div>
          <div class="data-container" v-if="!loading && !loadFailed">
            <v-card-title class="averages-title text-overline">
              {{ $t('turfMonitorPage.deviceMonitor.goals') }}
            </v-card-title>
            <div class="average-chips">
            <v-chip color="light blue a400" class="average-chip">
              <v-icon>
                  mdi-water
              </v-icon>
              {{ getOptimalMoisture }} %
            </v-chip>
            <v-chip color="red 500" class="average-chip">
              <v-icon>
                  mdi-thermometer
              </v-icon>
              {{ getOptimalTemperature }} °C
            </v-chip>
            <v-chip color="teal a700" class="average-chip">
              <v-icon>
                  mdi-shaker
              </v-icon>
              {{ getOptimalSalinity }} dS/m
            </v-chip>
            </div>
          </div>
        </v-card>
      <perfect-scrollbar ref="perf-scrollbar">
      <div
        id="device-list-container"
        class="device-list-container"
        v-if="!loadFailed"
      >
        
        
        <v-expansion-panels v-model="openedPanel" popout focusable v-if="!loading">
          <v-expansion-panel
            v-for="(sensor, i) in sensors"
            :key="sensor.name + sensor.serial_number"
            @change="sensorChipActivated(sensor, i)"
            :ref="sensor.name"
          >
            <v-expansion-panel-header>
              <sensor-chip
                :key="sensor.name + sensor.serial_number"
                :sensor="sensor"
                :lastMeasurement="sensor.last_measurement"
                :logic="notificationLogic"
              ></sensor-chip>
              <div class="chip-action-buttons">
            <v-dialog v-model="editDeviceDialog[sensor.serial_number]" width="700px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn 
                x-small icon
                v-bind="attrs"
                v-on="on"
                @click="setCurrentEditModel(sensor)">
                    <v-icon>
                      mdi-pencil
                    </v-icon>
                  </v-btn>
              </template>
            <v-card>
              <v-card-title>
                  {{ $t('turfMonitorPage.sensors.deviceEditTitle') }}
                </v-card-title>
              <v-container>
                 
              <v-form
              :ref="'editDeviceForm' + sensor.serial_number"
              v-model="editDeviceValid[sensor.serial_number]">
                <v-text-field
                  v-model="editDeviceFields.name[sensor.serial_number]"
                  :label="$t('property.name')"
                  :rules="nameRules"
                  outlined
                />
                <v-text-field
                  v-model="editDeviceFields.serialNumber[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.serialNumber')"
                  :rules="serialNumberRules"
                  outlined
                />
                <v-divider/>
                <v-subheader>
                  {{ $t('turfMonitorPage.sensors.soilSpecs') }}
                </v-subheader>
                <v-select
                  v-model="editDeviceFields.localizedSoilType[sensor.serial_number]"
                  :items="localizedSoilTypes"
                  :label="$t('turfMonitorPage.sensors.soilType')"
                  :rules="soilTypeRules"
                  outlined
                  @change="editDeviceSoilTypeChanged()"
                />
                <v-text-field
                  v-model="editDeviceFields.density[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.density')"
                  :rules="densityRules"
                  outlined
                  suffix="kg/l"
                />
                <v-text-field
                  v-model="editDeviceFields.fieldCapacity[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.fieldCapacity')"
                  :rules="fieldCapacityRules"
                  outlined
                  suffix="%"
                />
                <v-text-field
                  v-model="editDeviceFields.wiltingPoint[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.wiltingPoint')"
                  :rules="wiltingPointRules"
                  outlined
                  suffix="%"
                />
                <v-text-field
                  v-model="editDeviceFields.irrigationThreshold[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.irrigationThreshold')"
                  :rules="irrigationThresholdRules"
                  outlined
                />
                <v-divider/>
                <v-subheader>
                  Sijainti
                </v-subheader>
                <div class="location-fields-container">
                <v-text-field
                  class="location-field-left"
                  v-model="editDeviceFields.latitude[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.latitude')"
                  :rules="latitudeRules"
                  outlined
                />
                <v-text-field
                  class="location-field-right"
                  v-model="editDeviceFields.longitude[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.longitude')"
                  :rules="longitudeRules"
                  outlined
                />
                </div>
                <v-divider/>
                <v-text-field
                  v-model="editDeviceFields.depth[sensor.serial_number]"
                  :label="$t('turfMonitorPage.sensors.depth')"
                  :rules="depthRules"
                  outlined
                  suffix="cm"
                />
                 <div class="d-flex flex-row-reverse">
                  <v-btn  @click="submitDeviceEditForm(sensor)" color="light-green">
                    <v-icon>
                      mdi-check
                    </v-icon>
                  </v-btn>
                  <v-btn @click="closeDeviceEdit(sensor.serial_number)" color="red darken-4">
                    <v-icon>
                      mdi-close
                    </v-icon>
                  </v-btn>
                  
                </div>
              </v-form>
              </v-container>
            </v-card>
          </v-dialog> 
                
                
                <v-dialog v-model="sensorDeletionDialog[sensor.serial_number]" width="500px">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn x-small icon v-bind="attrs" v-on="on">
                  <v-icon>
                    mdi-delete
                  </v-icon>
                </v-btn>
                </template>
                  <v-card>
                    <v-card-title>
                      {{ $t('turfMonitorPage.sensors.confirmDeleteSensorTitle') }}
                    </v-card-title>
                    <v-card-subtitle>
                      {{ $t('turfMonitorPage.sensors.confirmDeleteSensorSubtitle') }}
                    </v-card-subtitle>
                    <v-card-actions class="d-flex flex-row-reverse">
                      <v-btn @click="deleteDevice(sensor)" color="light-green">
                        <v-icon>
                          mdi-check
                        </v-icon>
                      </v-btn>
                      <v-btn @click="sensorDeletionDialog[sensor.serial_number] = false" color="red darken-4">
                        <v-icon>
                          mdi-close
                        </v-icon>
                      </v-btn>
                  
                    </v-card-actions>
                  </v-card>
              </v-dialog>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <p>{{ sensor.name }}</p>
              <sensor-graph :sensorID="sensor.id"> </sensor-graph>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <div v-if="!loading">
            <v-dialog v-model="createDeviceDialog" width="700px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
              class="create-device-btn"
              v-bind="attrs"
              v-on="on">
                <v-icon>
                  mdi-plus
                </v-icon>
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                  {{ $t('turfMonitorPage.sensors.deviceCreationTitle') }}
                </v-card-title>
              <v-container>
                
              <v-form
              ref="createDeviceForm"
              v-model="createDeviceValid">
                <v-text-field
                  v-model="createDeviceName"
                  :label="$t('property.name')"
                  :rules="nameRules"
                  outlined
                />
                <v-text-field
                  v-model="createDeviceSerialNumber"
                  :label="$t('turfMonitorPage.sensors.serialNumber')"
                  :rules="serialNumberRules"
                  outlined
                />
                <v-divider/>
                <v-subheader>
                  {{ $t('turfMonitorPage.sensors.soilSpecs') }}
                </v-subheader>
                <v-select
                  v-model="createDeviceLocalizedSoilType"
                  :items="localizedSoilTypes"
                  :label="$t('turfMonitorPage.sensors.soilType')"
                  :rules="soilTypeRules"
                  outlined
                  @change="createDeviceSoilTypeChanged()"
                />
                <v-text-field
                  v-model="createDeviceDensity"
                  :label="$t('turfMonitorPage.sensors.density')"
                  :rules="densityRules"
                  outlined
                  suffix="kg/l"
                />
                <v-text-field
                  v-model="createDeviceFieldCapacity"
                  :label="$t('turfMonitorPage.sensors.fieldCapacity')"
                  :rules="fieldCapacityRules"
                  outlined
                  suffix="%"
                />
                <v-text-field
                  v-model="createDeviceWiltingPoint"
                  :label="$t('turfMonitorPage.sensors.wiltingPoint')"
                  :rules="wiltingPointRules"
                  outlined
                  suffix="%"
                />
                <v-text-field
                  v-model="createDeviceIrrigationThreshold"
                  :label="$t('turfMonitorPage.sensors.irrigationThreshold')"
                  :rules="irrigationThresholdRules"
                  outlined
                />
                <v-divider/>
                <v-subheader>
                  Sijainti
                </v-subheader>
                <div class="location-fields-container">
                <v-text-field
                  class="location-field-left"
                  v-model="createDeviceLatitude"
                  :label="$t('turfMonitorPage.sensors.latitude')"
                  :rules="latitudeRules"
                  outlined
                />
                <v-text-field
                  class="location-field-right"
                  v-model="createDeviceLongitude"
                  :label="$t('turfMonitorPage.sensors.longitude')"
                  :rules="longitudeRules"
                  outlined
                />
                </div>
                <v-divider/>
                <v-text-field
                  v-model="createDeviceDepth"
                  :label="$t('turfMonitorPage.sensors.depth')"
                  :rules="depthRules"
                  outlined
                  suffix="cm"
                />
                <v-card-actions class="d-flex flex-row-reverse">
                  <v-btn @click="submitDeviceCreationForm()" color="light-green">
                    <v-icon>
                      mdi-check
                    </v-icon>
                  </v-btn>
                  <v-btn @click="closeDeviceCreation()" color="red darken-4">
                    <v-icon>
                      mdi-close
                    </v-icon>
                  </v-btn>
                  
                </v-card-actions>
              </v-form>
              </v-container>
            </v-card>
          </v-dialog> 
          </div>
        </v-expansion-panels>
       
      </div>
       </perfect-scrollbar>
      </div>
    </div>
    <v-snackbar v-model="deviceCreatedSuccess" :timeout="3000" color="light-green">
      {{ $t('turfMonitorPage.sensors.deviceCreated') }}
    </v-snackbar>
    <v-snackbar v-model="deviceCreatedFailure" :timeout="5000" color="amber darken-4">
      {{ $t('turfMonitorPage.sensors.deviceCreationFailure') }}
    </v-snackbar>
    <v-snackbar v-model="deviceEditedSuccess" :timeout="3000" color="light-green">
      {{ $t('turfMonitorPage.sensors.deviceEdited') }}
    </v-snackbar>
    <v-snackbar v-model="deviceEditedFailure" :timeout="5000" color="amber darken-4">
      {{ $t('turfMonitorPage.sensors.deviceEditFailure') }}
    </v-snackbar>
    <v-snackbar v-model="deviceDeletedSuccess" :timeout="3000" color="light-green">
      {{ $t('turfMonitorPage.sensors.deviceDeleted') }}
    </v-snackbar>
    <v-snackbar v-model="deviceDeletedFailure" :timeout="5000" color="amber darken-4">
      {{ $t('turfMonitorPage.sensors.deviceDeletedFailure') }}
    </v-snackbar>
  </v-card>
</template>

<style lang="scss">
@import "../assets/global.scss";

@include custom-max-width(1000) {
  .device-monitor-container {
    flex-flow: column nowrap;
  }

  .device-monitor-parent-card {
    width: 100%;
    height: 100vh;
    background-color: aqua;
  }

  .device-list-container {
    width: 100%;
    padding: 4px;
    overflow-y: auto;
    scroll-behavior: smooth;
    height: 100%;
    position: relative;
  }
  .field-img-container {
    width: 100%;
  }
}
@include custom-min-width(1000) {
  .device-monitor-container {
    flex-flow: row nowrap;
  }
  .device-monitor-parent-card {
    width: 100%;
    margin-bottom: 8px;
    background-color: aqua;
  }

  .device-list-container {
    padding: 16px;
    overflow-y: auto;
    scroll-behavior: smooth;
    position: relative;
  }
  .field-img-container {
    width: 35%;
  }
}
.monitor-title {
  display: flex;
  flex-flow: row nowrap;
  background-color: #4DD0E1;
}

.monitor-title-text {
  width: 35%;
  font-size: 1.25rem;
}

.general-data-container {
  display: flex;
  flex-flow: row nowrap;
}

.averages-title {
  align-self: center;
}
.data-container {
  display: flex;
  width: 50%;
  flex-flow: column;
  padding: 8px;
}

.average-chips {
  display: flex;
  flex-flow: row nowrap;
  align-self: center;
}

.average-chip {
  margin-left: 4px;
  margin-right: 4px;
}

.sensor-data-container {
  display: flex;
  flex-flow: column;
  width: 100%;
}

.form-action-button-container {
  
}
.map-popup-table {
  margin-bottom: 8px;
}
.value-chip {
  margin-right: 4px;
  margin-bottom: 4px;
}
.marker {
  margin-left: 60px;
  width: 100px;
  height: 200px;
}
.divider {
  margin-left: 16px;
}

.device-monitor-container {
  display: flex;
  padding: 8px;
  justify-content: flex-start;
  height: auto;
  min-height: 35vh;
  max-height: 60vh;
  width: 100%;
}
.chip-action-buttons {
  position: absolute;
  top: 8px;
  right: 8px;
}

.location-fields-container {
  display: flex;
  flex-flow: row nowrap;
}

.location-field-left {
  width: 50%;
  margin-right: 4px !important;
}

.location-field-right {
  width: 50%;
  margin-left: 4px !important;
}

.create-device-btn {
  margin-top: 16px;
}

.field-img {
  margin: 8px;
}
.list-loading {
  color: $indicator-water;
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
}
.load-failed-dm {
  transform: translate(-50%, -50%);
  top: 50%;
  left: 50%;
}

.leaflet-popup-content-wrapper {
  width: auto;
  border-radius: 0 !important;
}

.popup-chip-group {
}
.map-popup-title {
  margin-bottom: 8px;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
</style>

<script lang="ts">
import Vue, { PropType } from "vue";
import L from "leaflet";
import { SoilscoutDevice, SoilscoutDevicePost, SoilscoutSoilType } from "../services/SoilscoutAPIResponseTypes";
import SensorChip from "./SensorChip.vue";
import SensorGraph from "./SensorGraph.vue";
import LastMeasurement from "../static/LastMeasurement";
import { LMap, LTileLayer, LPopup, LMarker, LControl } from "vue2-leaflet";
import { Turf } from "@/static/TurfType";
import { NotificationLogic } from "@/static/NotificationEnumerators";
import { i18n } from "@/main";

export default Vue.extend({
  components: {
    SensorChip,
    SensorGraph,
    LMarker,
    LMap,
    LTileLayer,
    LPopup,
    LControl,
  },
  props: {
    field: {
      type: Object as PropType<Turf>,
      required: true,
    },
    propertyName: {
      type: String,
      required: true,
    },
  },
  data: function() {
    return {
      lastMeasurement: LastMeasurement.last_measurement,
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      zoom: 16.5,
      center: new Array<number>(),
      bounds: null,
      sensors: new Array<SoilscoutDevice>(),
      openedPanel: -1,
      openedMarker: -1,
      loading: true,
      loadFailed: false,
      moistureColor: Vue.$stringLibrary.colors.moisture,
      temperatureColor: Vue.$stringLibrary.colors.temperature,
      salinityColor: Vue.$stringLibrary.colors.salinity,
      icon: L.icon({
        iconUrl: "/sensor-marker.png",
        iconSize: [32, 37],
        iconAnchor: [16, 37],
      }),
      sensorDeletionDialog: {} as { [id: number] : boolean },
      createDeviceDialog: false,
      createDeviceValid: true,
      createDeviceName: "",
      createDeviceSerialNumber: null,
      createDeviceLocalizedSoilType: 0,
      createDeviceSoilType: "",
      createDeviceDensity: null,
      createDeviceFieldCapacity: null,
      createDeviceWiltingPoint: null,
      createDeviceIrrigationThreshold: null,
      createDeviceLatitude: null,
      createDeviceLongitude: null,
      createDeviceDepth: null,
      editDeviceDialog: {} as { [id: number] : boolean },
      editDeviceValid: {} as { [id: number] : boolean },
      editDeviceFields: {
        name: {} as { [id: number] : string },
        serialNumber: {} as { [id: number] : number },
        localizedSoilType: {} as { [id: number] : string },
        soilType: {} as { [id: number] : string },
        density: {} as { [id: number] : number },
        fieldCapacity: {} as { [id: number] : number },
        wiltingPoint: {} as { [id: number] : number },
        irrigationThreshold: {} as { [id: number] : number },
        latitude: {} as { [id: number] : number },
        longitude: {} as { [id: number] : number },
        depth: {} as { [id: number] : number }
      },
      localizedSoilTypes: [
        i18n.t('turfMonitorPage.sensors.loam'),
        i18n.t('turfMonitorPage.sensors.clay'),
        i18n.t('turfMonitorPage.sensors.organic'),
        i18n.t('turfMonitorPage.sensors.sand'),
      ],
      nameRules: [
        (v : any) => !!v || i18n.t('validation.required')
      ],
      serialNumberRules: [
        (v : any) => !!v || i18n.t('validation.required'),
        (v : any) =>  !!v && v.toString().length > 1  || i18n.t('validation.minLength', {n: 2})
      ],
      soilTypeRules: [
        (v : any) => !!v || i18n.t('validation.required')
      ],
      densityRules: [
        (v : any) => !!v || i18n.t('validation.required')
      ],
      fieldCapacityRules: [
        (v : any) => !!v || i18n.t('validation.required')
      ],
      wiltingPointRules: [
        (v : any) => !!v || i18n.t('validation.required')
      ],
      irrigationThresholdRules: [
        (v : any) => !!v || i18n.t('validation.required')
      ],
      latitudeRules: [
        (v : any) => !!v || i18n.t('validation.required'),
        (v: any) => !!v  && /^(\+|-)?(?:90(?:(?:\.0{1,6})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,6})?))$/.test(v) || i18n.t('property.notCoord')
      ],
      longitudeRules: [
        (v : any) => !!v || i18n.t('validation.required'),
        (v: any) => !!v  && /^(\+|-)?(?:180(?:(?:\.0{1,6})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,6})?))$/.test(v) || i18n.t('property.notCoord')
      ],
      depthRules: [
        (v : any) => !!v || i18n.t('validation.required'),
        (v : any) => !!v && v >= 0 && v <= 100 || i18n.t('validation.between', {n1: 0, n2: 100})
      ],
      deviceCreatedSuccess: false,
      deviceCreatedFailure: false,
      deviceEditedSuccess: false,
      deviceEditedFailure: false,
      deviceDeletedSuccess: false,
      deviceDeletedFailure: false,
      iconSize: 64,
      notificationLogic: {} as NotificationLogic
    };
  },
  methods: {
    dynamicSize() {
      return [this.iconSize, this.iconSize * 1.15];
    },
    dynamicAnchor() {
      return [this.iconSize / 2, this.iconSize * 1.15];
    },
    zoomUpdated(zoom: number) {
      this.zoom = zoom;
    },
    centerUpdated(center: Array<number>) {
      this.center = center;
    },
    boundsUpdated(bounds: any) {
      this.bounds = bounds;
    },
    centerButtonClicked() {
      this.center = this.getFieldCoordinates;
    },

    async deleteDevice(sensor : SoilscoutDevice) {
      try {
        console.log('DeleteDevice ')
        const response = await Vue.$soilscoutAPI.deleteDevice(sensor.id)
        console.log(response)
        if (response) {
          this.sensorDeletionDialog[sensor.serial_number] = false;
          this.deviceDeletedSuccess = true;
        } else {
          this.sensorDeletionDialog[sensor.serial_number] = false;
          this.deviceDeletedFailure = true;
        }
        this.getSensors();
      } catch(e) {
        console.log('Error deleting device ', e)
      }
    },

    // Changing soil types dictates other soil specifications
    createDeviceSoilTypeChanged() {
      console.log('Soil type changed ', this.createDeviceLocalizedSoilType)

      this.convertLocalizedSoilTypeCreate(this.createDeviceLocalizedSoilType)
    },
    editDeviceSoilTypeChanged() {
      console.log('Soil type changed ', this.createDeviceLocalizedSoilType)

      this.convertLocalizedSoilTypeEdit(this.createDeviceLocalizedSoilType)
    },

    convertLocalizedSoilTypeCreate(localizedSoilType: string) {
      switch (localizedSoilType) {
        case (i18n.t('turfMonitorPage.sensors.loam')):
          this.createDeviceDensity = 1.4
          this.createDeviceFieldCapacity = 25
          this.createDeviceWiltingPoint =  8
          this.createDeviceIrrigationThreshold = 0.6
          this.createDeviceSoilType = 'loam'
          break;
        case (i18n.t('turfMonitorPage.sensors.clay')):
          this.createDeviceDensity = 1.1
          this.createDeviceFieldCapacity = 40
          this.createDeviceWiltingPoint =  20
          this.createDeviceIrrigationThreshold = 0.6
          this.createDeviceSoilType = 'clay'
          break;
        case (i18n.t('turfMonitorPage.sensors.sand')):
          this.createDeviceDensity = 1.6
          this.createDeviceFieldCapacity = 20
          this.createDeviceWiltingPoint =  5
          this.createDeviceIrrigationThreshold = 0.6
          this.createDeviceSoilType = 'sand'
          break;
        case (i18n.t('turfMonitorPage.sensors.organic')):
          this.createDeviceDensity = 0.5
          this.createDeviceFieldCapacity = 60
          this.createDeviceWiltingPoint =  15
          this.createDeviceIrrigationThreshold = 0.6
          this.createDeviceSoilType = 'organic'
          break;
        default:
          // Default to loam
          this.createDeviceDensity = 1.4
          this.createDeviceFieldCapacity = 25
          this.createDeviceWiltingPoint =  8
          this.createDeviceIrrigationThreshold = 0.6
          this.createDeviceSoilType = 'loam'
          break;
      }
    },

    convertLocalizedSoilTypeEdit(localizedSoilType: string, sensorNumber: number) {
      switch (localizedSoilType) {
        case (i18n.t('turfMonitorPage.sensors.loam')):
          this.editDeviceFields.density[sensorNumber] = 1.4
          this.editDeviceFields.fieldCapacity[sensorNumber] = 25
          this.editDeviceFields.wiltingPoint[sensorNumber] =  8
          this.editDeviceFields.irrigationThreshold[sensorNumber] = 0.6
          this.editDeviceFields.soilType[sensorNumber] = 'loam'
          break;
        case (i18n.t('turfMonitorPage.sensors.clay')):
          this.editDeviceFields.density[sensorNumber] = 1.1
          this.editDeviceFields.fieldCapacity[sensorNumber] = 40
          this.editDeviceFields.wiltingPoint[sensorNumber] =  20
          this.editDeviceFields.irrigationThreshold[sensorNumber] = 0.6
          this.editDeviceFields.soilType[sensorNumber] = 'clay'
          break;
        case (i18n.t('turfMonitorPage.sensors.sand')):
          this.editDeviceFields.density[sensorNumber] = 1.6
          this.editDeviceFields.fieldCapacity[sensorNumber] = 20
          this.editDeviceFields.wiltingPoint[sensorNumber] =  5
          this.editDeviceFields.irrigationThreshold[sensorNumber] = 0.6
          this.editDeviceFields.soilType[sensorNumber] = 'sand'
          break;
        case (i18n.t('turfMonitorPage.sensors.organic')):
          this.editDeviceFields.density[sensorNumber] = 0.5
          this.editDeviceFields.fieldCapacity[sensorNumber] = 60
          this.editDeviceFields.wiltingPoint[sensorNumber] =  15
          this.editDeviceFields.irrigationThreshold[sensorNumber] = 0.6
          this.editDeviceFields.soilType[sensorNumber] = 'organic'
          break;
        default:
          // Default to loam
          this.editDeviceFields.density[sensorNumber] = 1.4
          this.editDeviceFields.fieldCapacity[sensorNumber] = 25
          this.editDeviceFields.wiltingPoint[sensorNumber] =  8
          this.editDeviceFields.irrigationThreshold[sensorNumber] = 0.6
          this.editDeviceFields.soilType[sensorNumber] = 'loam'
          break;
      }
    },

    convertToLocalizedSoilType(soilType: string) {
      switch(soilType) {
        case 'loam':
          return i18n.t('turfMonitorPage.sensors.loam');
        case 'clay':
          return i18n.t('turfMonitorPage.sensors.clay');
        case 'sand':
          return i18n.t('turfMonitorPage.sensors.sand');
        case 'organic':
          return i18n.t('turfMonitorPage.sensors.organic');
        default:
          return i18n.t('turfMonitorPage.sensors.loam')
      }
    },

    /**
     * Device editing methods
     */

    async submitDeviceEditForm(sensor: SoilscoutDevice) {
      console.log('submitDeviceEditForm ', sensor)
      const refs : any = this.$refs
      refs['editDeviceForm' + sensor.serial_number][0].validate()
      if (refs['editDeviceForm' + sensor.serial_number][0].validate()) {
        try {
          /*const parentGroup = await Vue.$soilscoutAPI.getSiteGroups(this.field.sports_properties_id).then(
            (response) => {
              return response.find(group => group.name === this.field.sensors_group)
            }
          )*/


          const newDevice : SoilscoutDevicePost = {
            name: this.editDeviceFields.name[sensor.serial_number],
            serial_number: parseInt(this.editDeviceFields.serialNumber[sensor.serial_number]),
            imei: null,
            device_type: 'hydra',
            location: {
              latitude: parseFloat(this.editDeviceFields.latitude[sensor.serial_number]),
              longitude: parseFloat(this.editDeviceFields.longitude[sensor.serial_number]),
              height: parseInt(this.editDeviceFields.depth[sensor.serial_number]) / -100,
              soil_type: this.editDeviceFields.soilType[sensor.serial_number],
              soil_density: parseFloat(this.editDeviceFields.density[sensor.serial_number]),
              field_capacity: parseInt(this.editDeviceFields.fieldCapacity[sensor.serial_number]) / 100,
              wilting_point: parseFloat(this.editDeviceFields.wiltingPoint[sensor.serial_number]) / 100,
              irrigation_threshold: parseFloat(this.editDeviceFields.irrigationThreshold[sensor.serial_number])
            },
            site: this.field.sports_properties_id,
            groups: sensor.groups
          }
          
          console.log('Values when submitting device edit form: ', newDevice)
          const deviceCreationResponse = await Vue.$soilscoutAPI.updateDevice(sensor.id, newDevice)

          if (deviceCreationResponse) {
            this.closeDeviceEdit(sensor.serial_number)
            this.deviceEditedSuccess = true
          } else {
            this.closeDeviceEdit(sensor.serial_number)
            this.deviceEditedFailure = true
          }
          this.getSensors();
        } catch(e) {
          console.log(e)
          //this.deviceCreatedFailure = true
        }
      }
    },

    closeDeviceEdit(serialNumber: number) {
      console.log('closeDeviceEdit ', serialNumber)
      this.editDeviceDialog[serialNumber] = false
      this.editDeviceFields.name = {} as { [id: number] : string };
      this.editDeviceFields.serialNumber = {} as { [id: number] : number };
      this.editDeviceFields.soilType = {} as { [id: number] : string };
      this.editDeviceFields.localizedSoilType = {} as { [id: number] : string };
      this.editDeviceFields.density = {} as { [id: number] : number };
      this.editDeviceFields.fieldCapacity = {} as { [id: number] : number };
      this.editDeviceFields.wiltingPoint = {} as { [id: number] : number };
      this.editDeviceFields.irrigationThreshold = {} as { [id: number] : number };
      this.editDeviceFields.latitude = {} as { [id: number] : number };
      this.editDeviceFields.longitude = {} as { [id: number] : number };
      this.editDeviceFields.depth = {} as { [id: number] : number };
      this.editDeviceValid[serialNumber] = true;
    },

    setCurrentEditModel(sensor: SoilscoutDevice) {
      console.log('Setcurrenteditmodel ', sensor)
      this.editDeviceFields.name[sensor.serial_number] = sensor.name;
      this.editDeviceFields.serialNumber[sensor.serial_number] = sensor.serial_number;
      this.editDeviceFields.soilType[sensor.serial_number] = sensor.location.soil_type;
      this.editDeviceFields.localizedSoilType[sensor.serial_number] = this.convertToLocalizedSoilType(sensor.location.soil_type)
      this.editDeviceFields.density[sensor.serial_number] = sensor.location.soil_density;
      this.editDeviceFields.fieldCapacity[sensor.serial_number] = sensor.location.field_capacity * 100;
      this.editDeviceFields.wiltingPoint[sensor.serial_number] = sensor.location.wilting_point * 100;
      this.editDeviceFields.irrigationThreshold[sensor.serial_number] = sensor.location.irrigation_threshold;
      this.editDeviceFields.latitude[sensor.serial_number] = sensor.location.latitude;
      this.editDeviceFields.longitude[sensor.serial_number] = sensor.location.longitude;
      this.editDeviceFields.depth[sensor.serial_number] = Math.abs(sensor.location.height * 100);
    },

    toArray() {
      const soilTypes = SoilscoutSoilType
        return Object.keys(soilTypes)
            .filter(value => isNaN(Number(value)) === false)
            .map((key : any) => soilTypes[key]);
    },

    sensorChipActivated(sensor: SoilscoutDevice, i: number) {
      console.log(
        "sensorchipactivated ",
        i,
        this.openedPanel,
        this.center[0] !== sensor.location.latitude &&
          this.center[1] !== sensor.location.longitude
      );
      console.log("Openedpanel ", this.openedPanel);
      const markers: any = this.$refs[sensor.serial_number];
      console.log(
        " Marker ",
        markers[0].mapObject.isPopupOpen(),
        this.openedPanel
      );
      if (markers[0].mapObject.isPopupOpen() && this.openedPanel === i) {
        markers[0].mapObject.closePopup();
        this.openedMarker = -1;
      } else if (
        !markers[0].mapObject.isPopupOpen() &&
        this.openedPanel === i
      ) {
        markers[0].mapObject.closePopup();
        this.openedMarker = -1;
      } else {
        //markers[0].mapObject.openPopup();
        this.openedMarker = i;
        console.log(
          "Testing for ref in sensor chip activation ",
          sensor.serial_number
        );
      }
      if (
        this.center[0] !== sensor.location.latitude &&
        this.center[1] !== sensor.location.longitude
      ) {
        this.center = [sensor.location.latitude, sensor.location.longitude];
      } else {
        this.center = this.getFieldCoordinates;
      }
    },
    getSensorMeasurements(sensor: any) {
      console.log(sensor);
    },
    
    formulateSensorLocation(latitude: number, longitude: number) {
      console.log("Formulating sensor locations");
      return [latitude, longitude];
    },
    sensorsLoadSuccess(fetchedSensors: Array<SoilscoutDevice>) {
      this.loading = false;
      this.loadFailed = false;
      this.sensors = fetchedSensors;
    },
    sensorsLoadFailure() {
      this.sensors = new Array<SoilscoutDevice>();
      this.loading = false;
      this.loadFailed = true;
    },
    sensorsArrayReset() {
      this.sensors = new Array<SoilscoutDevice>();
    },
    popupClosed() {
      console.log("popup closed");
      if (this.openedPanel === -1) {
        this.openedMarker = -1;
      }
    },
    popupOpen(i: number) {
      console.log("popupopen ", i);
      this.openedMarker = i;
    },
    sensorMarkerPressed(sensor: SoilscoutDevice, i: number) {
      const sensorExpansionPanel: any = this.$refs[sensor.name];
      console.log("Marker pressed ", sensorExpansionPanel[0], this.$refs['perf-scrollbar'].$el);
      this.openedPanel = i;
      const deviceContainer = this.$refs['perf-scrollbar'].$el
      if (deviceContainer) {
        console.log(
          "Offsets ",
          sensorExpansionPanel[0].$el.offsetTop,
          deviceContainer.offsetTop
        );
        deviceContainer.scrollTop = sensorExpansionPanel[0].$el.offsetTop
      } 
    },

    async getSensors() {
      const field: Turf = this.$props.field;
      console.info("GET SENSORS", field);
      try {
      // If the route is 'all', fetch all devices for the entire site
      if (field.path_name === "kaikki") {
        await Vue.$soilscoutAPI
          .getSiteDevices(field.sports_properties_id)
          .then((response: Array<SoilscoutDevice>) => {
            // Filter routers from the result (device type is 'base')
            const filteredDevices = response.filter((device) => {
              if (
                device.device_type !== "base" &&
                device.device_type !== "echo"
              ) {
                return device;
              }
            });
            return filteredDevices;
          })
          .then((devices) => {
            if (devices) {
              this.sensorsLoadSuccess(devices);
            } else {
              this.sensorsLoadFailure();
            }
          });
      }
      // If the route is not 'all', it is a specific field and fetch devices for that field
      else {
        // 1. Fetch group for entire site
        await Vue.$soilscoutAPI
          .getSiteGroups(field.sports_properties_id)
          .then((response) => {
            console.info("GetSensors, getSiteGroups by ID ", response);
            for (var i in response) {
              const group = response[i];
              console.log(
                "Get sensors GEOURP ",
                group.name,
                field.sensors_group
              );
              // 2. If group name matches currently displayed group's name, return devices for that group
              if (group.name === field.sensors_group) {
                return group.devices;
              }
            }
          })
          .then((group) => {
            console.info("Get sensors group", group);
            // If group found
            if (group) {
              // 3. Get devices for the site with the ID's of the group devices
              try {
              Vue.$soilscoutAPI
                .getSiteDevicesByID(field.sports_properties_id, group)
                // 4. Set UI elements according to response
                .then((response) => {
                  console.log("Get sensors ", response);
                  // Empty response (field has no devices)
                  if (response.length === 0) {
                    this.sensorsArrayReset();
                  }
                  // Set field devices to our local variable
                  else {
                    this.sensorsLoadSuccess(response);
                  }
                });
              } catch(err) {
                console.log('failed getSiteDeviceByID')
                throw new Promise.reject()
              }
            }
            // Fetching of field devices failed, set UI elements to display failure
            else {
              this.sensorsLoadFailure();
            }
          });
      
      } 
      } catch(e) {
        return Promise.reject()
      }
    },
    async submitDeviceCreationForm() {
      const refs : any = this.$refs
      refs['createDeviceForm'].validate()
      if (refs['createDeviceForm'].validate()) {
        try {
          const parentGroup = await Vue.$soilscoutAPI.getSiteGroups(this.field.sports_properties_id).then(
            (response) => {
              return response.find(group => group.name === this.field.sensors_group)
            }
          )


          const newDevice : SoilscoutDevicePost = {
            name: this.createDeviceName!,
            serial_number: parseInt(this.createDeviceSerialNumber!),
            imei: null,
            device_type: 'hydra',
            location: {
              latitude: parseFloat(this.createDeviceLatitude!),
              longitude: parseFloat(this.createDeviceLongitude!),
              height: parseInt(this.createDeviceDepth!) / 100,
              soil_type: this.createDeviceSoilType,
              soil_density: parseFloat(this.createDeviceDensity!),
              field_capacity: parseInt(this.createDeviceFieldCapacity!) / 100,
              wilting_point: parseFloat(this.createDeviceWiltingPoint!) / 100,
              irrigation_threshold: parseFloat(this.createDeviceIrrigationThreshold!)
            },
            site: this.field.sports_properties_id,
            groups: [parentGroup!.id]
          }
          
          console.log('Values when submitting device creation form: ', newDevice, parentGroup)
          const deviceCreationResponse = await Vue.$soilscoutAPI.createDevice(newDevice)

          if (deviceCreationResponse) {
            this.closeDeviceCreation()
            this.deviceCreatedSuccess = true
          } else {
            this.closeDeviceCreation()
            this.deviceCreatedFailure = true
          }
          this.getSensors();
        } catch(e) {
          console.log(e)
          this.deviceCreatedFailure = true
        }
      }
    },

    closeDeviceCreation() {
      this.createDeviceDialog = false
      this.createDeviceName = ""
      this.createDeviceSerialNumber = null
      this.createDeviceLocalizedSoilType = null
      this.createDeviceDensity = null
      this.createDeviceFieldCapacity = null
      this.createDeviceWiltingPoint = null
      this.createDeviceIrrigationThreshold = null
      this.createDeviceLatitude = null
      this.createDeviceLongitude = null
      this.createDeviceDepth = null
      this.createDeviceValid = true
    },

    editDevice() {

    },

    async getNotificationLogic() {
      const logic = await Vue.$notificationsAPI.getNotificationsLogic(
        this.field.id,
        this.field.sports_properties_id
      );
      this.notificationLogic = logic;
    },
    setMarkerIcon(i: number) {
      if (this.openedMarker === i) {
        console.log("setmarkericon ", i);
        return L.icon({
          iconUrl: "/sensor-marker-teal-shadow-outlined-selected.png",
          iconSize: [52, 57],
          iconAnchor: [32, 57],
        });
      } else {
        return L.icon({
          iconUrl: "/sensor-marker-teal-shadow-outlined.png",
          iconSize: [32, 37],
          iconAnchor: [16, 37],
        });
      }
    },
    getMonitorTitle() {
      if (this.$route.params.field === "kaikki") {
        const capitalizedPropertyName =
          this.propertyName.charAt(0).toUpperCase() +
          this.propertyName.slice(1);
        return i18n
          .t("turfMonitorPage.deviceMonitor.title", {
            n: capitalizedPropertyName,
          })
          .toString();
      } else {
        return i18n
          .t("turfMonitorPage.deviceMonitor.title", { n: this.field.name })
          .toString();
      }
    },
    async setupDeviceMonitorData() {
      this.loadFailed = false;
      this.loading = true;
      this.sensors = new Array<SoilscoutDevice>();
      console.log("field changed");
      this.center = this.getFieldCoordinates;
      this.openedMarker = -1;

      try {
        console.log('Trying setupdevicemonitordata')
        await this.getSensors();
      } catch(e) {
        console.log('setupDeviceMonitorData ', e)
        this.loading = false
        this.loadFailed = true
      }
    }
  },
  computed: {
    getFieldCoordinates(): Array<number> {
      const field: Turf = this.field;
      console.log("GetFieldCoordinates ", [
        field.coordinates.lat,
        field.coordinates.lon,
      ]);
      return [field.coordinates.lat, field.coordinates.lon];
    },
    getMoisture() {
      const moisture: any = this.lastMeasurement.moisture;
      return Math.round((moisture * 100 + Number.EPSILON) * 100) / 100;
    },
    getTemp() {
      const temp: any = this.lastMeasurement.temperature;
      return Math.round((temp + Number.EPSILON) * 100) / 100;
    },
    getSalinity() {
      const salinity: any = this.lastMeasurement.salinity;
      return Math.round((salinity * 100 + Number.EPSILON) * 100) / 100;
    },
    getMoistureAverage() : number {
      let moistures = 0
      for (const i in this.sensors) {
        console.log('Calculating moisture average ', this.sensors[i].last_measurement.moisture)
        moistures += this.sensors[i].last_measurement.moisture
      }
      const average = (moistures / this.sensors.length) * 100
      return Math.round((average + Number.EPSILON) * 100) / 100
    },
    getTemperatureAverage() : number {
      let temperatures = 0
      for (const i in this.sensors) {
        console.log('Calculating temp average ', this.sensors[i].last_measurement.temperature)
        temperatures += this.sensors[i].last_measurement.temperature
      }
      const average = (temperatures / this.sensors.length)
      return Math.round((average + Number.EPSILON) * 100) / 100
    },
    getSalinityAverage() : number {
      let salinities = 0
      for (const i in this.sensors) {
        console.log('Calculating salinity average ', this.sensors[i].last_measurement.salinity)
        salinities += this.sensors[i].last_measurement.salinity
      }
      const average = (salinities / this.sensors.length) * 100
      return Math.round((average + Number.EPSILON) * 100) / 100
    },
    getOptimalMoisture() : any {
      console.log('logic ', this.notificationLogic[0].logic[1].normal)
      return this.notificationLogic[0].logic[0].normal
    },
    getOptimalTemperature() : any {
      return this.notificationLogic[0].logic[1].normal
    },
    getOptimalSalinity() : any {
      return this.notificationLogic[0].logic[2].normal
    },
  },

  created: async function() {
    await this.setupDeviceMonitorData()
  },

  async mounted() {
    await this.getNotificationLogic();
  },

  watch: {
    field: async function() {
      await this.setupDeviceMonitorData()
    },
    openedPanel: function() {
      console.log("Watching openedPanel", this.openedPanel);
    },
  },
});
</script>
