import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import { IReactPageServices } from "../services/react-page-services";

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'

export const BlePropertiesPage = ({ props, navigation, route } : IReactPageServices) => {
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

    
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
    

        </View>
    );
}