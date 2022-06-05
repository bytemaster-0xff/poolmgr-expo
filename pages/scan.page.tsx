import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble } from '../NuvIoTBLE'

import styles from '../styles';

export default function ScanPage({ navigation }) {

    let [devices, setDevices] = useState<Peripheral[]>([]);
    let [isScanning, setIsScanning] = useState<boolean>(false);

    const startScan = async () => { await ble.startScan(); }
    const connect = async (peripheral: Peripheral) => {
        await ble.connect(peripheral);
        navigation.navigate('blePropertiesPage', { id: peripheral.id });
        console.log('thats all folks');

    }
    const clear = async () => {
        setIsScanning(false);
        ble.peripherals = [];
        setDevices([]);
        console.log('cleared...');
        console.log('new device count' + devices.length);
    }

    useEffect(() => {
        console.log('---');
        console.log('-----------------');

        ble.emitter.removeAllListeners('connected');
        ble.emitter.removeAllListeners('scanning');
        ble.emitter.addListener('connected', (device) => refresh(device))
        ble.emitter.addListener('scanning', (isScanning) => setIsScanning(isScanning))

        if (Platform.OS === 'android' && Platform.Version >= 23) {
            PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                if (result) {
                    console.log("Permission is OK");
                } else {
                    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                        if (result) {
                            console.log("User accept");
                        } else {
                            console.log("User refuse");
                        }
                    });
                }
            });
        }

        return (() => {
            ble.unsubscribe();
        })
    }, []);

    const refresh = (name: Peripheral) => {
        console.log('device count' + devices.length);
        if (devices.filter(dev => dev.id == name.id).length == 0) { }
        devices.push(name);
        setDevices([...devices]);
        console.log('device count' + devices.length);
    }


    return (
        <View style={styles.container}>
            <StatusBar style="auto" />

            <View style={styles.formGroup}>

                <Text style={styles.label}>{isScanning ? 'true' : 'false'}</Text>

                {!isScanning ?
                    <TouchableOpacity style={styles.submitButton} onPress={() => startScan()}><Text style={styles.submitButtonText}> Scan </Text></TouchableOpacity>
                    : null}
                <TouchableOpacity style={styles.submitButton} onPress={() => clear()}><Text style={styles.submitButtonText}> Clear </Text></TouchableOpacity>

                <FlatList
                    data={devices}
                    renderItem={({ item }) =>
                        <View style={styles.listRow} key={item.id}>
                            <Text style={styles.label}>{item.name}</Text>
                            <TouchableOpacity style={styles.submitButton} onPress={() => connect(item)}><Text style={styles.submitButtonText}> GET INFO </Text></TouchableOpacity>
                        </View>
                    } />
            </View>
        </View>
    );
}


