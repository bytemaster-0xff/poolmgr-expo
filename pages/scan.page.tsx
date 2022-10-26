import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, FlatList, ActivityIndicator, Pressable, BackHandler, Alert, } from 'react-native';
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
    const [busyMessage, setIsBusyMessage] = useState<String>('Busy');
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

            let btGranted = PermissionsAndroid.RESULTS.GRANTED;
            let btcGranted = PermissionsAndroid.RESULTS.GRANTE;


            let OsVer = Platform.Version;//.constants["Release"] as number;

            console.log('react native version' + OsVer)

            // android revision 30 is android release 11, 31 is 12.
            if (OsVer > 30) {
                btGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, {
                    title: 'Location permission for bluetooth scanning',
                    message: 'wahtever',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });

                btcGranted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT, {
                    title: 'Location permission for bluetooth scanning',
                    message: 'wahtever',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                });
            }

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
        setIsScanning(true);
        for (let peripheral of discoveredPeripherals) {
            setIsBusyMessage(`Loading Device ${idx++} of ${discoveredPeripherals.length}`);
            if (await ble.connectById(peripheral.id, CHAR_UUID_SYS_CONFIG)) {
                let sysConfigStr = await ble.getCharacteristic(peripheral.id, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
                if (sysConfigStr) {
                    console.log(sysConfigStr);

                    let sysConfig = new SysConfig(sysConfigStr);

                    let name = sysConfig.deviceId;
                    if (!name || name == '')
                        name = peripheral.name!;

                    let device: BLENuvIoTDevice = {
                        peripheralId: peripheral.id,
                        name: name,
                        deviceType: sysConfig.deviceModelId,
                        provisioned: false,
                        orgId: sysConfig.orgId,
                        repoId: sysConfig.repoId,
                        deviceUniqueId: sysConfig.id,
                        id: devices!.length
                    }

                    if (sysConfig.id && sysConfig.id.length > 0)
                        device.provisioned = true;

                    devices!.push(device);
                    setDevices([...devices!]);
                }

                await ble.disconnectById(peripheral.id);
            }
        }
        setIsScanning(false);
    }


    const scanningStatusChanged = (isScanning: boolean) => {
        console.log('scanningStatusChanged=>' + isScanning);
        setIsScanning(isScanning);

        if (!isScanning) {
            console.log('scanning finished');
            ble.removeAllListeners('connected');
            ble.removeAllListeners('scanning');
            findNuvIoTDevices();
        }
        else {
            setIsBusyMessage('Scanning for local devices.');
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

        setDevices([]);

        const permission = Platform.OS == "android" ? await requestLocationPermission() : true;
        if (permission) {
            setDiscoveredPeripherals([]);

            ble.addListener('connected', (device) => discovered(device))
            ble.addListener('scanning', (isScanning) => { scanningStatusChanged(isScanning); });
            await ble.startScan();
            if(ble.simulatedBLE()){
                let idx = 0;
                for(let item of ble.peripherals) {                    
                    devices.push({
                        name: item.name!,
                        peripheralId: item.id,
                        provisioned: true,
                        id: idx++,
                        deviceType: 'BILL0'
                    })
                }

                setDevices(devices);

                console.log('find device.s');
                findNuvIoTDevices();
            }
        }
    }

    const stopScanning = () => {
        if (isScanning) {
            if (!ble.simulatedBLE()) {
                ble.removeAllListeners('connected');
                ble.removeAllListeners('scanning');
                ble.stopScan();
            }
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

        });

        const blurSubscription = navigation.addListener('beforeRemove', () => {
            stopScanning();
        });

        return (() => {
            focusSubscription();
            blurSubscription();
        });
    });


    const discovered = async (peripheral: Peripheral) => {
        discoveredPeripherals.push(peripheral);
    }

    const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}> could not find any devices. </Text>
            </View>
        );
    };

    return (
        isScanning ?
            <View style={styles.spinnerView}>
                <Text style={{ fontSize: 25 }}>{busyMessage}</Text>
                <ActivityIndicator size="large" color="#00ff00" animating={isScanning} />
            </View>
            :
            devices.length > 0 ?
                <View>
                    <FlatList
                        contentContainerStyle={{ alignItems: "stretch" }}
                        style={{ backgroundColor: 'white', width: "100%" }}
                        ItemSeparatorComponent={myItemSeparator}
                        ListEmptyComponent={myListEmpty}
                        data={devices}
                        renderItem={({ item }) =>
                            <Pressable onPress={() => showDevice(item)} key={item.peripheralId} >
                                <View style={[styles.listRow, { padding: 10, height: 90, }]}  >
                                    <View style={{ flex: 4 }} key={item.peripheralId}>
                                        <Text style={[{ color: 'black', flex: 3 }]}>{item.name}</Text>
                                        <Text style={[{ color: 'black', flex: 3 }]}>{item.deviceType}</Text>
                                    </View>
                                    <Text style={[{ color: 'black', flex: 3 }]}>{item.peripheralId}</Text>
                                    {item.provisioned && <Icon style={{ fontSize: 24, color: 'green' }} name='hardware-chip-outline' />}
                                    {!item.provisioned && <Icon style={{ fontSize: 24, color: 'green' }} name='add-circle-outline' />}
                                </View>
                            </Pressable>
                        }
                    />
                </View>
                :
                <View style={styles.centeredContent}>
                    <Text style={{ fontSize: 25 }}>Scan for Devices</Text>
                    <Icon.Button style={{ fontSize: 64 }} backgroundColor="transparent" underlayColor="transparent" color="navy" onPress={() => startScan()} name='refresh-outline' />
                </View>
    );
}


