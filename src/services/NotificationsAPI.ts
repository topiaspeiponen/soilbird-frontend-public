import { NotificationLogic } from './../static/NotificationEnumerators';
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SoilscoutMeasurement, SoilscoutDevice, SoilscoutGroup } from './SoilscoutAPIResponseTypes';
import StringLibrary from "../static/StringLibrary";
import Vue from "vue";

export class NotificationsAPI {

      async getNotificationsForUser(propertyId : number, userId: number) {
        try {
            const response = await Vue.$baseAPI.instance.get('notifications/filtered', {
                params: {
                    propertyId: propertyId,
                    userId: userId
                }
            });
            return response.data
        } catch(err) {
            return null
        }
      }

      async markNotificationAsReadForUser(notificationId : number, userId : number) {
        try {
          console.log('notificaiton id ', notificationId)
          const response = await Vue.$baseAPI.instance.put('notifications/mark', {
            data: {
              notificationId: notificationId,
              userId: userId
            }
          })
          return response.data
        } catch(err) {
          return null
        }
      }

      async getNotificationsLogic(turf_id: number, sportsPropertyId : number) {
        try {
          const response = await Vue.$baseAPI.instance.get('notifications/logic', {
            params: {
              turf_id: turf_id,
              sportsPropertyId: sportsPropertyId
            }
          })
          return response.data;
        } catch(err) {
          return null
        }
      }

      async getAllNotificationsLogic() {
        try {
          const response = await Vue.$baseAPI.instance.get('notifications/logic/all')
          return response.data;
        } catch(err) {
          return null;
        }
      }

      async updateNotificationsLogic(notificationsLogic : NotificationLogic) {
        try {
          const response = await Vue.$baseAPI.instance.put('notifications/logic/update', notificationsLogic)
          return response.data
        } catch(err) {
          return null;
        }
      }

      async createNotificationsLogic(notificationsLogic: NotificationLogic) {
        try {
          const response = await Vue.$baseAPI.instance.post('notifications/logic/create', notificationsLogic)
          return response.data
        } catch(err) {
          return null
        }
      }

      async deleteNotificationsLogic(turfId: number, propertyId: number) {
        try {
          const response = await Vue.$baseAPI.instance.delete('notifications/logic/delete', {
            params: {
              turfId: turfId,
              propertyId: propertyId
            }
          })
          return response.data
        } catch(err) {
          return null;
        }
      }
    }