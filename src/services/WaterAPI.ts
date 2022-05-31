
import Vue from "vue";

export class WaterAPI {

    /**
     * Gets water consumption data for a specific property (with zipcode) in a timeframe.
     * Dates have to be in ISO 8601 format: 2021-08-08T00:00
     *  
     */
      async getWaterConsumptionForProperty(startDate: string, endDate: string, zipCode: string) {
        try {
            const response = await Vue.$baseAPI.instance.get('water/property', {
                params: {
                    start: startDate,
                    end: endDate,
                    zip: zipCode
                }
            })
            return response.data
        } catch(err) {
            return null
        }
      }
    }