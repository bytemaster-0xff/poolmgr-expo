import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';


import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

export const ConnectivityPage = ({ props, navigation, route }) => {
    let [deviceAddress, setDeviceAddress] = useState<string>();
    
    let [deviceId, setDeviceId] = useState<string>();
    let [serverUrl, setServerUrl] = useState<string>();
   
    let [wifiSSID, setWiFiSSID] = useState<string>();
    let [wifiPWD, setWiFiPWD] = useState<string>();

    const getDeviceProperties = async () => {
        console.log(deviceAddress);
        await ble.connectById(deviceAddress!);
    }


    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
   
    const writeChar = async () => {
        if (await ble.connectById(deviceAddress!)) {
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioview=adc1');
            let result1 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log('ioconfig => ' + result1);

            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioview=adc2');
            let result2 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log('ioconfig => ' + result2);
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
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE );
            console.log('iovaluec => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_ADC_VALUE );
            console.log('adcvalueconfig => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_RELAY );
            console.log('uuid relay => ' + str);
                                
            console.log('requested data from device');
            await ble.disconnectById(deviceAddress!);
        }
        else {
            console.log('could not connect.');
        }
    }

    useEffect(() => {
        setDeviceAddress(route.params.id);
        getDeviceProperties();
    });

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <Text style={styles.label}>Device Id:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter device id" value={deviceId} onChangeText={e => setDeviceId(e)}/> 

            <Text style={styles.label}>Server Host Name:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter server url" value={serverUrl} onChangeText={e => setServerUrl(e)}/> 
            
            <Text style={styles.label}>WiFi SSID:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi ssid" value={wifiSSID} onChangeText={e => setWiFiSSID(e)}/> 

            <Text style={styles.label}>WiFi PWD:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi password" value={wifiPWD} onChangeText={e => setWiFiPWD(e)}/> 

            <TouchableOpacity style={styles.submitButton} onPress={() => getData()}>
                <Text style={styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={() => writeChar()}>
                <Text style={styles.submitButtonText}> Write it </Text>
            </TouchableOpacity>

        </View>
    );
}