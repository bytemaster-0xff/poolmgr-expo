import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, ScrollView, Text, TextInput , Switch, TouchableOpacity} from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

import services from '../services/app-services';

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { SysConfig } from "../models/blemodels/sysconfig";
import Icon from "react-native-vector-icons/Ionicons";

export const ConnectivityPage = ({ props, navigation, route }) => {
    let [deviceAddress, setDeviceAddress] = useState<string>();

    let [deviceId, setDeviceId] = useState<string>();
    let [serverUrl, setServerUrl] = useState<string>();
    let [port, setPort] = useState<string>();

    let [device, setDevice] = useState<Devices.DeviceDetail | undefined>();

    let [wifiSSID, setWiFiSSID] = useState<string>();
    let [wifiPWD, setWiFiPWD] = useState<string>();
    let [commissioned, setCommissioned] = useState<boolean>(false);
    let [useWiFi, setUseWIFi] = useState<boolean>(true);
    let [useCellular, setUseCellular] = useState<boolean>(false);

    const writeChar = async () => {
        if(!deviceAddress){
            console.error('Device address not set, can not write.');
            return;
        }

        if (await ble.connectById(deviceAddress!)) {
            console.log('Device Id', deviceId);
            console.log('WiFi SSID Id', wifiSSID);
            if (deviceId) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `deviceid=${deviceId}`);
            if (serverUrl) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${serverUrl}`);
            if (wifiSSID) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${wifiSSID}`);
            if (wifiPWD) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPWD}`);
            if (port) await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${port}`);

            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=' + (useWiFi ? '1' : '0'));
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=' + (useCellular ? '1' : '0'));
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0'));
            await ble.disconnectById(deviceAddress!);
          
            await getData(deviceAddress!);
        }
        else {
            console.warn('could not connect');
        }
    }

    const getData = async (peripheralId: string) => {
   
        if (await ble.connectById(peripheralId)) {
            let str = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            console.log('state=> ' + str);
            str = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
          
            let parts = str?.split(',')

            let sysconfig = new SysConfig(str!);
            setDeviceId(parts![0]);
            setServerUrl(sysconfig.srvrHostName);
            setCommissioned(sysconfig.commissioned);
            setUseCellular(sysconfig.cellEnabled);
            setUseWIFi(sysconfig.wifiEnabled);
            setWiFiSSID(sysconfig.wifiSSID);
            setPort(sysconfig.port.toString());
           
            console.log('sysconfig=> ' + str);
          
            await ble.disconnectById(peripheralId);
        }
        else {
            console.warn('could not connect.');
        }
    }

    useEffect(() => {
        let peripheralId = route.params.id;

        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }} >
                    <Icon.Button  backgroundColor="transparent"  underlayColor="transparent" color="navy" onPress={() => writeChar()} name='save' />
                </View>
            ),
        });

        console.log('Getting connectivity settings for:', peripheralId);

        setDeviceAddress(peripheralId);
   
        if (peripheralId) {
            getData(peripheralId);
        }

        return (() => {
            console.log('shutting down...');
        });
    }, []);

    return (
        <ScrollView style={styles.scrollContainer}>
            <StatusBar style="auto" />

            {device?.deviceId}

            <Text style={styles.label}>Device Id:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter device id" value={deviceId} onChangeText={e => {setDeviceId(e); console.log(deviceId)}} />

            <Text style={styles.label}>Server Host Name:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter server url" value={serverUrl} onChangeText={e => setServerUrl(e)} />

            <Text style={styles.label}>Server Port Number:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter port number" value={port} onChangeText={e => setPort(e)} />

            <Text style={styles.label}>WiFi SSID:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi ssid" value={wifiSSID} onChangeText={e => setWiFiSSID(e)} />

            <Text style={styles.label}>WiFi PWD:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi password" value={wifiPWD} onChangeText={e => setWiFiPWD(e)} />

            <Text style={styles.label}>Commissioned:</Text>
            <Switch  onValueChange = {e => setCommissioned(e)} value = {commissioned}/>

            <Text style={styles.label}>Use WiFi:</Text>
            <Switch  onValueChange = {e => setUseWIFi(e)} value = {useWiFi}/>

            <Text style={styles.label}>Use Cellular:</Text>
            <Switch  onValueChange = {e => setUseCellular(e)} value = {useCellular}/>

            <TouchableOpacity style={[styles.submitButton]} onPress={() => writeChar()}>
               <Text style={[styles.submitButtonText, { color: 'white' }]}> Update Devices </Text>
            </TouchableOpacity>

        </ScrollView>
    );
}