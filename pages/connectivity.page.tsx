import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, ScrollView, Text, TextInput , Switch, TouchableOpacity} from "react-native";

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { SysConfig } from "../models/blemodels/sysconfig";
import Icon from "react-native-vector-icons/Ionicons";
import { RemoteDeviceState } from "../models/blemodels/state";
import { IReactPageServices } from "../services/react-page-services";


export const ConnectivityPage = ({ props, navigation, route }: IReactPageServices) => {
    console.log('METHOD FUNCTION CALLED.');

    const peripheralId = route.params.id;

    console.log(route.params.id);

    const [initialCall, setInitialCall] = useState<boolean>(false);

    const [deviceId, setDeviceId] = useState<string>();
    const [serverUrl, setServerUrl] = useState<string>();
    const [port, setPort] = useState<string>();


    const [wifiSSID, setWiFiSSID] = useState<string>();
    const [wifiPWD, setWiFiPWD] = useState<string>();
    const [commissioned, setCommissioned] = useState<boolean>(false);
    const [useWiFi, setUseWIFi] = useState<boolean>(true);
    const [useCellular, setUseCellular] = useState<boolean>(false);
    const [viewReady, setViewReady] = useState<boolean>(false);
    const [handler, setHandler] = useState<string|undefined>(undefined)
   
    const writeChar =  async () => {
        if(!peripheralId){
            console.error('PeripheralId not set, can not write.');
            return;
        }

        if (await ble.connectById(peripheralId)) {
            console.log('Device Id', deviceId);
            if (deviceId) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `deviceid=${deviceId}`);
            if (serverUrl) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${serverUrl}`);
            if (wifiSSID) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${wifiSSID}`);
            if (wifiPWD) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPWD}`);
            if (port) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${port}`);

            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=' + (useWiFi ? '1' : '0'));
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=' + (useCellular ? '1' : '0'));
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0'));
            await ble.disconnectById(peripheralId);
          
            await getData();
        }
        else {
            console.warn('could not connect');
        }
    };

    const getData = async () => {
   
        if (await ble.connectById(peripheralId)) {
            let deviceStateCSV = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            console.log(deviceStateCSV);
            
            let deviceState = new RemoteDeviceState(deviceStateCSV!);        

            let deviceConfig = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
          
            let sysconfig = new SysConfig(deviceConfig!);
            setDeviceId(sysconfig.deviceId);
            setServerUrl(sysconfig.srvrHostName);
            setCommissioned(sysconfig.commissioned);
            setUseCellular(sysconfig.cellEnabled);
            setUseWIFi(sysconfig.wifiEnabled);
            setWiFiSSID(sysconfig.wifiSSID);
            setPort(sysconfig.port.toString());
           
            console.log('sysconfig=> ' + deviceConfig);
          
            await ble.disconnectById(peripheralId);
            setViewReady(true);
        }
        else {
            console.warn('could not connect.');
        }
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
              <View style={{ flexDirection: 'row' }} >
              <Icon.Button  backgroundColor="transparent"   underlayColor="transparent" color="navy" onPress={() => setHandler('save')} name='save' />
          </View>),
          });        
      }, [navigation, viewReady, deviceId]);


    useEffect(() => {
        console.log('USE eFFECT CALLED Getting connectivity settings for:', peripheralId);
        
        switch(handler) {
            case 'save': writeChar(); 
            setHandler(undefined);
            break;
        }

        return (() => {
            console.log('shutting down...');
        });
    }, [handler]);

    if(!initialCall){
        console.log('>>>>initial setup<<<<');
        setInitialCall(true);

        if (peripheralId) {
            getData();
        }
    }

    return (
        <ScrollView style={styles.scrollContainer}>
            <StatusBar style="auto" />

            <Text style={styles.label}>Device Id:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter device id" value={deviceId} onChangeText={e => {setDeviceId(e); console.log(deviceId)}} />

            <Text style={styles.label}>Server Host Name:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter server url" value={serverUrl} onChangeText={e => setServerUrl(e)} />

            <Text style={styles.label}>Server Port Number:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter port number" value={port} onChangeText={e => setPort(e)} />

            <Text style={styles.label}>WiFi SSID:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi ssid" value={wifiSSID} onChangeText={e => setWiFiSSID(e)} />

            <Text style={styles.label}>WiFi PWD:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter wifi password" value={wifiPWD} onChangeText={e => setWiFiPWD(e)} />

            <Text style={styles.label}>Commissioned:</Text>
            <Switch  onValueChange = {e => setCommissioned(e)} value = {commissioned}/>

            <Text style={styles.label}>Use WiFi:</Text>
            <Switch  onValueChange = {e => setUseWIFi(e)} value = {useWiFi}/>

            <Text style={styles.label}>Use Cellular:</Text>
            <Switch  onValueChange = {e => setUseCellular(e)} value = {useCellular}/>
       </ScrollView>
    );
}