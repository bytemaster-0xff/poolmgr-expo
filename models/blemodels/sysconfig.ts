import { timestamp } from "rxjs";

export class SysConfig {
    constructor(str: string) {
        let parts = str.split(',');

        this.deviceId = parts[0];
        this.deviceModelId = parts[1];
        this.srvrHostName = parts[2];
        this.port = parseInt(parts[3]);
        this.deviceAccessKey = parts[4];
        this.commissioned = parts[5] == '1';
        this.cellEnabled = parts[6] == '1';
        this.wifiEnabled = parts[7] == '1';
        this.wifiSSID = parts[8];
        this.wifiPWD = parts[9];
        this.pingRate = parseInt(parts[10]);
        this.sendUpdateRate = parseInt(parts[11]);
        this.gpsEnabled = parts[12] == '1';
        this.gpsUpdateRate = parts[13] == '1';
    }

    deviceId: string;
    deviceModelId: string;
    srvrHostName: string;
    deviceAccessKey: string;
    commissioned: boolean;
    cellEnabled: boolean;
    wifiEnabled: boolean;
    wifiSSID: string;
    port: number;
    wifiPWD: string;
    pingRate: number;
    sendUpdateRate: number;
    gpsEnabled: boolean;
    gpsUpdateRate: boolean;   
}