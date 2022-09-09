import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Button, Pressable, BackHandler, Alert, } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

import Icon from "react-native-vector-icons/Ionicons";
import { IReactPageServices } from "../services/react-page-services";
import { BLENuvIoTDevice } from "../models/device/device-local";
import { SysConfig } from "../models/blemodels/sysconfig";

import styles from '../styles';

export default function ScanPage({ navigation }: IReactPageServices) {
    const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
    const [discoveredPeripherals, setDiscoveredPeripherals] = useState<Peripheral[]>([]);

    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [initialCall, setInitialCall] = useState<boolean>(true);

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
                title: 'Location permission for bluetooth scanning',
                message: 'wahtever',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
            );

            const btGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
                title: 'Location permission for bluetooth scanning',
                message: 'wahtever',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
            );

            const btcGranted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
                title: 'Location permission for bluetooth scanning',
                message: 'wahtever',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            });

            console.log('Permissions Granted', granted, btGranted, btcGranted);

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                if (btGranted === PermissionsAndroid.RESULTS.GRANTED) {
                    if (btcGranted === PermissionsAndroid.RESULTS.GRANTED) {
                        console.log('Location permission for bluetooth scanning granted');
                        return true;
                    }
                    else {
                        console.log('Blue tooth connect permission => ' + btcGranted);
                        return false;
                    }
                }
                else {
                    console.log('Blue tooth scan permission revoked -=> ' + btGranted);
                    return false;
                }
            } else {
                console.log('Location permission for bluetooth scanning revoked -=> ' + granted);
                return false;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    }

    const findNuvIoTDevices = async () => {
        let idx = 1;
        for (let peripheral of discoveredPeripherals) {
            console.log(`Device ${idx++} of ${discoveredPeripherals.length}`);
            if (await ble.connectById(peripheral.id, CHAR_UUID_SYS_CONFIG)) {
                let sysConfigStr = await ble.getCharacteristic(peripheral.id, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
                if (sysConfigStr) {
                    console.log(sysConfigStr);

                    let sysConfig = new SysConfig(sysConfigStr);

                    let device: BLENuvIoTDevice = {
                        peripheralId: peripheral.id,
                        name: peripheral.name!,
                        provisioned: false,
                        orgId: sysConfig.orgId,
                        repoId: sysConfig.repoId,
                        deviceUniqueId: sysConfig.id,
                        id: devices.length
                    }

                    if (sysConfig.id && sysConfig.id.length > 0)
                        device.provisioned = true;

                    devices.push(device);
                    setDevices([...devices]);
                }

                await ble.disconnectById(peripheral.id);
            }
        }
    }


    const scanningStatusChanged = (isScanning: boolean) => {
        console.log('scanningStatusChanged=>' + isScanning);

        setIsScanning(isScanning);
        if (!isScanning) {
            console.log('scanning finished');
            ble.emitter.removeAllListeners('connected');
            ble.emitter.removeAllListeners('scanning');
            findNuvIoTDevices();
        }
    }

    if (initialCall) {
        ble.peripherals = [];

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

        setInitialCall(false);
    }

    const startScan = async () => {
        console.log(isScanning);
        if (isScanning)
            return;

        const permission = await requestLocationPermission();
        if (permission) {
            setDiscoveredPeripherals([]);
            ble.emitter.addListener('connected', (device) => discovered(device))
            ble.emitter.addListener('scanning', (isScanning) => { scanningStatusChanged(isScanning); });
            await ble.startScan();
        }
    }

    
    const stopScanning = () => {
        if(isScanning) {
            ble.emitter.removeAllListeners('connected');
            ble.emitter.removeAllListeners('scanning');

            ble.stopScan();
        }
    }

    const showDevice = async (device: BLENuvIoTDevice) => {
        if (device.provisioned)
            navigation.navigate('devicePage', { id: device.peripheralId });
        else
            navigation.navigate('provisionPage', { id: device.peripheralId });
    }

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }} >
                    <Icon.Button backgroundColor="transparent" underlayColor="transparent" color="navy" onPress={() => startScan()} name='refresh-outline' />
                </View>
            ),
        });

        const focusSubscription = navigation.addListener('focus', () => {
            console.log('I GOT ME FOCUS ON FORM');
        });

        const blurSubscription = navigation.addListener('beforeRemove', () => {
            stopScanning();
        });


        return (() => {
            //backHandler.remove();
            focusSubscription();
            blurSubscription();
        });
    });


    const discovered = async (peripheral: Peripheral) => {
        if (peripheral.name?.startsWith("NuvIoT"))
            discoveredPeripherals.push(peripheral);
    }

    const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}> no data </Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: 'white' }]}>
            {isScanning &&
                <View style={{alignSelf: "stretch", backgroundColor: 'navyblue'}}>
                    <Text>Please Wait - Scanning Now Longer box is Longer</Text>
                    <View style={{ flex: 1, backgroundColor: "brown" }} />
                    <View style={{ backgroundColor: "yellow", flexDirection: 'row' }} >
                        <View style={{ flex:1, backgroundColor: "red" }} />
                        <View style={{ flex:1}} >
                            <ActivityIndicator size="large" color="#00ff00" animating={isScanning} />
                        </View>
                        <View style={{ flex:1, backgroundColor: "blue" }} />
                    </View>
                    <View style={{ flex: 1, backgroundColor: "green" }} />
                </View>
            }

            {!isScanning &&
                <FlatList
                    contentContainerStyle={{ flex: 1, alignItems: "stretch" }}
                    style={{ backgroundColor: 'white', width: "100%" }}
                    ItemSeparatorComponent={myItemSeparator}
                    ListEmptyComponent={myListEmpty}
                    data={devices}
                    renderItem={({ item }) =>
                        <Pressable onPress={() => showDevice(item)} key={item.peripheralId} >
                            <View style={[styles.listRow, { padding: 10, height: 90, }]}  >
                                <View style={{ flex: 4 }} key={item.peripheralId}>
                                    <Text style={[{ color: 'black', flex: 3 }]}>{item.name}</Text>
                                </View>
                                <Text style={[{ color: 'black', flex: 3 }]}>{item.peripheralId}</Text>
                                {item.provisioned && <Icon color="green" name='hardware-chip-outline' size={24} />}
                                {!item.provisioned && <Icon color="green" name='add-circle-outline' size={24} />}
                            </View>
                        </Pressable>
                    }
                />
            }
        </View>
    );
}


