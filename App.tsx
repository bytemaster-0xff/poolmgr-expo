import React, { useState, useEffect} from "react";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text,  NativeModules, NativeEventEmitter, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity } from 'react-native';
import BleManager from './services/BleManager'
const BleManagerModule = NativeModules.BleManager;

const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function App() {
  const [ email, setEmail] = useState('');
  const [ password, setPassword ] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const peripherals = new Map();
  const [list, setList] = useState([]);

  const startScan = () => {
    if (!isScanning) {
      console.log('Going to start scanning');
      BleManager.scan([], 3, true).then((results) => {
        console.log('Scanning...');
        setIsScanning(true);
      }).catch(err => {
        console.error(err);
      });
    }    
  }

  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  }

  const handleDisconnectedPeripheral = (data:any) => {
    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
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
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        //setList(Array.from(peripherals.values()));
      }
    });
  }

  const handleDiscoverPeripheral = (peripheral: any) => {
    console.log('Got ble peripheral', peripheral);
    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }
    peripherals.set(peripheral.id, peripheral);
   // setList(Array.from(peripherals.values()));
  }
  
  const  login = (email: string, password: string) => {
    console.log('login called.');
    console.log(email, password);
  }
  
  useEffect(() => {
    console.log("USE EFFECT.");

    BleManager.start({showAlert: false})
    .then(() => {
      console.log('pass');
    })
    .catch((err: any) => {
        console.log('we got error: ', err);
      }
     )
    console.log("BLE MANAGER - STARTED NOW");
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
    bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan );
    bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
    bleManagerEmitter.addListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );
    console.log("BOUDN EVENTS - STARTED NOW.");

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
      console.log('unmount');
    //  bleManagerEmitter.removeListener('BleManagerDiscoverPeripheral', handleDiscoverPeripheral);
     // bleManagerEmitter.removeListener('BleManagerStopScan', handleStopScan );
     // bleManagerEmitter.removeListener('BleManagerDisconnectPeripheral', handleDisconnectedPeripheral );
     // bleManagerEmitter.removeListener('BleManagerDidUpdateValueForCharacteristic', handleUpdateValueForCharacteristic );
    })
  }, []);
  return (
    <View style={styles.container}>
      <View style={styles.formGroup}>
        <Text style={styles.label} >Email Address:</Text>
        
        <TextInput style={styles.inputStyle} placeholder="enter email" onChangeText={ e => setEmail(e) }></TextInput>
        <Text style={styles.label}>Password:</Text>
        <TextInput style={styles.inputStyle} placeholder="enter pwd"   onChangeText={ e => setPassword(e) }> </TextInput>
        
        <StatusBar style="auto" />


        <TouchableOpacity style={styles.submitButton} onPress={() => startScan() }><Text style={styles.submitButtonText}> Scan </Text></TouchableOpacity>
        <TouchableOpacity style={styles.submitButton} onPress={() => login(email, password) }><Text style={styles.submitButtonText}> Submit </Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
    alignItems:'flex-start',
    justifyContent: 'center',
  },
  formGroup: {
    margin:20
  },
  inputStyle:{
    backgroundColor:'white',
    width:300
  },
  label: {
    color:'white'
  },
  submitButton: {
    backgroundColor: "green",
    padding: 11,
    margin: 16,
    height: 42,
    width: 120,
    alignItems:'center'
    },
  submitButtonText: {
    color: "white"
    }
});
