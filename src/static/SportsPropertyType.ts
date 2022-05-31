export interface SportsProperty {
  primary_id: number,
    id: number,
    name: string,
    path_name: string,
    coordinates: {
      lat: number,
      lon: number
    },
    zip: string,
    water_gauges: string
  }