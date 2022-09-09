import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";

import services from '../services/app-services';

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { RemoteDeviceState } from "../models/blemodels/state";

export const ConfigureDevicePage = ({ props, navigation, route } : IReactPageServices) => {
    const [deviceAddress, setDeviceAddress] = useState<string>();
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
    const [repos, setRepos] = useState<Devices.DeviceRepoSummary[] | undefined>()
    const peripheralId = route.params.id;

    const loadRepos = async () => {
        console.log('loading repos.');
        let repos = await services.deviceServices.loadDeviceRepositories();
        setRepos(repos);
    }

    function handler(value: any) {
        if(value.characteristic == CHAR_UUID_STATE) {
            console.log(value.value);
            let rds = new RemoteDeviceState(value.value);
            setRemoteDeviceState(rds);
        }                
    }

    const getDeviceProperties = async (peripheralId: string) => {
        console.log(peripheralId);
        await ble.connectById(peripheralId);
        await ble.subscribe(ble);
        ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
        console.log('this came from effect');
        ble.emitter.addListener('receive', handler);
    }

    if (initialCall) {
        let peripheralId = route.params.id;        
    
        setDeviceAddress(peripheralId);
        console.log('>>>>initial setup<<<< -> ' + peripheralId);
        setInitialCall(false);
        loadRepos();        

        if (peripheralId) {
            console.log(this);
            getDeviceProperties(peripheralId);
        }
    }

    useEffect(() => {
        return (() => {
            console.log('Leaving device page.');
            ble.emitter.removeAllListeners('receive');
            ble.unsubscribe();
            ble.disconnectById(peripheralId);
        })
    }, []);

    const leavePage = async () => {
        console.log('Leaving device page.');
        ble.emitter.removeAllListeners('receive');
        ble.unsubscribe();
        ble.disconnectById(peripheralId);
        setInitialCall(true);
        console.log('-');
        console.log(' ');
    }

    const showDeviceSettingsPage = async () => {
        await leavePage();
        navigation.navigate('settingsPage', { id: peripheralId });
        
    }

    const showConfigureSensorsPage = async () => {
        await leavePage();
        navigation.navigate('sensorsPage', { id: peripheralId });
    }

    const restartDevice = async() => {
        if (await ble.connectById(peripheralId)) {
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `reboot=1`);
            await ble.disconnectById(peripheralId);
        }
        else {
            console.warn('could not connect');
        }
    }

    const factoryReset = async() => {
        if (await ble.connectById(peripheralId)) {
            console.log('connected before reset.');
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `factoryreset=1`);
            console.log('wrote');
            await ble.disconnectById(peripheralId);
            console.log('disconnected.');
        }
        else {
            console.warn('could not connect');
        }
    }

    return (
        <View style={styles.scrollContainer}>
            <StatusBar style="auto" />
                <View>
                    {remoteDeviceState && 
                    <View>
                        <Text> {remoteDeviceState.firmwareSku}</Text>
                        <Text> Commissioned {remoteDeviceState.commissioned ? 'Yes' : 'No'}</Text>
                        <Text> Cellular Connected {remoteDeviceState.cellularConnected ? 'Yes' : 'No'}</Text>
                        <Text> Cellular IP: {remoteDeviceState.cellularIPAddress}</Text>
                        <Text> WiFi Connected: {remoteDeviceState.wifiStatus}</Text>
                        <Text> WiFi IP: {remoteDeviceState.wifiIPAddress}</Text>
                        <Text >{remoteDeviceState.firmwareRevision}</Text>
                        <Text >{remoteDeviceState.hardwareRevision}</Text>
                        <Text >{remoteDeviceState.inputVoltage}</Text>
                    </View>                    
                    }
                    

                    <TouchableOpacity style={[styles.submitButton]} onPress={() => showDeviceSettingsPage()}>
                        <Text style={[styles.submitButtonText, { color: 'white' }]}> Settings </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.submitButton]} onPress={() => showConfigureSensorsPage()}>
                        <Text style={[styles.submitButtonText, { color: 'white' }]}> Configure </Text>
                    </TouchableOpacity>
               
                    <TouchableOpacity style={[styles.submitButton]} onPress={() => restartDevice()}>
                        <Text style={[styles.submitButtonText, { color: 'white' }]}> Restart </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.submitButton]} onPress={() => factoryReset()}>
                        <Text style={[styles.submitButtonText, { color: 'white' }]}> Factory Reset </Text>
                    </TouchableOpacity>
                </View>
        </View>
    );

}