import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Button, Pressable, TurboModuleRegistry } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import services from '../services/app-services';

import styles from '../styles';
import Tabbar from "@mindinventory/react-native-tab-bar-interaction";
import Icon from "react-native-vector-icons/Ionicons";
import { IReactPageServices } from "../services/react-page-services";
import { BLENuvIoTDevice } from "../models/device/device-local";
import { SysConfig } from "../models/blemodels/sysconfig";

export default function ScanPage({ navigation }: IReactPageServices) {
    const [currentTab, setCurrentTab] = useState<string>("home");
    const [devices, setDevices] = useState<BLENuvIoTDevice[]>([]);
    const [isScanning, setIsScanning] = useState<boolean>(false);
    const [repos, setRepos] = useState<Devices.DeviceRepoSummary[] | undefined>()
    const [initialCall, setInitialCall] = useState<boolean>(true);

    const tabs = [
        {
            name: 'home',
            activeIcon: <Icon name="home" color="#fff" size={25} />,
            inactiveIcon: <Icon name="home" color="#4d4d4d" size={25} />
        },
        {
            name: 'list',
            activeIcon: <Icon name="bar-chart-outline" color="#fff" size={25} />,
            inactiveIcon: <Icon name="bar-chart-outline" color="#4d4d4d" size={25} />
        },
        {
            name: 'notification',
            activeIcon: <Icon name="notifications-outline" color="#fff" size={25} />,
            inactiveIcon: <Icon name="notifications-outline" color="#4d4d4d" size={25} />
        },
        {
            name: 'profile',
            activeIcon: <Icon name="person-outline" color="#fff" size={25} />,
            inactiveIcon: <Icon name="person-outline" color="#4d4d4d" size={25} />
        },

    ];

    const loadRepos = async () => {
        console.log('loading repos.');
        let repos = await services.deviceServices.loadDeviceRepositories();
        setRepos(repos);
    }

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
            },
            );


            console.log('all three granted');
            console.log(granted);
            console.log(btGranted);
            console.log(btcGranted);
            console.log('yes no');

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

    const startScan = async () => {
        const permission = await requestLocationPermission();
        if (permission) {
            await ble.startScan();
            setCurrentTab('list');
        }
    }

    const showDevice = async (peripheral: BLENuvIoTDevice) => {
        if(peripheral.provisioned)
            navigation.navigate('devicePage', { id: peripheral.peripheralId });
        else
            navigation.navigate('provisionPage', { id: peripheral.peripheralId });
    }

    const clear = async () => {
        setIsScanning(false);
        ble.peripherals = [];
        setDevices(devices => []);
        console.log('cleared...');
        console.log('new device count' + devices.length);
    }

    useEffect(() => {
        if (initialCall) {
            console.log('---');
            console.log('---');
            console.log('-----------------');

            loadRepos();

            navigation.setOptions({
                headerRight: () => (
                    <View style={{ flexDirection: 'row' }} >
                        <Button onPress={() => clear()} title="CLR" />
                        <Button onPress={() => startScan()} title="SCN" />
                    </View>
                ),
            });

            ble.emitter.removeAllListeners('connected');
            ble.emitter.removeAllListeners('scanning');

            ble.emitter.addListener('connected', (device) => discovered(device))
            ble.emitter.addListener('scanning', (isScanning) => {
                setIsScanning(isScanning);
            });

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

        return (() => {
        });
    }, []);

    const tabChanged = (tab: any) => {
        setCurrentTab(tab.name);
    }

    const logout = () => {
        navigation.replace('authPage');
    }

    const discovered = async (peripheral: Peripheral) => {
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

                if(sysConfig.id && sysConfig.id.length > 0)
                    device.provisioned = true;

                devices.push(device);
                console.log('found and added device to devices')
                console.log(devices);
                setDevices([...devices]);
            }

            await ble.disconnectById(peripheral.id);
        }
    }

    const myItemSeparator = () => {
        return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />;
    };

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}>No data found more real wide content </Text>
            </View>
        );
    };

    const reposPage = () => {
        return (<FlatList
            contentContainerStyle={{ flex: 1, alignItems: "stretch" }}
            style={{ backgroundColor: 'white', width: "100%" }}
            ItemSeparatorComponent={myItemSeparator}
            ListEmptyComponent={myListEmpty}
            data={repos}
            renderItem={({ item }) =>
                <View style={[styles.listRow, { padding: 10, height: 90, }]} key={item.id}>
                    <View style={{ flex: 4 }}>
                        <Text style={[{ color: 'gray', flex: 3 }]}>{item.name}</Text>
                        <Text style={[{ color: 'gray', flex: 3 }]}>Test</Text>
                    </View>
                </View>
            } />);

    }

    const foundDevicesListTab = () => {
        return (<FlatList
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
                            {item.provisioned && <Icon  color="green"  name='hardware-chip-outline' size={24}/>}
                            {!item.provisioned && <Icon  color="green"  name='add-circle-outline'  size={24}/>}
                    </View>
                </Pressable>
            } />);

    }

    const notificationPage = () => {

    }

    const profilePage = () => {
        return (<View>
            <TouchableOpacity style={[styles.submitButton, { flex: 4 }]} onPress={() => logout()}>
                <Text style={[styles.submitButtonText, { color: 'white' }]}> LOGOUT </Text>
            </TouchableOpacity>

        </View>)
    }

    const homePage = () => {

    }

    const renderTabs = () => {
        if (currentTab === 'home') return reposPage()
        if (currentTab === 'list') return foundDevicesListTab()
        if (currentTab === 'notification') return notificationPage()
        if (currentTab === 'profile') return profilePage()
    }

    return (
        <View style={[styles.container, { backgroundColor: 'white' }]}>
            <StatusBar style="auto" backgroundColor="red" />
            {
                renderTabs()
            }

            <ActivityIndicator style={styles.loadingIndicator} size="large" color="#ffffff" animating={isScanning} />

            <Tabbar
                tabs={tabs}
                tabBarContainerBackground='#6699ff'
                tabBarBackground='#fff'
                activeTabBackground='#6699ff'
                labelStyle={{ color: '#4d4d4d', fontWeight: '600', fontSize: 10 }}
                onTabChange={(tab) => tabChanged(tab)}
            />
        </View>
    );
}


