import axios, { AxiosInstance, AxiosResponse } from "axios";
import { SoilscoutMeasurement, SoilscoutDevice, SoilscoutGroup, SoilscoutDevicePost } from './SoilscoutAPIResponseTypes';
import StringLibrary from "../static/StringLibrary";
import {i18n} from '@/main'
import Vue from "vue";

/**
 * @author Topias Peiponen, Projektityöntekijä
 * @since 31.05.2021
 * @version 1.0
 *
 * Library containing all Soilscout API calls that fetch Soilscout Hydra-sensor related data
 */
export class SoilscoutAPILibrary {
  private instance!: AxiosInstance;

  // Device related requests

  async getSiteDevices(site: number) {
    try {
      if (Vue.$baseAPI.instance) {
        const response = await Vue.$baseAPI.instance.get("soilscout/devices/?site=" + site, {});
        return response.data;
      } else {
        throw new Error(i18n.t('errors.noInstance').toString());
      }
    } catch (e) {
      console.error("Error getting devices ", e);
      return null;
    }
  }

  async getSiteDevicesByID(site: number, ids: Array<number> | undefined) : Promise<SoilscoutDevice[]>{
    try {
        const response = await Vue.$baseAPI.instance.post("soilscout/devices/ids/?site=" + site,
        {
          data: {
            ids: ids
          }
        });
        return response.data;
    } catch (e) {
      console.error("Error getting devices by ID ", e);
      return Promise.reject()
    }
  }

  getOneDevice(id: number) {}

  async createDevice(device : SoilscoutDevicePost) {
    try {
      const response = await Vue.$baseAPI.instance.post("soilscout/devices", device)
      return response.data;
    } catch(e) {
      console.log(e)
      return null
    }
  }

  async updateDevice(id: number, device : SoilscoutDevicePost) {
    try {
      const response = await Vue.$baseAPI.instance.patch("soilscout/devices/" + id, device)
      return response.data;
    } catch(e) {
      console.log(e)
      return null
    }
  }

  async deleteDevice(id: number) {
    try {
      const response = await Vue.$baseAPI.instance.delete("soilscout/devices/" + id)
      return response.data;
    } catch(e) {
      console.log(e)
      return null
    }
  }

  async createGroup(device : SoilscoutDevicePost) {
    try {
      const response = await Vue.$baseAPI.instance.post("soilscout/groups", device)
      return response.data;
    } catch(e) {
      console.log(e)
      return null
    }
  }

  async updateGroup(id: number, device : SoilscoutDevicePost) {
    try {
      const response = await Vue.$baseAPI.instance.patch("soilscout/groups" + id, device)
      return response.data;
    } catch(e) {
      console.log(e)
      return null
    }
  }

  async deleteGroup(id: number) {
    try {
      const response = await Vue.$baseAPI.instance.delete("soilscout/groups" + id);
      return response.data;
    } catch(e) {
      console.log(e)
      return null
    }
  }

  async getSiteGroups(site: number) : Promise<SoilscoutGroup[]> {
    try {
      if (Vue.$baseAPI.instance) {
        const response = await Vue.$baseAPI.instance.get("soilscout/groups/?site=" + site, {})
        console.log('GetSiteGroups ', response)
        return response.data;
      } else {
        throw new Error(i18n.t('errors.noInstance').toString());
      }
    } catch (e) {
        return Promise.reject()
    }
  }

  getOneGroup(id: number) {}

  // Measurements related requests

  getAllMeasurementsAggrFromSite(site: number, since: Date, until: Date) {}

  async getMeasurementsAggrFromDevices(
    since: Date,
    until: Date,
    devices: string,
    window_size: number,
    aggregate_all: boolean
  ) {
    try {
      if (Vue.$baseAPI.instance) {
        console.log('Soilscout APILibrary ', JSON.stringify(since), until, devices, window_size, aggregate_all)
        const params = new URLSearchParams();
        params.append("since", JSON.stringify(since));
        params.append("until", JSON.stringify(until));
        params.append("devices", devices);
        params.append("window_size", JSON.stringify(window_size));
        params.append("aggregate_all", JSON.stringify(aggregate_all));
        console.log('Params ', params)
        const response = await Vue.$baseAPI.instance.get("soilscout/measurements/aggregated/", {
          params: {
            since: since,
            until: until,
            devices: devices,
            window_size: window_size,
            aggregate_all: aggregate_all,
          },
        });

        return response.data;
      } else {
        throw new Error(i18n.t('errors.noInstance').toString());
      }
    } catch (e) {
      console.error("Cant get aggregate measurements from devices ", e);
      return Promise.reject(e )
    }
  }
}
