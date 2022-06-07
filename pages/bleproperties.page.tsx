import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text } from "react-native";
import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

export const BlePropertiesPage = ({ navigation, route }) => {
    let [deviceAddress, setDeviceAddress] = useState<string>();

    const getDeviceProperties = async () => {
        console.log(deviceAddress);
        await ble.connectById(deviceAddress!);
        console.log('this came from effect');        
    }

    const writeChar = async () => {
        await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioview=adc1');
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
            <Text style={styles.submitButtonText}> {deviceAddress} </Text>
            <TouchableOpacity style={styles.submitButton} onPress={() => getData()}>
                <Text style={styles.submitButtonText}> Submit </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={() => writeChar()}>
                <Text style={styles.submitButtonText}> Write it </Text>
            </TouchableOpacity>

        </View>
    );
}