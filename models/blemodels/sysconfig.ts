import { timestamp } from "rxjs";

export class SysConfig {
    constructor(str: string) {
        let parts = str.split(',');

        this.deviceId = parts[0];
        this.orgId = parts[1];
        this.repoId = parts[2];
        this.id = parts[3];
        this.deviceModelId = parts[4];
        this.serverHostName = parts[5];
        this.port = parseInt(parts[6]);
        this.serverType = parts[7];
        this.deviceAccessKey = parts[8];
        this.commissioned = parts[9] == '1';
        this.cellEnabled = parts[10] == '1';
        this.wifiEnabled = parts[11] == '1';
        this.wifiSSID = parts[12];
        this.wifiPWD = parts[13];
        this.pingRate = parseInt(parts[14]);
        this.sendUpdateRate = parseInt(parts[15]);
        this.gpsEnabled = parts[16] == '1';
        this.gpsUpdateRate = parts[17] == '1';
    }

    deviceId: string;
    orgId: string;
    repoId: string;
    id: string;
    deviceModelId: string;
    serverHostName: string;
    serverType: string;
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