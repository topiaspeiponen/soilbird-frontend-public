export interface FiksuvesiResponse {
        premise: {
            name: string;
            address: string;
            zipCode: string;
            postOffice: string;
        },
        meters: [FiksuvesiMeter]
}

export interface FiksuvesiMeterData {
    consumption: number,
    timestamp: string,
    value: number
}

export interface FiksuvesiMeter {
    id: string;
    deviceId: string;
    meterSerial: string;
    data: [FiksuvesiMeterData]
}