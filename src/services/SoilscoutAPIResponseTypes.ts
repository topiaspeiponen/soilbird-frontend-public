export interface SoilscoutGroup {
    devices: [number],
    id: number,
    last_measurement: SoilscoutMeasurement,
    name: string,
    site: number
}

export interface SoilscoutDevice {
    id: number,
    serial_number: number,
    name: string,
    imei: string,
    device_type: string,
    voltage_external: number,
    voltage_battery: number,
    location: {
        latitude: number,
        longitude: number,
        height: number,
        soil_type: string,
        soil_density: number,
        field_capacity: number,
        wilting_point: number,
        irrigation_threshold: number,
        site_id: number
    },
    site: number,
    last_seen: string,
    device_status: string,
    last_modem_status: {
        connection_type: string,
        signal_strength: number
    },
    last_measurement: SoilscoutMeasurement,
    groups: [number]
}

export interface SoilscoutMeasurement {
    conductivity: number,
    field_capacity: number,
    moisture: number,
    salinity: number,
    temperature: number,
    timestamp: string,
    water_balance: number,
    wilting_point?: number
}
export interface SoilscoutMeasurementAggregated {
    timestamp: {
        min: string,
        max: string,
        median: string
    },
    devices: string[],
    temperature: SoilscoutMeasurementValues,
    moisture: SoilscoutMeasurementValues,
    conductivity: SoilscoutMeasurementValues,
    dielectricity: SoilscoutMeasurementValues,
    salinity: SoilscoutMeasurementValues,
    water_balance: SoilscoutMeasurementValues
}

interface SoilscoutMeasurementValues {
    min: number,
    max: number,
    median: number,
    mean: number,
    moving_mean_5: number,
    stddev: number
}
export interface SoilscoutGroupPost {
    devices: [number];
    name: string;
    site: number;
}

export interface SoilscoutDevicePost {
    serial_number: number;
    name: string;
    imei: string | null;
    device_type: string;
    location: {
        latitude: number;
        longitude: number;
        height: number;
        soil_type: SoilscoutSoilType;
        soil_density: number;
        field_capacity: number;
        wilting_point: number;
        irrigation_threshold: number;
    };
    site: number;
    groups: [number];
}

export enum SoilscoutSoilType {
    "loam",
    "clay",
    "organic",
    "sand"
}
