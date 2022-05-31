<template>
  <div class="sensor-graph-container">
    <div class="menu">
      <v-chip-group
        active-class="primary--text"
        v-model="selectedChip"
      >
        <v-chip @click="usePreset('three_months')" key="three_months">
          {{ $t('turfMonitorPage.deviceMonitor.graph.threeMonthAbbreviation') }}
        </v-chip>
        <v-chip  @click="usePreset('one_month')" key="one_month">
          {{ $t('turfMonitorPage.deviceMonitor.graph.monthAbbreviation') }}
        </v-chip>
        <v-chip @click="usePreset('two_weeks')" key="two_weeks">
          {{ $t('turfMonitorPage.deviceMonitor.graph.twoWeekAbbreviation') }}
        </v-chip>
        <v-chip @click="usePreset('one_week')" key="one_week">
          {{ $t('turfMonitorPage.deviceMonitor.graph.weekAbbreviation') }}
        </v-chip>
      </v-chip-group>
      <div class="dates">
        <date-time-chooser
          v-model="dateStart"
          :options="chartOptions"
          :dateLabel="$t('turfMonitorPage.deviceMonitor.graph.dateStartLabel')"
          :presetSelected="selectedChip"
        ></date-time-chooser>
        <date-time-chooser
          :disabled="!dateEndDisplay"
          v-model="dateEnd"
          :options="chartOptions"
          :dateLabel="$t('turfMonitorPage.deviceMonitor.graph.dateEndLabel')"
          :minDate="dateStart"
          :presetSelected="selectedChip"
        ></date-time-chooser>
        <v-btn class="sendBtn" x-small @click="updateGraphWithDates()"> 
          <v-icon> 
            mdi-arrow-right 
          </v-icon> 
        </v-btn>
      </div>
    </div>
    <v-progress-linear
      v-if="loading"
      class="chart-loading"
      indeterminate
      color="yellow darken-2"
    ></v-progress-linear>
    <apexcharts
      class="apexchart"
      height="100%"
      width="100%"
      type="line"
      :options="chartOptions"
      :series="chartSeries"
    ></apexcharts>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueApexCharts from "vue-apexcharts";
import DateTimeChooser from "./DateTimeChooser.vue";
import {SoilscoutMeasurementAggregated} from '../services/SoilscoutAPIResponseTypes';
import {  differenceInHours, subDays, subMonths } from 'date-fns';
import {i18n} from '@/main'

export default Vue.extend({
  props: {
    sensorID: {
      type: Number
    }
  },
  components: {
    apexcharts: VueApexCharts,
    DateTimeChooser
  },
  data: function() {
    return {
        selectedChip: 3,

        loading: false,

        dateStart: '',
        dateStartTime: new Date(),
        dateEnd: '',
        dateEndDisplay: false,
        chartSeries: [
        {
          name: i18n.t('turfMonitorPage.sensors.moisture').toString(),
          data: new Array<{x: number, y: number}>(),
        },
        {
          name: i18n.t('turfMonitorPage.sensors.temperature').toString(),
          data: new Array<{x: number, y: number}>(),
        },
        {
          name: i18n.t('turfMonitorPage.sensors.salinity').toString(),
          data: new Array<{x: number, y: number}>(),
        },
      ],

        chartOptions: {
          chart: {
            id: "sensorValueGraph",
            type: "bar",
            zoom: {
              autoScaleYaxis: true
            },
            stroke: {
              curve: 'smooth'
            },
            animations: {
              enabled: true,
              easing: 'easeinout',
              speed: 800,
              animateGradually: {
                  enabled: true,
                  delay: 150
              },
              dynamicAnimation: {
                  enabled: true,
                  speed: 350
              }
            }
          },
          xaxis: {
            type: 'datetime',
            tickAmount: 6,
          },
          yaxis: {
            decimalsInFloat: 1,
            forceNiceScale: true
          },
          tooltip: {
            x: {
              format: 'dd MMM yyyy HH:mm'
            }
          },
          noData: {
            text: "Datan haku ei onnistunut"
          }
          }
        }
    },
    mounted() {
      this.usePreset('one_week')
    },
    methods: {
        /**
         * Time conversions
         */

        dateStringToDate(dateString : String) {
          // Check if date is in default T-Z format
          if (dateString.includes('T') && dateString.includes('Z')) {
            const dates = dateString.split('T')[0].split('-')
            const intDates : number[] = dates.map((string) => {
              return parseInt(string)
            })


            const times = dateString.split('T')[1].split(':')
            const intTimes = times.map((string) => {
              return parseInt(string)
            })

            return new Date(intDates[0], intDates[1] - 1, intDates[2], intTimes[0], intTimes[1])
          }
          // Else the date is date-fns format with a space between
          else {
            const dates = dateString.split(' ')[0].split('-')
            const intDates : number[] = dates.map((string) => {
              return parseInt(string)
            })


            const times = dateString.split(' ')[1].split(':')
            const intTimes = times.map((string) => {
              return parseInt(string)
            })

            return new Date(intDates[0], intDates[1] - 1, intDates[2], intTimes[0], intTimes[1])
          }
        },
        /*setMinDate() {
          const newMinDate = new Date(this.dateStart).getTime()
          this.$set(this.chartOptions.xaxis, 'min', newMinDate)
          console.log('Min date set ', this.chartOptions.xaxis.min)
        },*/
        dateStringToApexTimestampDate(dateString: String) : string {
          const dates = dateString.split(' ')[0].split('-')
          const intDates : number[] = dates.map((string) => {
            return parseInt(string)
          })

          /*const times = dateString.split(' ')[1].split(':')
          const intTimes = times.map((string) => {
            return parseInt(string)
          })*/

          return intDates[2] + "-" + intDates[1] +  "-" + intDates[0]
        },
        /**
         * UI functionality
         */

        async setupMeasurementsForGraph(timeDiff: number, dateStart: string, dateEnd : string) {
          const measurements = await this.getAggregatedMeasurements(timeDiff, dateStart, dateEnd)
          this.updateChart(measurements)
          this.selectedChip = -1
        },

        async usePreset(timespan : string) {
          this.loading = true
          console.log('Preset cihp ', this.selectedChip)
          switch (timespan) {
            case 'one_week': {
              const currentDate = new Date();
              const weekAgo = subDays(currentDate, 7).toISOString();
              console.log('One week preset ', currentDate, weekAgo)
              const timeDiff = 7 * 24;

              const measurements = await this.getAggregatedMeasurements(timeDiff, weekAgo, currentDate.toISOString())
              this.updateChart(measurements)
              break;
            }
            case 'two_weeks': {
              const currentDate = new Date();
              const twoWeeksAgo = subDays(currentDate, 14).toISOString();
              console.log('One week preset ', currentDate, twoWeeksAgo)
              const timeDiff = 14 * 24;

              const measurements = await this.getAggregatedMeasurements(timeDiff, twoWeeksAgo, currentDate.toISOString())
              this.updateChart(measurements)
              break;
            }
            case 'one_month': {
              const currentDate = new Date();
              const monthAgo = subMonths(currentDate, 1).toISOString();
              console.log('One week preset ', currentDate, monthAgo)
              const timeDiff = this.getHourDifference(monthAgo, currentDate.toISOString())

              const measurements = await this.getAggregatedMeasurements(timeDiff, monthAgo, currentDate.toISOString())
              this.updateChart(measurements)
              break;
            }
            case 'three_months': {
              const currentDate = new Date();
              const threeMonthsAgo = subMonths(currentDate, 3).toISOString();
              console.log('One week preset ', currentDate, threeMonthsAgo)
              const timeDiff = this.getHourDifference(threeMonthsAgo, currentDate.toISOString())

              const measurements = await this.getAggregatedMeasurements(timeDiff, threeMonthsAgo, currentDate.toISOString())
              this.updateChart(measurements)
              break;
            }
            default:
          }
        },

        updateGraphWithDates() {
          if (this.dateEnd !== '' && this.dateStart !== '') {
              const timeDiff = this.getHourDifference(this.dateStart, this.dateEnd)
              this.setupMeasurementsForGraph(timeDiff, this.dateStart, this.dateEnd)
              console.log('UpdateGraphWithDates')
            }
        },

        updateChart(measurements: SoilscoutMeasurementAggregated[]) {
          this.$set(this.chartSeries[0], 'data', new Array<{x: number, y: number}>())
          this.$set(this.chartSeries[1], 'data', new Array<{x: number, y: number}>())
          this.$set(this.chartSeries[2], 'data', new Array<{x: number, y: number}>())

          var moistures : {x: number, y: number}[] = []
          var temperatures : {x: number, y: number}[] = []
          var salinitys : {x: number, y: number}[] = []
          //this.setMinDate()
          measurements.map((measurement) => {
            moistures.push({
              x: Date.parse(measurement.timestamp.median),
              y: Math.round(
                      (measurement.moisture.median * 100 +
                        Number.EPSILON) *
                        100
                    ) / 100
              })
            temperatures.push({
              x: Date.parse(measurement.timestamp.median),
              y: Math.round(
                      (measurement.temperature.median + Number.EPSILON) *
                        100
                    ) / 100
              })
            salinitys.push({
              x: Date.parse(measurement.timestamp.median),
              y: measurement.salinity.median
              })
          })
          this.$set(this.chartSeries[0], 'data', moistures)
          this.$set(this.chartSeries[1], 'data', temperatures)
          this.$set(this.chartSeries[2], 'data', salinitys)

          this.loading = false
          // Bug with Apexcharts, chart doesn't update until resize is triggered
          window.dispatchEvent(new Event('resize'))
        },

        /**
         * API calls
         */

        async getAggregatedMeasurements(window_size : number, startDate : string, endDate : string) : Promise<SoilscoutMeasurementAggregated[]> {
          console.log('getAggregatedMeasurements ', window_size)
          const measurements : SoilscoutMeasurementAggregated[] = await Vue.$soilscoutAPI.getMeasurementsAggrFromDevices(
            this.dateStringToDate(startDate),
            this.dateStringToDate(endDate),
            JSON.stringify(this.sensorID),
            window_size,
            true
          )
          console.log('measurements ', measurements)
          return measurements
        },

        /**
         * Time difference calculations
         */

        getHourDifference(startDate : string, endDate : string) {
          if (startDate.includes('T') && endDate.includes('T')) {

            // Dates
          const dateStartDate = startDate.split('T')[0].split('-')
          const intStartDates : number[] = dateStartDate.map((string) => {
            return parseInt(string)
          })

          const dateEndDate = endDate.split('T')[0].split('-')
          const intEndDates : number[] = dateEndDate.map((string) => {
            return parseInt(string)
          })

          // Times
          const dateStartTime = startDate.split('T')[1].split(':')
          const intStartTimes = dateStartTime.map((string) => {
            return parseInt(string)
          })

          const dateEndTime = endDate.split('T')[1].split(':')
          const intEndTimes = dateEndTime.map((string) => {
            return parseInt(string)
          })

          // Calculate hour difference
          const diffTimes = differenceInHours(
            new Date(intEndDates[0], intEndDates[1], intEndDates[2], intEndTimes[0], intEndTimes[1]),
            new Date(intStartDates[0], intStartDates[1], intStartDates[2], intStartTimes[0], intStartTimes[1])
          )
          console.log('GetTimeDifference ', diffTimes)

          return diffTimes
          } else {

          // Dates
          const dateStartDate = startDate.split(' ')[0].split('-')
          const intStartDates : number[] = dateStartDate.map((string) => {
            return parseInt(string)
          })

          const dateEndDate = endDate.split(' ')[0].split('-')
          const intEndDates : number[] = dateEndDate.map((string) => {
            return parseInt(string)
          })

          // Times
          const dateStartTime = startDate.split(' ')[1].split(':')
          const intStartTimes = dateStartTime.map((string) => {
            return parseInt(string)
          })

          const dateEndTime = endDate.split(' ')[1].split(':')
          const intEndTimes = dateEndTime.map((string) => {
            return parseInt(string)
          })

          // Calculate hour difference
          const diffTimes = differenceInHours(
            new Date(intEndDates[0], intEndDates[1], intEndDates[2], intEndTimes[0], intEndTimes[1]),
            new Date(intStartDates[0], intStartDates[1], intStartDates[2], intStartTimes[0], intStartTimes[1])
          )
          console.log('GetTimeDifference ', diffTimes)

          return diffTimes
          }
        },


    },
    watch: {
        dateStart: function() {
            if (this.dateStart !== '') {
              this.dateEndDisplay = true
            }
        },
        /*
        dateEnd: function() {
            const timeDiff = this.getHourDifference(this.dateStart, this.dateEnd)
            this.setupMeasurementsForGraph(timeDiff, this.dateStart, this.dateEnd)
        }*/
    }
});
</script>

<style lang="scss">
.menu {
  display: flex;
  flex-flow: row nowrap;
}
.dates {
  display: flex;
  flex-flow: row nowrap;
  margin-left: auto;
}
.sendBtn {
  margin: auto;
}
.apexchart {
}
.chart-loading {
}
</style>
