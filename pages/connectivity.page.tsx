import React, { useEffect, useState } from "react";
import {  StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

import services from '../services/app-services';

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

export const ConnectivityPage = ({ props, navigation, route }) => {
    let [deviceAddress, setDeviceAddress] = useState<string>();

    let [initialized, setInitialized] = useState<boolean>(false);
    let [deviceId, setDeviceId] = useState<string>();
    let [serverUrl, setServerUrl] = useState<string>();

    let [device, setDevice] = useState<Devices.DeviceDetail | undefined>();

    let [wifiSSID, setWiFiSSID] = useState<string>();
    let [wifiPWD, setWiFiPWD] = useState<string>();
    let [commissioned, setCommissioned] = useState<boolean>(false);
    let [useWiFi, setUseWIFi] = useState<boolean>(true);
    let [useCellular, setUseCellular] = useState<boolean>(false);

    const getDeviceProperties = async () => {
       refresh();

    }

    const refresh = async() => {
        if (await ble.connectById(deviceAddress!)) {
            await ble.disconnectById(deviceAddress!);

            await ble.connectById(deviceAddress!)
            let result2 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            if (result2) {
                console.log('sysconfig => ' + result2);
                var parts = result2!.split(',');
                setDeviceId(parts[0]);
                setServerUrl(parts[2]);
                setCommissioned(parts[4] == "1");
                setUseCellular(parts[5] == "1");
                setUseWIFi(parts[6] == "1");
                setWiFiSSID(parts[7]);
            }

            setInitialized(true);

            await ble.disconnectById(deviceAddress!);
        }
        else {
            console.log('could not connect.');
        }

        await loadRepos();
    }

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);

    const writeChar = async () => {
        if (await ble.connectById(deviceAddress!)) {
            if (deviceId) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `deviceid=${deviceId}`);
            if (serverUrl) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${serverUrl}`);
            if (wifiSSID) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${wifiSSID}`);
            if (wifiPWD) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPWD}`);
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=' + (useWiFi ? '1' : '0'));
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=' + (useCellular ? '1' : '0'));

            let result2 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            console.log('sysconfig => ' + result2);
            await ble.disconnectById(deviceAddress!);
        }
        else {
            console.log('could not connect');
        }
    }

    const getData = async () => {
        if (await ble.connectById(deviceAddress!)) {
            let str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            console.log('state=> ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            console.log('sysconfog=> ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log('ioconfig => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_ADC_IOCONFIG);
            console.log('adcconfig => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
            console.log('iovaluec => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_ADC_VALUE);
            console.log('adcvalueconfig => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_RELAY);
            console.log('uuid relay => ' + str);

            console.log('requested data from device');
            await ble.disconnectById(deviceAddress!);
        }
        else {
            console.log('could not connect.');
        }
    }

    const commission = async () => {
        if (await ble.connectById(deviceAddress!)) {
            setCommissioned(true);
            commissioned = true;
            if (deviceId) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0'));
            let result2 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            console.log('sysconfig => ' + result2);
        }
    }

    const loadRepos = async () => {
    
        let repos = await  services.deviceServices.loadDeviceRepositories();
    
        console.log(repos);
    }

    useEffect( () => {
        if (!initialized) {
            setDeviceAddress(route.params.id);
            console.log('DEVICe ADDR: ', deviceAddress);
            if(deviceAddress) {
                getDeviceProperties();
            }
            loadRepos();

        
                        }
    });

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            {device?.deviceId}

            <Text style={styles.label}>Device Id:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter device id" value={deviceId} onChangeText={e => setDeviceId(e)} />

            <Text style={styles.label}>Server Host Name:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter server url" value={serverUrl} onChangeText={e => setServerUrl(e)} />

            <Text style={styles.label}>WiFi SSID:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi ssid" value={wifiSSID} onChangeText={e => setWiFiSSID(e)} />

            <Text style={styles.label}>WiFi PWD:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi password" value={wifiPWD} onChangeText={e => setWiFiPWD(e)} />

            <TouchableOpacity style={styles.submitButton} onPress={() => getData()}>
                <Text style={styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={() => writeChar()}>
                <Text style={styles.submitButtonText}> Write it </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={() => commission()}>
                <Text style={styles.submitButtonText}> COMMISSION </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={() => refresh()}>
                <Text style={styles.submitButtonText}> REFRESH</Text>
            </TouchableOpacity>

        </View>
    );
}