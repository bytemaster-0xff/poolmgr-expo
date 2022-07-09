export class RemoteDeviceState {
    constructor(str: string) {
        let parts = str.split(',');
   
        this.firmwareSku= parts[0];
        this.firmwareRevision = parts[1];
        this.hardwareRevision = parts[2];
        this.commissioned = parts[3] == '1';
        this.wifiConnected = parts[4] == '1';
        this.wifiRSSI = parseInt(parts[5]);
        this.cellularConnected = parts[6] == '1';
        this.isCloudConnected = parts[7] == '1'
        this.inputVoltage = parseFloat(parts[8]);
        this.externalPower = parts[9] == '1';
        this.otaParam = parts[10];
        this.otaState = parts[11];
    };

    firmwareSku:string;
    firmwareRevision: string;
    hardwareRevision: string;
    commissioned: boolean;
    wifiConnected: boolean;
    wifiRSSI: number;
    cellularConnected: boolean;
    isCloudConnected: boolean;
    inputVoltage: number;
    externalPower: boolean;
    otaState: string;
    otaParam: string
}



