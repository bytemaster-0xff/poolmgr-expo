import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput , Switch} from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

import services from '../services/app-services';

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { SysConfig } from "../models/blemodels/sysconfig";
import Icon from "react-native-vector-icons/Ionicons";

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
        getData();
    }

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
            ble.getServices(deviceAddress!);
            let str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            console.log('state=> ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
          
            let sysconfig = new SysConfig(str!);
            setDeviceId(sysconfig.deviceId);
            setServerUrl(sysconfig.srvrHostName);
            setCommissioned(sysconfig.commissioned);
            setUseCellular(sysconfig.cellEnabled);
            setUseWIFi(sysconfig.wifiEnabled);
            setWiFiSSID(sysconfig.wifiSSID);
           
            console.log('sysconfog=> ' + str);
          
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
            ble.disconnectById(deviceAddress!);
        }
    }

    useEffect(() => {

        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }} >
                    <Icon.Button  backgroundColor="transparent"  underlayColor="transparent" color="navy" onPress={() => writeChar()} name='save' />
                </View>
            ),
        });

        if (!initialized) {
            setDeviceAddress(route.params.id);
            if (deviceAddress) {
                getDeviceProperties();
            }


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

            <Text style={styles.label}>Commissioned:</Text>
            <Switch  onValueChange = {e => setCommissioned(e)} value = {commissioned}/>

            <Text style={styles.label}>Use WiFi:</Text>
            <Switch  onValueChange = {e => setUseWIFi(e)} value = {useWiFi}/>

            <Text style={styles.label}>Use Cellular:</Text>
            <Switch  onValueChange = {e => setUseCellular(e)} value = {useCellular}/>


        </View>
    );
}