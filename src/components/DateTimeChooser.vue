<template>
    <v-menu
      ref="menu"
      v-model="display"
      :close-on-content-click="false"
      :return-value.sync="datetime"
      transition="scale-transition"
      offset-y
      min-width="auto"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-text-field
            :disabled="disabled"
          v-model="formattedDatetime"
          :label="dateLabel"
          prepend-icon="mdi-calendar"
          readonly
          v-bind="attrs"
          v-on="on"
        ></v-text-field>
      </template>
    <v-card>
        <v-tabs fixed-tabs v-model="activeTab">
            <v-tab key="calendar">
                <slot name="dateIcon">
                    <v-icon>
                        mdi-calendar
                    </v-icon>
                </slot>
            </v-tab>
            <v-tab key="timer" :disabled="dateSelected">
            <slot name="timeIcon">
              <v-icon> mdi-clock-time-five-outline </v-icon>
            </slot>
          </v-tab>
          <v-tab-item key="calendar">
            <v-date-picker v-model="date" @input="showTimePicker()" :max="getCurrentDate" no-title scrollable :min="getMinDate" />
          </v-tab-item>
          <v-tab-item key="timer">
            <v-time-picker
              ref="timer"
              class="v-time-picker-custom"
              v-model="time"
              format="24hr"
              full-width
            ></v-time-picker>
          </v-tab-item>
        </v-tabs>
         <v-card-actions>
            <v-spacer></v-spacer>
            <slot name="actions" :parent="this">
            <v-btn color="grey lighten-1" text @click.native="clearHandler">{{$t('turfMonitorPage.deviceMonitor.graph.dateExit')}}</v-btn>
            <v-btn color="green darken-1" text @click="handleOk(date,time)"> OK </v-btn>
            </slot>
        </v-card-actions>
    </v-card>
        </v-menu>
</template>

<script lang="ts">
import Vue from "vue";
import { format, parse } from 'date-fns';


const DEFAULT_DATE : string = '';
const DEFAULT_TIME : string = '00:00:00';
const DEFAULT_DATE_FORMAT : string= 'yyyy-MM-dd';
const DEFAULT_TIME_FORMAT : string = 'HH:mm:ss';

export default Vue.extend({
    props: {
        // Date
        datetime: String,
        dateLabel: String,
        dateFormat: {
            type: String,
            default: DEFAULT_DATE_FORMAT
        },
        timeFormat: {   
            type: String,
            default: 'HH:mm'
        },
        maxDate: String,
        minDate: String,
        disabled: Boolean,
        presetSelected: Number
    },
    data: function() {
        return {
            display: false,
            activeTab: 0,
            date: '',
            time: '',
        }
    },
    mounted() {
        console.log('Mounted', this.datetime, this.minDate)
        this.init()
    },
    methods: {
        init() {
            if (!this.datetime) {
                this.date = ''
                this.time = ''
                return
            }
            //const initDateTime = parse(this.datetime, this.dateTimeFormat, new Date())
            //console.log('InitDateTime', initDateTime, this.datetime, this.dateTimeFormat, new Date())
            this.date = format(new Date(), DEFAULT_DATE_FORMAT)
            this.time = format(new Date(), DEFAULT_TIME_FORMAT)
            console.log('Init', this.date, this.time)
        },
        handleOk(newDate : String, newTime : String) {  
            console.log('HandleOK ', newDate, newTime, this.selectedDatetime)
            this.resetPicker()
            this.$emit('input', this.formattedDatetime)
        },
        resetPicker() {
            this.display = false
            this.activeTab = 0
            if (this.$refs.timer) {
                const timer : any = this.$refs.timer
                timer.selectingHour= true
            }
        },
        clearHandler() {
            this.resetPicker()
            this.date = DEFAULT_DATE
            this.time = DEFAULT_TIME
            this.$emit('input', null)
            },
        showTimePicker() {
            this.activeTab = 1
        }
    },
    computed: {
        dateSelected() {
            const selected : any = !this.date
            return selected;
        },
        getCurrentDate() {
            const currentDate = format(new Date(), DEFAULT_DATE_FORMAT);
            return currentDate;
        },
        getMinDate() {
            if (this.minDate) {
                console.log('mindate', this.minDate)
                return this.minDate;
            } else return null
        },
        dateTimeFormat() {
             return this.dateFormat + ' ' + this.timeFormat
        },
        defaultDateTimeFormat() : string {
        return DEFAULT_DATE_FORMAT + ' ' + DEFAULT_TIME_FORMAT
        },
        formattedDatetime() : string {
            console.log('ForamttedDateTime ', this.selectedDatetime)
            return this.selectedDatetime ? format(this.selectedDatetime, this.dateTimeFormat) : ''
        },
        selectedDatetime() : Date | null {
            console.log('SelectedDatetime ', this.date, this.time)
            if (this.date !== '' && this.time !== '') {
                let datetimeString = this.date + ' ' + this.time
                if (this.time.length === 5) {
                    datetimeString += ':00'
                }
                return parse(datetimeString, this.defaultDateTimeFormat, new Date())
            } else {
                return null
            }
        },
    },
    watch: {
        datetime: function() {
            this.init
        },
        presetSelected: function() {
            console.log('Preset changed')
        }
    }
});
</script>

<style lang="scss"></style>
