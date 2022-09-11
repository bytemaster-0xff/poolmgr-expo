import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";

import services from '../services/app-services';

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { RemoteDeviceState } from "../models/blemodels/state";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;

export const ConfigureDevicePage = ({ props, navigation, route }: IReactPageServices) => {
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
    const peripheralId = route.params.id;

    const [connectionState, setConnectionState] = useState<number>(IDLE);

    function handler(value: any) {
        if (value.characteristic == CHAR_UUID_STATE) {
            console.log(value.value);
            let rds = new RemoteDeviceState(value.value);
            setRemoteDeviceState(rds);
        }
    }

    const disconnectHandler = (id: string) => {
        setConnectionState(DISCONNECTED);
        setRemoteDeviceState(undefined);

        ble.emitter.removeAllListeners('receive');
        ble.emitter.removeAllListeners('disconnected');
        ble.unsubscribe();
    }

    const loadDevice = async () => {
        setConnectionState(CONNECTING);

        if (await ble.connectById(peripheralId)) {
            setConnectionState(CONNECTED);
            await ble.subscribe(ble);
            ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            ble.emitter.addListener('receive', handler);
            ble.emitter.addListener('disconnected', disconnectHandler);
        }
    }

    useEffect(() => {
        if (initialCall) {
            setInitialCall(false);
            loadDevice();
        }

        const focusSubscription = navigation.addListener('focus', () => {
            console.log('page came back in focus.');

            if(connectionState == DISCONNECTED_PAGE_SUSPENDED){
                loadDevice();
            }
        });

        const blurSubscription = navigation.addListener('beforeRemove', async () => {
            console.log('Leaving configure device page.');
            if (connectionState == CONNECTED) {
                ble.unsubscribe();
                ble.emitter.removeAllListeners('receive');                
                ble.emitter.removeAllListeners('disconnected');
                await ble.disconnectById(peripheralId);
            }
        });

        return (() => {
            focusSubscription();
            blurSubscription();
        });
    });

    const safeNavigate = async (pageName: string, args: any) => {
        setInitialCall(false);
        if(connectionState == CONNECTED) {
            ble.unsubscribe();
            ble.emitter.removeAllListeners('receive');
            ble.emitter.removeAllListeners('disconnected');
            
            await ble.disconnectById(peripheralId);

            setConnectionState(DISCONNECTED_PAGE_SUSPENDED);        
        }

        navigation.navigate(pageName,args)
    }

    const showDeviceSettingsPage = async () => {
        await safeNavigate('settingsPage', { id: peripheralId });

    }

    const showConfigureSensorsPage = async () => {
        await safeNavigate('sensorsPage', { id: peripheralId });
    }

    const restartDevice = async () => {
        if(connectionState == CONNECTED) {        
            ble.unsubscribe();
            ble.emitter.removeAllListeners('receive');
            ble.emitter.removeAllListeners('disconnected');
            setRemoteDeviceState(undefined);

            await ble.writeNoResponseCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `reboot=1`);
            await ble.disconnectById(peripheralId);

            setConnectionState(DISCONNECTED);
        }
    }

    const factoryReset = async () => {
        if(connectionState == CONNECTED) {
            ble.unsubscribe();
            ble.emitter.removeAllListeners('receive');
            ble.emitter.removeAllListeners('disconnected');
            setRemoteDeviceState(undefined);

            await ble.writeNoResponseCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `factoryreset=1`);
            await ble.disconnectById(peripheralId);

            setConnectionState(DISCONNECTED);
        }
    }

    return (
        <View style={styles.scrollContainer}>
            <StatusBar style="auto" />
            {connectionState == CONNECTED && 
            <View>
                <Text>Connected</Text>
                {remoteDeviceState &&
                    <View>
                        <Text>Firmware SKU: {remoteDeviceState.firmwareSku}</Text>
                        <Text>Commissioned: {remoteDeviceState.commissioned ? 'Yes' : 'No'}</Text>
                        <Text>Cellular Connected {remoteDeviceState.cellularConnected ? 'Yes' : 'No'}</Text>
                        {remoteDeviceState.cellularConnected && <Text>Cellular IP: {remoteDeviceState.cellularIPAddress}</Text>}
                        <Text>WiFi Connected: {remoteDeviceState.wifiStatus}</Text>
                        {remoteDeviceState.wifiStatus == 'Connected' && <Text>WiFi IP: {remoteDeviceState.wifiIPAddress}</Text>}
                        <Text>Firmware Rev: {remoteDeviceState.firmwareRevision}</Text>
                        <Text>Hardware Rev: {remoteDeviceState.hardwareRevision}</Text>
                        <Text>Supply Voltage: {remoteDeviceState.inputVoltage}</Text>
                    </View>
                }

                <TouchableOpacity style={[styles.submitButton]} onPress={() => showDeviceSettingsPage()}>
                    <Text style={[styles.submitButtonText, { color: 'white' }]}> Connectivity </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.submitButton]} onPress={() => showConfigureSensorsPage()}>
                    <Text style={[styles.submitButtonText, { color: 'white' }]}> Sensors </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.submitButton]} onPress={() => restartDevice()}>
                    <Text style={[styles.submitButtonText, { color: 'white' }]}> Restart </Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.submitButton]} onPress={() => factoryReset()}>
                    <Text style={[styles.submitButtonText, { color: 'white' }]}> Factory Reset </Text>
                </TouchableOpacity>
            </View>
            }
            {connectionState == CONNECTING && <Text>Connecting</Text> }
            {connectionState == DISCONNECTED && 
            <View>
                <Text>Disconnected</Text>
                <TouchableOpacity style={[styles.submitButton]} onPress={() => loadDevice()}>
                            <Text style={[styles.submitButtonText, { color: 'white' }]}> Re-Connect </Text>
                </TouchableOpacity>
                </View>
            }
        </View>
    );

}