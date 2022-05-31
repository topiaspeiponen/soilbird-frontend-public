<template>
  <div class="water-consumption-graph-container">
    <div class="menu">
      <div class="property-selector">
        <div class="text-caption">
          {{$t('waterCompare.graphPropertySelectorTitle')}}
        </div>
        <div class="property-selector-small">
        <v-autocomplete v-model="selectedComparisonProperties" small-chips :items="comparisonProperties" item-text="name" return-object multiple filled dense>
        </v-autocomplete>
        <v-tooltip v-model="propertySelectorInfo"
        right>
        <template v-slot:activator="{ on, attrs }">
          <v-btn
                icon
                v-bind="attrs"
                v-on="on"
              >
              <v-icon>mdi-information-outline</v-icon>
            </v-btn>
        </template>
        <p class="mb-0"> {{ $t('waterCompare.propertySelectorInfo[0]') }} </p>
        <p class="mb-0"> {{ $t('waterCompare.propertySelectorInfo[1]') }} </p>
        <p class="mb-0"> {{ $t('waterCompare.propertySelectorInfo[2]') }} </p>
        </v-tooltip>
        </div>
      </div>
      <div class="date-container">
        <div class="text-caption">
          {{$t('waterCompare.graphDateTitle')}}
        </div>
      <div class="dates">
        <date-time-chooser
          v-model="dateStart"
          :options="chartOptions"
          :dateLabel="$t('turfMonitorPage.deviceMonitor.graph.dateStartLabel')"
        ></date-time-chooser>
        <date-time-chooser
          :disabled="!dateEndDisplay"
          v-model="dateEnd"
          :options="chartOptions"
          :dateLabel="$t('turfMonitorPage.deviceMonitor.graph.dateEndLabel')"
          :minDate="dateStart"
        ></date-time-chooser>
        <v-btn class="sendBtn" fab x-small outlined @click="search()"> 
          <v-icon> 
            mdi-arrow-right 
          </v-icon> 
        </v-btn>
      </div>
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
      type="bar"
      :options="chartOptions"
      :series="chartSeries"
    ></apexcharts>
    <v-snackbar v-model="searchSuccess" :timeout="3000" color="light-green">
      {{ $t('waterCompare.snackbarSuccess') }}
    </v-snackbar>
    <v-snackbar v-model="searchFailureTime" :timeout="5000" color="amber darken-4">
      {{ $t('waterCompare.snackbarFailureTime') }}
    </v-snackbar>
    <v-snackbar v-model="searchFailureProperty" :timeout="5000" color="amber darken-4">
      {{ $t('waterCompare.snackbarFailureProperty') }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueApexCharts from "vue-apexcharts";
import DateTimeChooser from "./DateTimeChooser.vue";
import {  differenceInHours  } from 'date-fns';
import { SportsProperty } from "@/static/SportsPropertyType";
import { ComparisonProperty } from "@/static/ComparisonProperty";
import { FiksuvesiMeter, FiksuvesiMeterData, FiksuvesiResponse } from "@/static/FiksuvesiResponse";
import { Turf } from "@/static/TurfType";
import { i18n } from "@/main";

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
        loading: false,
        searchSuccess: false,
        searchFailureTime: false,
        searchFailureProperty: false,
        propertySelectorInfo: false,

        dateStart: '',
        dateStartTime: new Date(),
        dateEnd: '',
        dateEndDisplay: false,
        comparisonProperties: new Array<ComparisonProperty>(),
        selectedComparisonProperties: new Array<ComparisonProperty>(),
        chartSeries: new Array<{
            name: string;
            data: {x: number, y: number}[];
          }>(),

        chartOptions: {
          chart: {
            id: "sensorValueGraph",
            type: "bar",
            zoom: {
              autoScaleYaxis: true
            },
            stroke: {
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
          plotOptions: {
              bar: {
                horizontal: false,
                columnWidth: '55%',
                endingShape: 'rounded'
              },
            },
          dataLabels: {
              enabled: false
            },
          xaxis: {
            title: {
              text: i18n.t('waterCompare.axisTitleX').toString()
            },
            type: 'datetime',
            tickAmount: 6,
            forceNiceScale: true
          },
          yaxis: {
            title: {
              text: i18n.t('waterCompare.axisTitleY').toString()
            },
            decimalsInFloat: 1,
            forceNiceScale: true
          },
          tooltip: {
            x: {
              format: 'dd MMM yyyy HH:mm'
            },
            y: {
              formatter: function (val: number) {
                  return JSON.stringify(val) + ' ' + i18n.t('waterCompare.axisTooltipFormatterY').toString()
                }
            }
          },
          noData: {
            text: i18n.t('waterCompare.graphEmpty').toString()
          }
          }
        }
    },
    async mounted() {
      const properties : SportsProperty[] = await Vue.$sportsPropertyAPI.getAllSportsProperties()
      const turfs : Turf[] = await Vue.$sportsPropertyAPI.getAllTurfs()
      console.log('ComparisonChart mounted ', properties, turfs)
      let comparisonProperties = new Array<ComparisonProperty>()

      properties.map((property) => {
        if (property.water_gauges) {
          const newComparisonProperty : ComparisonProperty = {
            name: property.name,
            zip: property.zip,
            water_gauges: property.water_gauges
          }
          comparisonProperties.push(newComparisonProperty)
        } 
        else {
          for (const i in turfs) {

            if (turfs[i].sports_properties_id === property.id) {
              
              if(turfs[i].water_gauges) {
                const newComparisonProperty : ComparisonProperty = {
                  name: property.name + turfs[i].name,
                  zip: property.zip,
                  water_gauges: turfs[i].water_gauges
                }
                comparisonProperties.push(newComparisonProperty)
              }
            }
          }
        }
      })

      this.comparisonProperties = comparisonProperties
      console.log('ComparisonChart mounted ', comparisonProperties)

    },
    methods: {
      search() {
        if (this.dateStart !== '' && this.dateEnd !== '' && this.selectedComparisonProperties.length !== 0) {
            this.setupMeasurementsForGraph()
            return
        }
        if (this.dateStart === '' || this.dateEnd === '') {
          this.searchFailureTime = true
          return
        }
        if (this.selectedComparisonProperties.length === 0) {
          this.searchFailureProperty = true
          return
        }
      },
        /**
         * Time conversions
         */

        dateStringToDate(dateString : String) {
          console.log('Datestringtodate ', dateString.includes('T'))
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
            console.log('TZ format date string ', intDates, intTimes)

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
         * Gets currently selected dates and currently selected properties, and fetches
         * water consumption for selected properties within the wanted timeframe
         */
        async setupMeasurementsForGraph() {
          // Empty current graph
          this.chartSeries.length = 0

          // Format the dates to fit the API 
          const formattedDateStart = this.dateStart.replace(' ', 'T')
          const formattedDateEnd = this.dateEnd.replace(' ', 'T')

          // Loop through selected properties
          for (const i in this.selectedComparisonProperties) {
            console.log('zip ', this.selectedComparisonProperties[i].zip)
            const waterGaugeSerialNumbers = this.selectedComparisonProperties[i].water_gauges.split(',')
            const response : FiksuvesiResponse[] = await Vue.$waterAPI.getWaterConsumptionForProperty(formattedDateStart, formattedDateEnd, this.selectedComparisonProperties[i].zip)
            console.log('fiksuvesi response ', response)
            
            // Response should be an array with only one item, but in case it's not, map through the response
            response.map((metersAndPremise) => {
              
          
              let meters = new Array<FiksuvesiMeter>()

              // Assign the appropriate meters to a variable
              metersAndPremise.meters.map((meter) => {

                // Meter serial number matches properties water gauges
                if (waterGaugeSerialNumbers.includes(meter.meterSerial)) {
                  console.log('meter ', meter)
                  meters.push(meter)
                }
              })

              // If property has more than one meter
              if (meters.length > 1) {
                console.log('more than one meter')
                let meterDataArray = new Array<[FiksuvesiMeterData]>()
                for (const i in meters) {
                  meterDataArray.push(meters[i].data)
                }
                
                // Meter data length can vary, so the longest array length has to be determined
                const indexOfLongestArray = meterDataArray.reduce((a, arr, idx) => 
                  arr.length > meterDataArray[a].length ? idx : a
                , 0)
                console.log('Meter data array ', indexOfLongestArray)

                  let newChartSeries : {name: string, data: {x: number, y: number}[]} = {
                    name: metersAndPremise.premise.name,
                    data: new Array<{x: number, y: number}>()
                  }

                meterDataArray[indexOfLongestArray].map((dataRow, index) => {
                      //newChartSeriesArray[chartSeriesIndex].data.push({x: Date.parse(dataRow.timestamp), y: dataRow.consumption})
                      // For clarity, all client-side water consumption will be shown in litres
                      // Fiksuvesi API returns water in cubic meters so conversion will need to be made
                      let totalConsumption : number = 0
                      for (const idx in meterDataArray) {
                        if (meterDataArray[idx][index] !== undefined) {
                          const consumptionInLiters = meterDataArray[idx][index].consumption * 1000
                          totalConsumption += Math.round(consumptionInLiters)
                        }
                      }
                      newChartSeries.data.push({x: Date.parse(dataRow.timestamp), y: totalConsumption})
                  })
                  console.log('NewChartSeries ', newChartSeries)
                  this.chartSeries.push(newChartSeries)
              } 
              // Property has only one meter
              else {
                //newChartSeries.name = this.selectedComparisonProperties[i].name
                
                /*const data = metersData[0].data
                for (const i in data) {
                  newChartSeries.data.push({
                    x: Date.parse(data[i].timestamp),
                    y: data[i].consumption
                  })
                }*/
              }
            })
            
          }
          this.updateChart()
          this.searchSuccess = true
        },

        updateChart() {

          this.loading = false
          // Bug with Apexcharts, chart doesn't update until resize is triggered
          window.dispatchEvent(new Event('resize'))
        },

        /**
         * API calls
         */

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
        /*dateEnd: function() {
          console.log('SelectedComparisonProperties ', this.selectedComparisonProperties)
          if (this.dateStart !== '' && this.dateEnd !== '' && this.selectedComparisonProperties.length !== 0) {
            this.setupMeasurementsForGraph()
          }
        },
        selectedComparisonProperties: function() {
          console.log('SelectedComparisonProperties ', this.selectedComparisonProperties)
          if (this.dateStart !== '' && this.dateEnd !== '' && this.selectedComparisonProperties.length !== 0) {
            this.setupMeasurementsForGraph()
          }
        }*/
        /*
        dateEnd: function() {
            const timeDiff = this.getHourDifference(this.dateStart, this.dateEnd)
            this.setupMeasurementsForGraph(timeDiff, this.dateStart, this.dateEnd)
        }*/
    }
});
</script>

<style lang="scss">
@import "../assets/global.scss";

.success-snackbar {
  background-color: $success-green;
}
.failure-snackbar {
  background-color: $alert-orange;
}

.date-container {
  display: flex;
  flex-flow: column nowrap;
  margin-left: auto;
}

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
  margin: 16px;
}
.water-consumption-graph-container {
  height: 70vh;
}
.property-selector {
  margin-left: 16px;
  display: flex;
  flex-flow: column nowrap;
}
.property-selector-small {
  display: flex;
  flex-flow: row nowrap;
}
.apexchart {
  height: 100%;
}
.chart-loading {
}
</style>
