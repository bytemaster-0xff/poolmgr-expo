import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';


import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

export const BlePropertiesPage = ({ props, navigation, route }) => {
    let [deviceAddress, setDeviceAddress] = useState<string>();

    let [item, setItem] = useState();

    const getDeviceProperties = async () => {
        console.log(deviceAddress);
        await ble.connectById(deviceAddress!);
        console.log('this came from effect');        
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
        { label: 'Analog Port 1', value: 'adc1' },
        { label: 'Analog Port 2', value: 'adc2' },
        { label: 'Analog Port 3', value: 'adc3' },
        { label: 'Analog Port 4', value: 'adc4' },
        { label: 'Analog Port 5', value: 'adc5' },
        { label: 'Analog Port 6', value: 'adc6' },
        { label: 'Analog Port 7', value: 'adc7' },
        { label: 'Analog Port 8', value: 'adc8' },
        { label: 'Digital Port 1', value: 'io1' },
        { label: 'Digital Port 2', value: 'io2' },
        { label: 'Digital Port 3', value: 'io3' },
        { label: 'Digital Port 4', value: 'io4' },
        { label: 'Digital Port 5', value: 'io5' },
        { label: 'Digital Port 6', value: 'io6' },
        { label: 'Digital Port 7', value: 'io7' },
        { label: 'Digital Port 8', value: 'io8' },
        { label: 'Relay 1', value: 'rly1' },
        { label: 'Relay 2', value: 'rly2' },
        { label: 'Relay 3', value: 'rly3' },
        { label: 'Relay 4', value: 'rly4' },
        { label: 'Relay 5', value: 'rly5' },
        { label: 'Relay 6', value: 'rly6' },
        { label: 'Relay 7', value: 'rly7' },
        { label: 'Relay 8', value: 'rly8' },
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

    useEffect(() => {
        setDeviceAddress(route.params.id);
        getDeviceProperties();
    });

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <DropDownPicker
                  open={open}
                  value={value}
                  items={data}
                  setOpen={setOpen}
                  setValue={setValue}
                  setItems={setItems}
            /> 

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