import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Text, TextInput } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';


import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { RemoteDeviceState } from "../models/blemodels/state";
import { IOValues } from "../models/blemodels/iovalues";
import { IOConfig } from "../models/blemodels/ioconfig";

export const TempSensorPage = ({ props, navigation, route }) => {
    
    let [pageInitialized, setPageInitialized] = useState<boolean>();

    let [adcPorts, setADCPorts] = useState<IOConfig[]>([]);
    let [ioPorts, setIOPorts] = useState<IOConfig[]>([]);
    let [ioValues, setIOValues] = useState<IOValues | undefined>();
    let [isConnected, setIsConnected] = useState<boolean>(false);


    const getDeviceProperties = async (peripheralId: string) => {
        try {
            console.log('Device Address', peripheralId)
            await ble.connectById(peripheralId);
            setIsConnected(true);
            let result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
            if (result1) {
                let state = new RemoteDeviceState(result1);
                console.log('WiFi Connected: ' + state.wifiStatus);
            }

            result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
            if (result1) {
                let ioValues = new IOValues(result1);
                console.log('Temperature => ' + ioValues.ioValues[0]);
                console.log('Humidity => ' + ioValues.ioValues[1]);
                setIOValues(ioValues);
            }

            if (adcPorts.length == 0) {
                console.log('-------');

                for (let idx = 1; idx <= 8; ++idx) {
                    console.log(idx);
                    await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=adc${idx}`);
                    result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
                    if (result1) {
                        console.log(result1);
                        adcPorts.push(new IOConfig(result1))
                    }

                    await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=io${idx}`);
                    result1 = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
                    if (result1) {
                        console.log(result1);
                        ioPorts.push(new IOConfig(result1));
                    }
                }

                setADCPorts(adcPorts);
                setIOPorts(ioPorts);

                console.log('-------');
            }

            ble.disconnectById(peripheralId);
        }
        catch (ex: any) {
            setIsConnected(false);
        }

        console.log('is connected', isConnected);
    }



    useEffect(() => {
        console.log("starting sensor page with address " + route.params.id);

        let timerId = window.setInterval(()=>getDeviceProperties(route.params.id), 8000);

        return (() => {
            clearInterval(timerId);
            console.log('Leaving sensors page.');
            console.log(timerId);
        })
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            {ioValues &&
                <View>
                    <Text style={styles.label}>Is Connected: {isConnected ? 'true' : 'false' }</Text>
                    <Text style={styles.label}>Temperature: {ioValues.ioValues[0]}</Text>
                    <Text style={styles.label}>Humidity: {ioValues.ioValues[1]}</Text>
                </View>
            }
        </View>
    );
}