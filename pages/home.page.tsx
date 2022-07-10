import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Button } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble } from '../NuvIoTBLE'
import services from '../services/app-services';



import styles from '../styles';
import Tabbar from "@mindinventory/react-native-tab-bar-interaction";
import Icon from "react-native-vector-icons/Ionicons";
import { scan } from "../services/BleManager";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function ScanPage({ navigation }) {
    let [currentTab, setCurrentTab] = useState<string>("home");
    let [devices, setDevices] = useState<Peripheral[]>([]);
    let [isScanning, setIsScanning] = useState<boolean>(false);
    let [repos, setRepos] = useState<Devices.DeviceRepoSummary[] | undefined>()

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

    const startScan = async () => {
        await ble.startScan();
        setCurrentTab('list');
    }

    const connect = (peripheral: Peripheral) => {
        navigation.navigate('tempSensorsPage', { id: peripheral.id });
        console.log('thats all folks');
    }

    const settings = async (peripheral: Peripheral) => {
        await ble.connect(peripheral);
        navigation.navigate('settingsPage', { id: peripheral.id });
    }

    const clear = async () => {
        setIsScanning(false);
        ble.peripherals = [];
        setDevices(devices => []);
        console.log('cleared...');
        console.log('new device count' + devices.length);
    }

    const loadJWT = async () => {
        let jwt = await AsyncStorage.getItem("jwt");
        console.log(jwt);
    }

    useEffect(() => {
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
        ble.emitter.addListener('connected', (device) => refresh(device))
        ble.emitter.addListener('scanning', (isScanning) => {
            setIsScanning(isScanning);
            console.log('setting scanning' + isScanning);
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

        return (() => {
            console.log("--------------------------------");
            console.log("----------------");
            console.log('unsubscribe called.');
            ble.unsubscribe();
        })
    }, []);

    const tabChanged = (tab: any) => {
        setCurrentTab(tab.name);
    }

    const logout = () => {
        navigation.replace('authPage');
    }

    const refresh = (name: Peripheral) => {
        console.log('device count' + devices.length);
        if (devices.filter(dev => dev.id == name.id).length == 0) { }
        devices.push(name);
        setDevices([...devices]);
        console.log('device count' + devices.length);
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

    const listPage = () => {
        return (<FlatList
            contentContainerStyle={{ flex: 1, alignItems: "stretch" }}
            style={{ backgroundColor: 'white', width: "100%" }}
            ItemSeparatorComponent={myItemSeparator}
            ListEmptyComponent={myListEmpty}
            data={devices}
            renderItem={({ item }) =>
                <View style={[styles.listRow, { padding: 10, height: 90, }]} key={item.id}>
                    <View style={{ flex: 4 }}>
                        <Text style={[{ color: 'gray', flex: 3 }]}>{item.name}</Text>
                        <Text style={[{ color: 'gray', flex: 3 }]}>Test</Text>
                    </View>

                    <TouchableOpacity style={[styles.submitButton, { flex: 3 }]} onPress={() => connect(item)}>
                        <Text style={[styles.submitButtonText, { color: 'white' }]}> CONNECT </Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.submitButton, { flex: 3 }]} onPress={() => settings(item)}>
                        <Text style={[styles.submitButtonText, { color: 'white' }]}> SETTINGS </Text>
                    </TouchableOpacity>
                </View>
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
        if (currentTab === 'list') return listPage()
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
                labelStyle={{ color: '#4d4d4d', fontWeight: '600', fontSize: 11 }}
                onTabChange={(tab) => tabChanged(tab)}
            />
        </View>
    );
}


