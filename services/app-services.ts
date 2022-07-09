import {NativeStorageService } from '../core/utils'
import {NuviotClientService } from './nuviot-client.service';
import { NetworkCallStatusService } from './network-call-status-service'; 
import { ErrorReporterService } from './error-reporter.service';
import { HttpClient } from '../core/utils';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DevicesService } from './devices.service';
import { DeviceGroupService } from './device-group.service';

class AppServices {
    
    constructor() {
        this.storage = new NativeStorageService();
        this.errorReporter = new ErrorReporterService();
        this.networkCallStatusService = new NetworkCallStatusService();

        this.httpClient = new HttpClient(this.storage);

        this.client = new NuviotClientService(this.httpClient, this.networkCallStatusService, this.errorReporter);
    
        this.deviceGroupsServices = new DeviceGroupService(this.client);

        this.deviceServices = new DevicesService(this.deviceGroupsServices, this.client);
    }


    httpClient: HttpClient;
    networkCallStatusService: NetworkCallStatusService;
    errorReporter: ErrorReporterService;
    storage: NativeStorageService;
    client: NuviotClientService;
    deviceGroupsServices: DeviceGroupService;
    deviceServices: DevicesService;

   // storage: NativeStor
}

let appServices = new AppServices();
export default appServices;