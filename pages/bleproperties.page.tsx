import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text } from "react-native";
import styles from '../styles';
import { ble, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

export const BlePropertiesPage = ({ navigation, route }) => {
    let [deviceAddress, setDeviceAddress] = useState<string>();

    const getDeviceProperties = async () => {
        console.log(deviceAddress);
        await ble.connectById(deviceAddress!);
        console.log('this came from effect');
    }

    const getData = async () => {
        if (await ble.connectById(deviceAddress!)) {
            let str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            console.log(str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            console.log(str);
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
        </View>
    );
}