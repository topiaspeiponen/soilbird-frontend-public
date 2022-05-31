
export const NotificationColorDictionary : {[key: string]: string} = {
    "OK": "#64DD17",
    "WARNING" : "#FFD600",
    "DANGER" : "#F44336",
    "ERROR" : "#D50000"
}

export const NotificationTriggerDictionary : {[key: string]: string} =  {
    "HIGH": "high",
    "LOW": "low",
    "COMPLETED": "completed"
}

export interface NotificationLogic{
    id: number,
    turf_id: number,
    sports_property_id: number,
    logic_type: string,
    device_type: string,
    logic: Logic[]
}

export interface Logic {
    name: string,
    broken: number,
    normal: number,
    abs_max: number,
    abs_min: number,
    warning_max: number,
    warning_min: number
}
