import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';


import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { RemoteDeviceState } from "../models/blemodels/state";
import { IOValues } from "../models/blemodels/iovalues";

export const TempSensorPage = ({ props, navigation, route }) => {
    console.log('Top Level Method Called Here.');

    let [pageInitialized, setPageInitialized] = useState<boolean>();

    let [deviceAddress, setDeviceAddress] = useState<string>();

    let [item, setItem] = useState();
    //let [timerId, setTimerId] = useState<any | undefined>();

    const getDeviceProperties = async () => {
        
        let result1 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
        if(result1){
            let state = new RemoteDeviceState(result1);
            console.log('WiFi Connected: ' + state.wifiConnected);
        }

        result1 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
        if(result1){
            let ioValues = new IOValues(result1);
            console.log('Temperature => ' + ioValues.ioValues[0]);
            console.log('Humidity => ' + ioValues.ioValues[1]);
        }
    
        console.log('-------');
        for(let idx = 1; idx <= 8; ++idx){
            console.log(idx);
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=adc${idx}`);
            result1 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log(result1);
       
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=io${idx}`);
            result1 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log(result1);
        }
        
        console.log('-------');
    }

    const [portName, setPortName] = useState('');
    const [analogDeviceType, setAnalogDeviceType] = useState('');

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);
    const [items, setItems] = useState([
      {label: 'Apple', value: 'apple'},
      {label: 'Banana', value: 'banana'}
    ]);

    const data = [
        { label: 'No digital sensors', value: 'none' },
        { label: 'Temperature and Humidity', value: 'th' },
        { label: '1 External Temperature', value: '1et' },
        { label: '2 External Temperature', value: '2et' },
    ];

    const writeChar = async () => {
        if (await ble.connectById(deviceAddress!)) {
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioview=adc1');
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioconfig=adc1,Main Temperature,2,5.5,2.8,3.5');
            let result1 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log('ioconfig => ' + result1);
        

            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioview=adc2');
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioconfig=adc2,Secondary Temperature, 3, 5.5, 2.1,3.7');
            let result2 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log('ioconfig => ' + result2);
        }
    }

    const readConfig = async () => {
        if (await ble.connectById(deviceAddress!)) {
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, 'setioview=adc1');
            let str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log(str);
        }

    }

    const getData = async () => {
        if (await ble.connectById(deviceAddress!)) {
            let str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            console.log('state=> ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            console.log('sysconfog=> ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log('ioconfig => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_ADC_IOCONFIG);
            console.log('adcconfig => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE );
            console.log('iovaluec => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_ADC_VALUE );
            console.log('adcvalueconfig => ' + str);
            str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_RELAY );
            console.log('uuid relay => ' + str);
                                
            console.log('requested data from device');
            await ble.disconnectById(deviceAddress!);
        }
        else {
            console.log('could not connect.');
        }
    }

    const showIt = async() => {
        console.log('hi');
    }

    useEffect(() => {
        console.log('ef');
        setDeviceAddress(route.params.id);
        //getDeviceProperties();

        let timerId = window.setInterval(getDeviceProperties, 8000);

        navigation.addListener('willFocus', (payload: any)=> {console.log('will focus', payload)});
        navigation.addListener('didFocus', (payload: any)=> {console.log('did focus', payload)});

        navigation.addListener('willBlur', (payload: any)=> {console.log('will blur', payload)});
        navigation.addListener('didBlur', (payload: any)=> {console.log('did blur', payload)});

        console.log('setup all subs');

        console.log("starting sensor page with address " + deviceAddress);

        return (() => {
            clearInterval(timerId);
            console.log('Leaving sensors page.');
            ble.unsubscribe();
            console.log(timerId);
        })
    });

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            

            <Text style={styles.label}>Port Name:</Text>
            <TextInput style={styles.inputStyle} placeholder="enter name for port" onChangeText={e => setPortName(e)}/> 

            <TouchableOpacity style={styles.submitButton} onPress={() => readConfig()}>
                <Text style={styles.submitButtonText}> Read </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.submitButton} onPress={() => writeChar()}>
                <Text style={styles.submitButtonText}> Write it </Text>
            </TouchableOpacity>

        </View>
    );
}