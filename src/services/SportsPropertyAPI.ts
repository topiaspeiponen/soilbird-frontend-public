import { Turf } from './../static/TurfType';
import { SportsProperty } from './../static/SportsPropertyType';
import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SoilscoutMeasurement, SoilscoutDevice, SoilscoutGroup } from './SoilscoutAPIResponseTypes';
import StringLibrary from "../static/StringLibrary";
import Vue from "vue";

export class SportsPropertyAPI {
      async getAllSportsProperties() {
        try {
            const response = await Vue.$baseAPI.instance.get('property/all')
            return response.data
        } catch(err) {
            return null
        }
      }

      async getAllTurfs() {
        try {
          const response = await Vue.$baseAPI.instance.get('property/turfs/all')
          return response.data
        } catch(err) {
          return null
        }
      }

      async getTurfsInSportsProperty(sportsPropertyId : number) {
        try {
            const response = await Vue.$baseAPI.instance.get('property/turfs/' + sportsPropertyId)
            return response.data
        } catch(err) {
            return null
        }
      }

      async createSportsProperty(sportsProperty: SportsProperty) {
        try {
          const response = await Vue.$baseAPI.instance.post('property/create', sportsProperty)
          return response.data
        } catch(err) {
          return null
        }
      }

      async updateSportsProperty(sportsProperty: SportsProperty) {
        try {
          const response = await Vue.$baseAPI.instance.put('property/update', sportsProperty)
          return response.data
        } catch(err) {
          return null
        }
      }

      async deleteSportsProperty(id: number) {
        try {
          const response = await Vue.$baseAPI.instance.delete('property/delete', {
            params: {
              id: id
            }
          })
          return response.data
        } catch(err) {
          return null
        }
      }

      async createTurf(turf: Turf) {
        try {
          const response = await Vue.$baseAPI.instance.post('property/turfs/create', turf)
          return response.data
        } catch(err) {
          return null
        }
      }

      async updateTurf(turf: Turf) {
        try {
          const response = await Vue.$baseAPI.instance.put('property/turfs/update', turf)
          return response.data
        } catch(err) {
          return null
        }
      }

      async deleteTurf(id: number) {
        try {
          const response = await Vue.$baseAPI.instance.delete('property/turfs/delete', {
            params: {
              id: id
            }
          })
        } catch(err) {
          return null
        }
      }
    }