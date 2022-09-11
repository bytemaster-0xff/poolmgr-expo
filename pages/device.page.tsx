import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import services from '../services/app-services';

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
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
        }                
    }

    const disconnectHandler = (id: string ) => {
        setConnectionState(DISCONNECTED);
        setRemoteDeviceState(undefined);
        setSensorValues(undefined);

        ble.emitter.removeAllListeners('receive');
        ble.emitter.removeAllListeners('disconnected');
        ble.unsubscribe();        
    }

    const showConfigurePage = async() => {
        if(connectionState == CONNECTED) {
            ble.emitter.removeAllListeners('receive');
            ble.emitter.removeAllListeners('disconnected');
            ble.unsubscribe();
            await ble.disconnectById(peripheralId);
            setConnectionState(DISCONNECTED_PAGE_SUSPENDED);            
        }

        navigation.navigate('configureDevice', { id: peripheralId });
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
                console.log(sysConfigStr);
                console.log('ORGID -> ' + sysConfig?.orgId);
                console.log('REPOID -> ' + sysConfig?.repoId);
                console.log('ID -> ' + sysConfig?.id);
                setSysConfig(sysConfig);

                let device = await services.deviceServices.getDevice(sysConfig.repoId, sysConfig.id);
                setDeviceDetail(device);
            }
            
            await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            await ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
            ble.emitter.addListener('receive', charHandler);
            ble.emitter.addListener('disconnected', disconnectHandler);
        }
    }


    useEffect(() => {
        if (initialCall) {
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
                ble.emitter.removeAllListeners('receive');
                ble.emitter.removeAllListeners('disconnected');
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
        <View style={styles.scrollContainer}>
            <StatusBar style="auto" />
                {connectionState == CONNECTED &&                 
                    <View>
                    <Text >Connected</Text>
                        {deviceDetail && 
                        <View>
                            <Text>Device Name: {deviceDetail.name}</Text>
                            <Text>Device Name: {deviceDetail.deviceType.text}</Text>
                        </View>
                        }

                    {remoteDeviceState && 
                        <View>
                            <Text>Current Device Status</Text>
                            <Text>Commissioned: {remoteDeviceState.commissioned ? 'Yes' : 'No'}</Text>
                            <Text>Cellular Connected: {remoteDeviceState.cellularConnected ? 'Yes' : 'No'}</Text>
                            <Text>WiFi Connected: {remoteDeviceState.wifiStatus}</Text>
                        </View>
                    
                    }

                    {sensorValues && 
                        <View>
                            <Text>ADC Sensors</Text>
                                {sensorValues.adcValues.map((sensorValue, index)=> sensorValue && <Text key={index}>{index + 1}. {sensorValue}</Text>)}
                            <Text>IO Sensors</Text>
                                {sensorValues.ioValues.map((sensorValue, index)=> sensorValue && <Text key={index}>{index + 1}. {sensorValue}</Text>)}
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