import SensorStatus, { StatusType } from './../static/SensorStatus';
import { NotificationColorDictionary, NotificationTriggerDictionary, NotificationLogic } from '../static/NotificationEnumerators';
import {Notification} from "@/static/NotificationsType";
import Vue from "vue";
import {i18n} from '@/main';
import { formatISO } from 'date-fns';

export class NotificationLocalizer {

    async localizeNotification(notification : Notification, turf_name: string, sportsPropertyId : number) : Promise<LocalizedNotification | null>{
        const newLocalizedNotification : LocalizedNotification = {
            originalId: 0,
            title: "",
            details: "",
            color: "",
            icon: "",
            timestamp: "",
            device: "",
            device_name: ""
        }

        try {
            console.log('color' , notification.severity)
            newLocalizedNotification.originalId = notification.id

            // Set color based on severity
            newLocalizedNotification.color = NotificationColorDictionary[notification.severity]

            // Set timestamp
            const convertedTime = formatISO(new Date(parseInt(notification.timestamp))).split('T')
            const dateSplit = convertedTime[0].split('-')
            const timeSplit = convertedTime[1].split('+')[0].split(':')
            const formattedDate = dateSplit[2] + "." + dateSplit[1] + "." + dateSplit[0] + " " + timeSplit[0] + ":" + timeSplit[1]
            newLocalizedNotification.timestamp = formattedDate

            if (notification.severity === "ERROR") {
                newLocalizedNotification.title = i18n.tc('turfMonitorPage.sensors.name', 1).toString() + " " + i18n.t('turfMonitorPage.notification.localized.titleBroken', {n: notification.device_serial_number.toString()}).toString()
                newLocalizedNotification.details = i18n.t('turfMonitorPage.notification.localized.detailsBroken').toString()
                return null
            }

            switch (notification.severity) {
                case 'OK':
                    newLocalizedNotification.icon = SensorStatus.OK.icon
                    break;
                case 'WARNING':
                    newLocalizedNotification.icon = SensorStatus.WARNING.icon
                    break;
                case 'DANGER':
                    newLocalizedNotification.icon = SensorStatus.DANGER.icon
                    break;
                case 'ERROR':
                    newLocalizedNotification.icon = SensorStatus.ERROR.icon
                    break;
                default: 
                    newLocalizedNotification.icon = SensorStatus.ERROR.icon
                    break;
            }

            // Set title based on type of notification and corresponding trigger that caused notification
            switch (notification.type) {
                case 'threshold': {
                    // If notification is of type 'threshold', meaning some value threshold was passed
                    const deviceName = notification.device_serial_number
                    let titleThresholdValue : string = ""
                    let titleTriggerValue : string = ""
                    let detailsDetectedValue : string = ""
                    let detailsOptimalValue : string = ""
                    let deviceType : string = ""

                    // Detected value contains the value that passed the threshold.
                    // DB saves detected value in following format: {valueType : value}
                    // e.g {"moisture": "12"}
                    console.log('Detected value ', notification.detected_value, notification)
                    const detectedValue : Object = JSON.parse(notification.detected_value)

                    // Save the value of the detected value {"moisture" : "12"}, which would be 12 in this case
                    detailsDetectedValue = JSON.stringify(Math.round(Number(Object.values(detectedValue)[0]) * 100) / 100)

                    // Determine what value type (moisture, temperature or salinity) passed the threshold and it's value
                    if (Object.prototype.hasOwnProperty.call(detectedValue, 'moisture')) {
                        titleThresholdValue = i18n.t('turfMonitorPage.sensors.moisture').toString()
                        await Vue.$notificationsAPI.getNotificationsLogic(notification.turf_id, sportsPropertyId).then(async(logic : NotificationLogic[]) => {
                            for (const i in logic) {
                                if (logic[i].logic[0].name === 'moisture') {
                                    detailsOptimalValue = notification.optimal_value + "%"
                                }
                            }
                            detailsDetectedValue = detailsDetectedValue + " %"
                        })
                    } else if (Object.prototype.hasOwnProperty.call(detectedValue, 'temperature')) {
                        titleThresholdValue = i18n.t('turfMonitorPage.sensors.temperature').toString()
                        const notifLogic  = await Vue.$notificationsAPI.getNotificationsLogic(notification.turf_id, sportsPropertyId).then((logic : NotificationLogic[]) => {
                            for (const i in logic) {
                                console.log('Notif logic property loop ', logic[i])
                                if (logic[i].logic[1].name === 'temperature') {
                                    detailsOptimalValue = notification.optimal_value + " °C"
                                }
                            }
                            detailsDetectedValue = detailsDetectedValue + " °C"
                        })
                    } else if (Object.prototype.hasOwnProperty.call(detectedValue, 'salinity')) {
                        titleThresholdValue = i18n.t('turfMonitorPage.sensors.salinity').toString()
                        const notifLogic  = await Vue.$notificationsAPI.getNotificationsLogic(notification.turf_id, sportsPropertyId).then((logic : NotificationLogic[]) => {
                            for (const i in logic) {
                                if (logic[i].logic[2].name === 'salinity') {
                                    detailsOptimalValue = notification.optimal_value + " dS/m"
                                }
                            }
                            detailsDetectedValue = detailsDetectedValue + " dS/m"
                        })
                    }

                    // Trigger contains the type of threshold pass and
                    // if it went above or below some threshold
                    if (NotificationTriggerDictionary[notification.trigger] === "high") {
                        titleTriggerValue = i18n.t('turfMonitorPage.notification.localized.titleTooHigh', {n: titleThresholdValue.toLocaleLowerCase()}).toString()


                    } else if (NotificationTriggerDictionary[notification.trigger] === "low") {
                        titleTriggerValue = i18n.t('turfMonitorPage.notification.localized.titleTooLow', {n: titleThresholdValue.toLocaleLowerCase()}).toString()
                    }

                    // Determine the type of device and localize it's name
                    switch (notification.device) {
                        case 'sensor':
                            deviceType = i18n.tc('turfMonitorPage.sensors.name', 2).toString() + " " + notification.device_serial_number
                            break;
                        case 'sprinkler':
                            deviceType = i18n.tc('turfMonitorPage.sensors.name', 2).toString() + " " + notification.device_serial_number
                            break;
                        default:
                            console.log('asd')
                            break;
                    }

                    newLocalizedNotification.title  = deviceType + " "  + titleTriggerValue
                  
                    console.log('Localized notification detail ', detailsOptimalValue)
                    newLocalizedNotification.details = i18n.t('turfMonitorPage.notification.localized.details', {currentKey: titleThresholdValue.toLowerCase(), currentValue: detailsDetectedValue, targetValue: detailsOptimalValue}).toString()
                  
                        break;

                }
                case 'action': {
                    console.log(' Action detected ')
                    break;
                }

                default: {
                    console.log('Default action setting notification type')
                    break;
                }
            }

            // Set details

            
            return newLocalizedNotification
        } catch(err) {
            console.error('NotificationLocalizer error ', err)
            return null
        }
    }
}

export interface LocalizedNotification {
    originalId: number;
    title: string;
    details: string
    color: string;
    icon: string;
    timestamp: string;
    device: string;
    device_name: string;
}