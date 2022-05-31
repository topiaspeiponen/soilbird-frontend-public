import Vue from 'vue'

const SensorStatus : StatusType = {
    OK : {
        statusMsg: "",
        icon: "mdi-check",
        color: "#76FF03",
        importance: 0
    },
    WARNING : {
        statusMsg: "",
        icon: "mdi-exclamation-thick",
        color: "#FFFF00",
        importance: 1
    },
    DANGER : {
        statusMsg: "",
        icon: "mdi-alert",
        color: "#F57F17",
        importance: 2
    },
    ERROR : {
        statusMsg: "",
        icon: "mdi-alert-decagram",
        color: "#B00020",
        importance: 3
    }
}

export interface StatusType {
    [key: string] : StatusTypeData
}
export interface StatusTypeData {
        statusMsg: string,
        icon: string,
        color: string,
        importance: number
}

export default SensorStatus;