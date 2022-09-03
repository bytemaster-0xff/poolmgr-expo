import { timestamp } from "rxjs";

export class SysConfig {
    constructor(str: string) {
        let parts = str.split(',');

        this.deviceId = parts[0];
        this.orgId = parts[1];
        this.repoId = parts[2];
        this.id = parts[3];
        this.deviceModelId = parts[4];
        this.srvrHostName = parts[5];
        this.port = parseInt(parts[6]);
        this.deviceAccessKey = parts[7];
        this.commissioned = parts[8] == '1';
        this.cellEnabled = parts[9] == '1';
        this.wifiEnabled = parts[10] == '1';
        this.wifiSSID = parts[11];
        this.wifiPWD = parts[12];
        this.pingRate = parseInt(parts[13]);
        this.sendUpdateRate = parseInt(parts[14]);
        this.gpsEnabled = parts[15] == '1';
        this.gpsUpdateRate = parts[16] == '1';
    }

    deviceId: string;
    orgId: string;
    repoId: string;
    id: string;
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