import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Button } from 'react-native';
import { Peripheral } from 'react-native-ble-manager'
import { ble } from '../NuvIoTBLE'
import Ionicons from 'react-native-vector-icons/Ionicons';

import styles from '../styles';
import Tabbar from "@mindinventory/react-native-tab-bar-interaction";
import Icon from "react-native-vector-icons/Ionicons";
import { scan } from "../services/BleManager";


export default function ScanPage({ navigation }) {
    const [type, setType] = useState<'down' | 'up'>('down');
  
    let [devices, setDevices] = useState<Peripheral[]>([]);
    let [isScanning, setIsScanning] = useState<boolean>(false);


    const tabs = [
        {
          name: 'Home',
          activeIcon: <Icon name="home" color="#fff" size={25} />,
          inactiveIcon: <Icon name="home" color="#4d4d4d" size={25} />
        },
        {
          name: 'list',
          activeIcon: <Icon name="bar-chart-outline" color="#fff" size={25} />,
          inactiveIcon: <Icon name="bar-chart-outline" color="#4d4d4d" size={25} />
        },
        {
          name: 'camera',
          activeIcon: <Icon name="camera" color="#fff" size={25} />,
          inactiveIcon: <Icon name="camera" color="#4d4d4d" size={25} />
        },
        {
          name: 'Notification',
          activeIcon: <Icon name="notifications-outline" color="#fff" size={25} />,
          inactiveIcon: <Icon name="notifications-outline" color="#4d4d4d" size={25} />
        },
        {
          name: 'Profile',
          activeIcon: <Icon name="person-outline" color="#fff" size={25} />,
          inactiveIcon: <Icon name="person-outline" color="#4d4d4d" size={25} />
        },
      
      ];

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


    
    const onClickButton = () => {
        if (type === 'up') {
            setType('down');
            alert('Change type curve down');
        } else {
            setType('up');
            alert('Change type curve up');
        }
    }

    useEffect(() => {
        console.log('---');
        console.log('-----------------');
        
        navigation.setOptions({
            headerRight: () => (
             <View style={{flexDirection:'row'}} >
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
            <StatusBar style="auto" backgroundColor="red"  />

                <FlatList
                    data={devices}
                    renderItem={({ item }) =>
                        <View style={[styles.listRow, styles.container, {flex:1}]} key={item.id}>
                            <Text style={[{flex:1}, styles.label]}>{item.name}</Text>
                            <TouchableOpacity style={[{flex:2}, styles.submitButton]} onPress={() => connect(item)}><Text style={styles.submitButtonText}> CONNECT </Text></TouchableOpacity>
                        </View>
                    } />

                <ActivityIndicator style={styles.loadingIndicator} size="large" color="#ffffff" animating={isScanning} />
 
         <Tabbar
            tabs={tabs}
            tabBarContainerBackground='#6699ff'
            tabBarBackground='#fff'
            activeTabBackground='#6699ff'
            labelStyle={{ color: '#4d4d4d', fontWeight: '600', fontSize: 11 }}
            onTabChange={() => console.log('Tab changed')}
        />   
        </View>
    );
}


