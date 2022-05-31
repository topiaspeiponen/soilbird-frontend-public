export interface Notification {
    id: number;
    type: string;
    severity: string;
    device: string;
    device_serial_number: number;
    detected_value: string;
    optimal_value: number;
    trigger: string;
    sports_property_id: string;
    turf_id: number;
    timestamp: string;
    read: string;
}