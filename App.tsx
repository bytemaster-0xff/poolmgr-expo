import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, NativeModules, NativeEventEmitter, EmitterSubscription, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import BleManager from './services/BleManager'
import { Peripheral } from 'react-native-ble-manager'

import styles from './styles';

const BleManagerModule = NativeModules.BleManager;

const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function App() {
  const [isScanning, setIsScanning] = useState(false);

  const discoveredPeripherals = new Map();
  const [peripherals, setPeripherals] = useState<Peripheral[]>([]);

  const startScan = async () => {
    if (!isScanning) {
      console.log('Going to start scanning');
      let result = await BleManager.scan([], 15, true);
      console.log('Scanning');
      setIsScanning(true);
    }
  }

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }

  const handleDisconnectedPeripheral = (data: any) => {
    let peripheral = peripherals.find(prf => prf.id === data.peripheral.id);
    if (peripheral) {
      //peripheral.connected = false;
      //peripherals.set(peripheral.id, peripheral);
      //setList(Array.from(peripherals.values()));
    }
    console.log('Disconnected from ' + data.peripheral);
  }

  const handleUpdateValueForCharacteristic = (data: any) => {
    console.log('Received data from ' + data.peripheral + ' characteristic ' + data.characteristic, data.value);
  }

  const retrieveConnected = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {
      if (results.length == 0) {
        console.log('No connected peripherals')
      }
      console.log(results);
      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        //peripheral.connected = true;
      }
    });
  }

  const connect = async (peripheral: Peripheral) => {
    let result = await BleManager.isPeripheralConnected(peripheral.id)
    console.log('Connect Click ' + peripheral.id);
    if (result) {
      console.log('already connected.');
    }
    else {
      console.log('Attempt to connect ' + peripheral.id);
      try {
        let connectResult = await BleManager.connect(peripheral.id)
        console.log('connect result', connectResult);
        let services = await BleManager.retrieveServices(peripheral.id);
        console.log(services);
      }
      catch (e) {
        console.log(e);
      }
    }
  }

  const handleDiscoverPeripheral = (peripheral: Peripheral) => {
    if (peripheral.name) {
      console.log('GOT DEVICE:', peripheral.name, peripheral.id);
      if (!peripherals.find(flt => flt.id === (peripheral.id))) {
        peripherals.push(peripheral);
        console.log('added');
        setPeripherals(peripherals);
      }
      else {
        console.log('alreadyhas');
      }
    }
  }

  useEffect(() => {
    let initialLoadTIme = new Date();

    console.log('---');
    console.log('-----------------');
    console.log("STARTING, LOAD TIME => ", initialLoadTIme);


    BleManager.start({ showAlert: false })
      .then(() => {
        console.log('pass');
      })
      .catch((err: any) => {
        console.log('we got error: ', err);
      }
      )

    let subs: EmitterSubscription[] = [];

    subs.push(bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral));
    subs.push(bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan));
    subs.push(bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral));
    subs.push(bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic));

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
      console.log('WE ARE UNLOADING', initialLoadTIme);
      for (let subscription of subs) {
        console.log('subscription');
        subscription.remove();
      }

      console.log('-----------------');
      console.log('---');
    })
  }, []);


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <View style={styles.formGroup}>

        <Text style={styles.label}>{isScanning ? 'true' : 'false'}</Text>

        <TouchableOpacity style={styles.submitButton} onPress={() => startScan()}><Text style={styles.submitButtonText}> Scan </Text></TouchableOpacity>
        <FlatList
          data={peripherals}
          renderItem={({ item }) =>
            <View style={styles.listRow}>
              <Text style={styles.label}>{item.name}</Text>
              <TouchableOpacity style={styles.submitButton} onPress={() => connect(item)}><Text style={styles.submitButtonText}> Connect </Text></TouchableOpacity>
            </View>
          } />
      </View>
    </View>
  );
}


