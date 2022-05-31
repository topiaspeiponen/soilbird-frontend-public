export interface Turf {
      id: number,
      name: string,
      path_name: string,
      sports_properties_id: number,
      sensors_group: string | null,
      sprinklers: Array<string>,
      coordinates: {
        lat: number,
        lon: number
      }
    water_gauges: string;
  }