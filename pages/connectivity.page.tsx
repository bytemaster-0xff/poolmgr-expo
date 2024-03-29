import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, ScrollView, Text, TextInput , Switch, TouchableOpacity, ActivityIndicator} from "react-native";

import styles from '../styles';
import { ble, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { SysConfig } from "../models/blemodels/sysconfig";
import Icon from "react-native-vector-icons/Ionicons";
import { RemoteDeviceState } from "../models/blemodels/state";
import { IReactPageServices } from "../services/react-page-services";


export const ConnectivityPage = ({ props, navigation, route }: IReactPageServices) => {
    const peripheralId = route.params.id;
    const [initialCall, setInitialCall] = useState<boolean>(true);

    const [deviceId, setDeviceId] = useState<string>();
    const [serverUrl, setServerUrl] = useState<string>();
    const [serverUid, setServerUid] = useState<string>();
    const [serverPwd, setServerPwd] = useState<string>();
    const [port, setPort] = useState<string>();
    const [isBusy, setIsBusy] = useState<boolean>(true);
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

        setIsBusy(true);

        if (await ble.connectById(peripheralId)) {
            console.log('Device Id', deviceId);
            if (deviceId) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `deviceid=${deviceId}`);
            if (serverUrl) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `host=${serverUrl}`);
            if (port) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `port=${port}`);
            if (serverUid) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `uid=${serverUid}`);
            if (serverPwd) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `pwd=${serverPwd}`);

            if (wifiSSID) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifissid=${wifiSSID}`);
            if (wifiPWD) await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `wifipwd=${wifiPWD}`);

            
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'wifi=' + (useWiFi ? '1' : '0'));
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'cell=' + (useCellular ? '1' : '0'));
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'commissioned=' + (commissioned ? '1' : '0'));
            await ble.disconnectById(peripheralId);
          
            await getData();
        }
        else {
            console.warn('could not connect');
        }

        setIsBusy(false);
    };

    const getData = async () => {
        setIsBusy(true);
        if (await ble.connectById(peripheralId)) {
            let deviceStateCSV = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            console.log(deviceStateCSV);
            
            let deviceState = new RemoteDeviceState(deviceStateCSV!);        

            let deviceConfig = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
          
            let sysconfig = new SysConfig(deviceConfig!);
            setDeviceId(sysconfig.deviceId);
            setServerUrl(sysconfig.serverHostName);
            setServerUid(sysconfig.serverUid);
            setServerPwd(sysconfig.serverPwd);
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
        setIsBusy(false);
    }

    useEffect(() => {
        switch(handler) {
            case 'save': writeChar(); 
                setHandler(undefined);
            break;
        }

        navigation.setOptions({
            headerRight: () => (
              <View style={{ flexDirection: 'row' }} >
              <Icon.Button  backgroundColor="transparent"   underlayColor="transparent" color="navy" onPress={() => setHandler('save')} name='save' />
          </View>),
          });        


        return (() => {
            console.log('shutting down...');
        });
    }, [handler]);

    if(initialCall){
        setInitialCall(false);

        if (peripheralId) {
            getData();
        }
    }

    return (
        isBusy ? 
        <View style={styles.spinnerView}>                
                <Text style={{fontSize: 25}}>Please Wait</Text>    
                <ActivityIndicator size="large" color="#00ff00" animating={isBusy} />
        </View>
        :
        <ScrollView style={styles.scrollContainer}>
            <Text style={styles.label}>Device Id:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter device id" value={deviceId} onChangeText={e => {setDeviceId(e); console.log(deviceId)}} />

            <Text style={styles.label}>Server Host Name:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter server url" value={serverUrl} onChangeText={e => setServerUrl(e)} />

            <Text style={styles.label}>Server User Id:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter server url" value={serverUid} onChangeText={e => setServerUid(e)} />

            <Text style={styles.label}>Server Host Password:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter server url" value={serverPwd} onChangeText={e => setServerPwd(e)} />

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