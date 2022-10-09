import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, ActivityIndicator, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import AppServices from "../services/app-services";

import styles from '../styles';
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { RemoteDeviceState } from "../models/blemodels/state";
import { SysConfig } from "../models/blemodels/sysconfig";
import { IOValues } from "../models/blemodels/iovalues";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export const DevicePage = ({ props, navigation, route } : IReactPageServices) => {    
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined>();
    const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
    const [sensorValues, setSensorValues] = useState<IOValues | undefined>(undefined);
    const [connectionState, setConnectionState] = useState<number>(IDLE);
    const [sysConfig, setSysConfig] = useState<SysConfig>();
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const [isBusy, setIsBusy] = useState<boolean>(true);
    const peripheralId = route.params.id;
    

    const charHandler = (value: any) => {
        if(value.characteristic == CHAR_UUID_STATE) {
            console.log(value.value);
            let rds = new RemoteDeviceState(value.value);
            setRemoteDeviceState(rds);
        }                

        if(value.characteristic == CHAR_UUID_IO_VALUE) {
            console.log(value.value);
            let values = new IOValues(value.value);
            setSensorValues(values);
            console.log('hi');
            console.log(values.ioValues);
        }                
    }

    const disconnectHandler = (id: string ) => {
        setConnectionState(DISCONNECTED);
        setRemoteDeviceState(undefined);
        setSensorValues(undefined);

        ble.btEmitter.removeAllListeners('receive');
        ble.btEmitter.removeAllListeners('disconnected');
        ble.unsubscribe();        
    }

    const showConfigurePage = async() => {
        if(connectionState == CONNECTED) {
            ble.btEmitter.removeAllListeners('receive');
            ble.btEmitter.removeAllListeners('disconnected');
            ble.unsubscribe();
            await ble.disconnectById(peripheralId);
            setConnectionState(DISCONNECTED_PAGE_SUSPENDED);            
        }

        navigation.navigate('configureDevice', { id: peripheralId, repoId:deviceDetail?.deviceRepository.id, deviceId:deviceDetail?.id  });
    }

    const loadDevice = async () => {
        console.log('loading sys config.');
        setConnectionState(CONNECTING);
        
        if (await ble.connectById(peripheralId, CHAR_UUID_SYS_CONFIG)) {
            setConnectionState(CONNECTED);
            await ble.subscribe(ble);

            let sysConfigStr = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            if (sysConfigStr) {
                let sysConfig = new SysConfig(sysConfigStr);                
                setSysConfig(sysConfig);

                let device = await appServices.deviceServices.getDevice(sysConfig.repoId, sysConfig.id);
                setDeviceDetail(device);
            }
            
            await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);

            ble.btEmitter.removeAllListeners('receive');
            ble.btEmitter.removeAllListeners('disconnected');

            ble.btEmitter.addListener('receive', charHandler);
            ble.btEmitter.addListener('disconnected', disconnectHandler);
        }
    }


    useEffect(() => {
        if (initialCall) {
            appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) })
            appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) })

            loadDevice();    
            setInitialCall(false);
        }

        const focusSubscription = navigation.addListener('focus', () => {
            if(connectionState == DISCONNECTED_PAGE_SUSPENDED) {
                loadDevice();
            }
        });

        const blurSubscription = navigation.addListener('beforeRemove', async () => {
            if(connectionState == CONNECTING) {
                ble.cancelConnect();
            }
            else if(connectionState == CONNECTED) {
                console.log('DevicePage_BeforeRemove.');
                ble.btEmitter.removeAllListeners('receive');
                ble.btEmitter.removeAllListeners('disconnected');
                ble.unsubscribe();
                await ble.disconnectById(peripheralId);
            }
        });

        navigation.setOptions({
            headerRight: () => (
              <View style={{ flexDirection: 'row' }} >
              <Icon.Button  backgroundColor="transparent"   underlayColor="transparent" color="navy" onPress={showConfigurePage} name='cog-outline' />
          </View>),
          });      

          return (() => {            
            focusSubscription();
            blurSubscription();
        });
    });

    React.useLayoutEffect(() => {

      });

    return (
        isBusy ?
        <View style={styles.spinnerView}>                
            <Text style={{fontSize: 25}}>Please Wait</Text>    
            <ActivityIndicator size="large" color="#00ff00" animating={isBusy} />
        </View>
    :
        <View style={styles.scrollContainer}>
            <StatusBar style="auto" />
                {connectionState == CONNECTED &&                 
                    <View>
                    <Text >Bluetooth Connection: Connected</Text>
                        {deviceDetail && 
                        <View>
                            <Text>Device Name: {deviceDetail.name}</Text>
                            <Text>Repo: {deviceDetail.deviceRepository.text}</Text>
                            <Text>Device Type: {deviceDetail.deviceType.text}</Text>
                        </View>
                        }

                    {remoteDeviceState && 
                        <View style={{marginTop:20}}>
                            <Text>Current Device Status</Text>
                            <Text>Firmware SKU: {remoteDeviceState.firmwareSku}</Text>
                            <Text>FirmwareRev: {remoteDeviceState.firmwareRevision}</Text>
                            <Text>Commissioned: {remoteDeviceState.commissioned ? 'Yes' : 'No'}</Text>
                            <Text>Cellular Connected: {remoteDeviceState.cellularConnected ? 'Yes' : 'No'}</Text>
                            <Text>WiFi Connected: {remoteDeviceState.wifiStatus}</Text>
                            <Text>VIN: {remoteDeviceState.inputVoltage}V</Text>
                        </View>
                    
                    }

                    {sensorValues && 
                        <View style={{marginTop:20}}>
                            <Text>Live Sensor Data</Text>
                            <Text>ADC Sensors</Text>
                                {sensorValues.adcValues.map((sensorValue, index)=> (sensorValue != undefined && <Text key={index}>{index + 1}. {sensorValue}</Text>))}
                            <Text style={{marginTop:20}}>IO Sensors</Text>                                
                                {sensorValues.ioValues.map((ioValue, index)=> (ioValue != undefined && <Text key={index}>{index + 1}. {ioValue == 0 ? 'off' : 'on'}</Text>))}

                            </View>

                    }
                    </View> 
                }
                {connectionState == CONNECTING && <Text>Connecting</Text>}
                {connectionState == DISCONNECTED && 
                    <View>
                        <Text>Disconnected</Text>
                        <TouchableOpacity style={[styles.submitButton]} onPress={() => loadDevice()}>
                            <Text style={[styles.submitButtonText, { color: 'white' }]}> Re-Connect </Text>
                        </TouchableOpacity>
                    </View>
                }
                {connectionState == IDLE && <Text>Please wait</Text>}
                {connectionState == DISCONNECTED_PAGE_SUSPENDED && <Text>Please Wait Reconnecting</Text>}
                
        </View>
    );

}