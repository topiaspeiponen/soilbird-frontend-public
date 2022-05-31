<template>
    <div class="sensor-chip-container">
        <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
                <v-avatar
                :color="sensorStatusColor"
                size="36"
                class="sensor-status-ind"
                v-bind="attrs"
                v-on="on"
                >
                    <v-icon>
                        {{sensorStatusIcon}}
                    </v-icon>
                </v-avatar>
            </template>
            <span>
                {{ sensorStatusTooltipText }}
            </span>
        </v-tooltip>
        <v-card-text>
            {{ sensor.name }}
        </v-card-text>
        <v-card-text>
            {{ sensor.serial_number }}
        </v-card-text>
        <v-progress-linear
            class="value-chip"
            :color="moistureColor"
                rounded
                :value="getMoisture * 2"
                height="30">
                    <v-icon>
                    mdi-water
                </v-icon>
                    <strong> {{getMoisture}} % </strong>
        </v-progress-linear>
        <v-progress-linear
            class="value-chip"
            :color="temperatureColor"
                rounded
                :value="getTemp * 2"
                height="30">
                    <v-icon>
                    mdi-thermometer
                </v-icon>
                    <strong> {{getTemp}} °C </strong>
        </v-progress-linear>
        <v-progress-linear
            class="value-chip"
            :color="salinityColor"
                rounded
                :value="getSalinity"
                height="30">
                    <v-icon>
                    mdi-shaker-outline
                    </v-icon>
                    <strong> {{getSalinity}} dS/m </strong>
        </v-progress-linear>
    </div>
</template>

<script lang="ts">
import Vue, {PropType} from 'vue'
import SensorStatus, {StatusTypeData} from '../static/SensorStatus'
import { NotificationLogic, Logic } from '@/static/NotificationEnumerators'
import {i18n} from '@/main'

export default Vue.extend({
    props: {
        lastMeasurement: {
            type: Object,
            required: false
        },
        sensor: {
            type: Object,
            required: true
        },
        logic: {
            type: Array as PropType<NotificationLogic[]>,
            required: true,
        },
    },
    data: () => ({
        sensorStatus: SensorStatus,
        sensorStatusColor: "",
        sensorStatusTooltipText: "",
        sensorStatusIcon: "",
        moistureColor: "#00B0FF",
        temperatureColor: "#F44336",
        salinityColor: "#00BFA5"
    }),
    mounted() {
        this.getSensorStatusColor()
    },
    computed: {
        getMoisture() {
            const moisture : any = this.lastMeasurement.moisture
            return Math.round((moisture * 100 + Number.EPSILON) * 100) / 100

        },
        getTemp() {
            const temp : any = this.lastMeasurement.temperature
            return Math.round((temp + Number.EPSILON) * 100) / 100

        },
        getSalinity() {
            const salinity : any = this.lastMeasurement.salinity
            return Math.round((salinity * 100 + Number.EPSILON) * 100) / 100

        },
        
    },
    methods: {
        getSensorStatusColor() {
            const logics : Logic[] = this.logic[0].logic
            let sensorStatusToBeUsed : StatusTypeData = SensorStatus.OK
            
            
            for (const i in logics) {
                let valueToCheck : number
                const logicType = logics[i]

                // ! Skip salinity checking as it is currently unreliable as of 23.07.2021
                if (logicType.name === 'salinity' || logicType.name === 'temperature') {
                    continue;
                }

                switch(logicType.name) {
                    case 'moisture':
                        valueToCheck = this.getMoisture
                        break;
                    case 'temperature':
                        valueToCheck = this.getTemp
                        break;
                    case 'salinity':
                        valueToCheck = this.getSalinity
                        break;
                    default: {
                        valueToCheck = this.getMoisture
                        break;
                    }
                }
                
                let newSensorStatusToBeUsed : StatusTypeData

                // Over max => danger
                if (valueToCheck >= logicType.abs_max) {
                    newSensorStatusToBeUsed = SensorStatus.DANGER
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.danger').toString()
                    newSensorStatusToBeUsed.icon = "mdi-exclamation-thick"

                } 
                // Over warning and below max => warning
                else if (valueToCheck < logicType.abs_max && valueToCheck >= logicType.warning_max) {
                    newSensorStatusToBeUsed = SensorStatus.WARNING
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.warning').toString()
                    newSensorStatusToBeUsed.icon = "mdi-exclamation-thick"
                    
                } 
                // Normal range => OK
                else if (valueToCheck < logicType.warning_max && valueToCheck >= logicType.normal) {
                    newSensorStatusToBeUsed = SensorStatus.OK
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.ok').toString()
                    newSensorStatusToBeUsed.icon = "mdi-check"
                }
                // Normal range => OK
                else if (valueToCheck < logicType.normal && valueToCheck >= logicType.warning_min) {
                    newSensorStatusToBeUsed = SensorStatus.OK
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.ok').toString()
                    newSensorStatusToBeUsed.icon = "mdi-check"
                }
                // Below warning and over min => warning
                else if (valueToCheck < logicType.warning_min && valueToCheck >= logicType.abs_min) {
                    newSensorStatusToBeUsed = SensorStatus.WARNING
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.warning').toString()
                    newSensorStatusToBeUsed.icon = "mdi-exclamation-thick"
                }
                // Below min => danger
                else if (valueToCheck < logicType.abs_min && valueToCheck > logicType.broken) {
                    newSensorStatusToBeUsed = SensorStatus.DANGER
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.danger').toString()
                    newSensorStatusToBeUsed.icon = "mdi-exclamation-thick"
                }
                // Below broken => error
                else if (valueToCheck <= logicType.broken) {
                    newSensorStatusToBeUsed = SensorStatus.ERROR
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.error').toString()
                    newSensorStatusToBeUsed.icon = "mdi-alert-circle"
                } else {
                    newSensorStatusToBeUsed = SensorStatus.ERROR
                    newSensorStatusToBeUsed.statusMsg = i18n.t('turfMonitorPage.sensors.status.error').toString()
                    newSensorStatusToBeUsed.icon = "mdi-alert-circle"
                }

                // If the status to be used has been set, check the importance of the current status and compare to incoming status
                // Higher importance will take precedent
                if (sensorStatusToBeUsed) {
                    sensorStatusToBeUsed = this.setStatusByImportance(newSensorStatusToBeUsed, sensorStatusToBeUsed)
                } 
                // If status has not been yet set, set the first status check to current status
                else {
                    sensorStatusToBeUsed = newSensorStatusToBeUsed
                }
                
            }
            this.sensorStatusColor = sensorStatusToBeUsed.color
            this.sensorStatusTooltipText = sensorStatusToBeUsed.statusMsg
            this.sensorStatusIcon = sensorStatusToBeUsed.icon
        },

        setStatusByImportance(incomingStatus : StatusTypeData, currentStatus : StatusTypeData) {
            if (incomingStatus.importance > currentStatus.importance) {
                return incomingStatus;
            } else {
                return currentStatus;
            }
        }
    }
})
</script>

<style lang="scss">
    @import '../assets/global.scss';

    .sensor-status-ind {
        border-radius: 50% !important;
    }
    .sensor-chip-container {
        display: flex !important; 
        align-items: center;
    }
    .sensor-chip-water {
        background-color: $indicator-water !important;
        pointer-events: none;
        user-select: none;
    }
    .sensor-chip-temp {
        background-color: $indicator-temperature !important;
        pointer-events: none;
        user-select: none;
    }
    .sensor-chip-salinity {
        background-color: $indicator-salinity !important;
        pointer-events: none;
        user-select: none;
    }
    .value-chip {
        margin-right: 4px;
        margin-left: 4px;
    }
</style>