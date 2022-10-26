import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";
import { Picker } from '@react-native-picker/picker';

import services from '../services/app-services';

import styles from '../styles';
import { ble,  CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { IOValues } from "../models/blemodels/iovalues";

const IDLE = 0;
const CONNECTING = 1;
const CONNECTED = 2;
const DISCONNECTED = 3;
const DISCONNECTED_PAGE_SUSPENDED = 4;


export const SensorsPage = ({ props, navigation, route }: IReactPageServices) => {
    let peripheralId = route.params.id;

    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [connectionState, setConnectionState] = useState<number>(IDLE);

    const [portName, setPortName] = useState('');

    const [scaler, setScaler] = useState<string>("0");
    const [calibration, setCalibration] = useState<string>('0');
    const [zero, setZero] = useState("0");

    const [digitalDeviceType, setDigitalDeviceType] = useState('0');
    const [analogDeviceType, setAnalogDeviceType] = useState('0');

    const [hasAnyPort, setHasAnyPort] = useState(false);
    const [isAdcPortSelected, setIsAdcPortSelected] = useState(false);
    const [isDigitalPortSelected, setIsDigitalPortSelected] = useState(false);

    const [ioValues, setIOValues] = useState<IOValues | undefined>(undefined);

    const [value, setValue] = useState('');


    const ports = [
        { label: '-select port-', value: '-1' },
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

    const adcPortType = [
        { label: 'None', value: '0' },
        { label: 'ADC', value: '1' },
        { label: 'CT', value: '2' },
        { label: 'Switch', value: '3' },
    ]

    const ioPortType = [
        { label: 'None', value: '0' },
        { label: 'Input', value: '1' },
        { label: 'Output', value: '2' },
        { label: 'Pulse Counter', value: '3' },
        { label: 'DS18B', value: '4' },
        { label: 'DHT11', value: '5' },
        { label: 'DHT22', value: '6' },
    ]

    function handler(value: any) {
        if (value.characteristic == CHAR_UUID_IO_VALUE) {
            let io = new IOValues(value.value);
            console.log(value.value);
            setIOValues(io);
        }
    }

    const disconnectHandler = (id: string) => {
        setConnectionState(DISCONNECTED);

        ble.removeAllListeners('receive');
        ble.removeAllListeners('disconnected');
        ble.unsubscribe();
    }

    const loadDevice = async () => {
        if(ble.simulatedBLE())
        {
            setConnectionState(CONNECTED);
            return;
        }
        setConnectionState(CONNECTING);

        if (await ble.connectById(peripheralId)) {
            setConnectionState(CONNECTED);
            await ble.subscribe(ble);
            ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
            ble.addListener('receive', handler);
            ble.addListener('disconnected', disconnectHandler);
        }
    }

    const writeChar = async () => {
        if (connectionState == CONNECTED) {
            console.log(value);
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=${value}`);
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioconfig=${value},${portName},1,${scaler},${calibration},${zero}')`);
            await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
        }
    }

    const readConfig = async (port: string) => {
        if (connectionState == CONNECTED) {
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=${port}`);
            let str = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            if (str) {
                let parts = str.split(',');
                if (parts.length > 5) {
                    setPortName(parts[1]);
                    setAnalogDeviceType(parts[2]);
                    setDigitalDeviceType(parts[2]);
                    setScaler(parts[3]);
                    setCalibration(parts[4]);
                    setZero(parts[5]);
                }
            }
        }
    }

    const portChanged = async (port: string) => {
        setValue(port);

        setIsAdcPortSelected(port.startsWith('adc'));
        setIsDigitalPortSelected(port.startsWith('io'));
        setHasAnyPort(port != '-1');
        if (port != '-1') {
            await readConfig(port);
        }
    }

    const resetConfig = () => {
        setPortName(value);
        setAnalogDeviceType('0');
        setScaler('1');
        setZero('0');
        setCalibration('1');
    }

    const restartDevice = async () => {
        if (connectionState == CONNECTED) {
            ble.unsubscribe();
            ble.removeAllListeners('receive');
            ble.removeAllListeners('disconnected');
            await ble.writeNoResponseCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `reboot=1`);
            await ble.disconnectById(peripheralId);
            setConnectionState(DISCONNECTED);
        }
    }

    useEffect(() => {
        if (initialCall) {
            setInitialCall(false);
            loadDevice();
        }

        navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }} >
                    <Icon.Button backgroundColor="transparent" underlayColor="transparent" color="navy" onPress={writeChar} name='save' />
                </View>),
        });

        const focusSubscription = navigation.addListener('focus', () => {
            if (connectionState == DISCONNECTED_PAGE_SUSPENDED) {
                loadDevice();
            }
        });

        const blurSubscription = navigation.addListener('beforeRemove', async () => {
            console.log('Leaving configure device page.');
            if (connectionState == CONNECTED) {
                ble.unsubscribe();
                ble.removeAllListeners('receive');
                ble.removeAllListeners('disconnected');
                await ble.disconnectById(peripheralId);
            }
        });

        return (() => {
            focusSubscription();
            blurSubscription();
        });
    });

    return (
        <ScrollView style={styles.scrollContainer}>
            {connectionState == CONNECTED &&
                <View >
                    <StatusBar style="auto" />
                    <Text style={styles.label}>Port:</Text>
                    <Picker selectedValue={value} onValueChange={portChanged} >
                        {ports.map(itm => <Picker.Item key={itm.value} label={itm.label} value={itm.value} />)}
                    </Picker>

                    {(isAdcPortSelected) &&
                        <View>
                            <Text style={styles.label}>ADC Type:</Text>
                            <Picker selectedValue={analogDeviceType} onValueChange={(value) => setAnalogDeviceType(value)} >
                                {adcPortType.map(itm => <Picker.Item key={itm.value} label={itm.label} value={itm.value} />)}
                            </Picker>
                        </View>
                    }

                    {(isDigitalPortSelected) &&
                        <View>
                            <Text style={styles.label}>Digitial Port Type:</Text>
                            <Picker selectedValue={digitalDeviceType} onValueChange={(value) => setDigitalDeviceType(value)} >
                                {ioPortType.map(itm => <Picker.Item key={itm.value} label={itm.label} value={itm.value} />)}
                            </Picker>
                        </View>
                    }

                    {(hasAnyPort) &&
                        <View>
                            <Text style={styles.label}>Port Name:</Text>
                            <TextInput style={styles.inputStyle} placeholder="name" value={portName} onChangeText={e => setPortName(e)} />
                            <TextInput style={styles.inputStyle} placeholder="scaler" value={scaler} onChangeText={e => setScaler(e)} />
                            <TextInput style={styles.inputStyle} placeholder="zero" value={zero} onChangeText={e => setZero(e)} />
                            <TextInput style={styles.inputStyle} placeholder="calibration" value={calibration} onChangeText={e => setCalibration(e)} />

                            <View style={{ flexDirection: "row" }}>
                                <TouchableOpacity style={styles.submitButton} onPress={() => resetConfig()}><Text style={styles.submitButtonText}> Reset </Text></TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={() => restartDevice()}><Text style={styles.submitButtonText}> Restart </Text></TouchableOpacity>
                            </View>
                        </View>
                    }
                </View>
            }
                {connectionState == CONNECTING && <Text>Connecting</Text>}
                {connectionState == DISCONNECTED && 
                    <View>
                        <Text>Disconnected</Text>
                        <TouchableOpacity style={[styles.submitButton]} onPress={() => loadDevice()}>
                            <Text style={[styles.submitButtonText, { color: 'white' }]}> Re-Connect </Text>
                        </TouchableOpacity>
                    </View>
                }
                {connectionState == IDLE && <Text>Please wait</Text>}
                {connectionState == DISCONNECTED_PAGE_SUSPENDED && <Text>Please Wait Reconnecting</Text>}
        </ScrollView>
    );
}