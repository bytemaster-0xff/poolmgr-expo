import { timestamp } from "rxjs";

export class SysConfig {
    constructor(str: string) {
        let parts = str.split(',');

        this.deviceId = parts[0];
        this.deviceModelId = parts[1];
        this.srvrHostName = parts[2];
        this.deviceAccessKey = parts[3];
        this.commissioned = parts[4] == '1';
        this.cellEnabled = parts[5] == '1';
        this.wifiEnabled = parts[6] == '1';
        this.wifiSSID = parts[7];
        this.wifiPWD = parts[8];
        this.pingRate = parseInt(parts[9]);
        this.sendUpdateRate = parseInt(parts[10]);
        this.gpsEnabled = parts[11] == '1';
        this.gpsUpdateRate = parts[12] == '1';
    }

    deviceId: string;
    deviceModelId: string;
    srvrHostName: string;
    deviceAccessKey: string;
    commissioned: boolean;
    cellEnabled: boolean;
    wifiEnabled: boolean;
    wifiSSID: string;
    wifiPWD: string;
    pingRate: number;
    sendUpdateRate: number;
    gpsEnabled: boolean;
    gpsUpdateRate: boolean;   
}