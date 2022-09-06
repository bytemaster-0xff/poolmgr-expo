import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import Icon from "react-native-vector-icons/Ionicons";
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";
import { Picker } from '@react-native-picker/picker';


import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";

export const SensorsPage = ({ props, navigation, route }: IReactPageServices) => {
    let peripheralId = route.params.id;

    const [deviceAddress, setDeviceAddress] = useState<string>();
    const [initialCall, setInitialCall] = useState<boolean>(false);

    const getDeviceProperties = async (peripheralId: string) => {
        console.log(peripheralId);
        await ble.connectById(peripheralId);
        await ble.subscribe(ble);
        ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_STATE);
        ble.listenForNotifications(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_IO_VALUE);
        console.log('this came from effect');
        ble.emitter.addListener('receive', (value) => {
            console.log(value);
        });
    }

    const [portName, setPortName] = useState('');

    const [scaler, setScaler] = useState<string>("0");
    const [calibration, setCalibration] = useState<string>('0');
    const [zero, setZero] = useState("0");

    const [digitalDeviceType, setDigitalDeviceType] = useState('0');
    const [analogDeviceType, setAnalogDeviceType] = useState('0');

    const [hasAnyPort, setHasAnyPort] = useState(false);
    const [isAdcPortSelected, setIsAdcPortSelected] = useState(false);
    const [isDigitalPortSelected, setIsDigitalPortSelected] = useState(false);

    const [value, setValue] = useState('');
    const [handler, setHandler] = useState<string|undefined>(undefined)


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
        { label: 'ADC', value: '1' },
        { label: 'CT', value: '2' },
        { label: 'Switch', value: '3' },
    ]

    const writeChar = async () => {
        if (await ble.connectById(deviceAddress!)) {
            console.log(value);
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=${value}`);
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioconfig=${value},${portName},1,${scaler},${calibration},${zero}')`);
            let result1 = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            console.log('ioconfig => ' + result1);
        }
    }

    const readConfig = async (port: string) => {
        if (await ble.connectById(deviceAddress!)) {
            await ble.writeCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG, `setioview=${port}`);
            let str = await ble.getCharacteristic(deviceAddress!, SVC_UUID_NUVIOT, CHAR_UUID_IOCONFIG);
            if (str) {
                let parts = str.split(',');
                if (parts.length > 5) {
                    setPortName(parts[1]);
                    setAnalogDeviceType(parts[2]);
                    setScaler(parts[3]);
                    setCalibration(parts[4]);
                    setZero(parts[5]);
                }

                console.log('this is adc1');
                console.log(str);
                console.log(parts);
            }
        }
    }

    const portChanged = async (port: string) => {        
        setValue(port);
        
        setIsAdcPortSelected(port.startsWith('adc'));
        setIsDigitalPortSelected(port.startsWith('io'));
        setHasAnyPort(port != '-1');
        if(port != '-1') {
            readConfig(port);
        }
    }

    const resetConfig = () => {
        setPortName(value);
        setAnalogDeviceType('0');
        setScaler('1');
        setZero('0');
        setCalibration('1');
    }

    const restartDevice = async() => {
        if (await ble.connectById(peripheralId)) {
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `reboot=1`);
            await ble.disconnectById(peripheralId);
        }
        else {
            console.warn('could not connect');
        }
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
              <View style={{ flexDirection: 'row' }} >
              <Icon.Button  backgroundColor="transparent"   underlayColor="transparent" color="navy" onPress={() => setHandler('save')} name='save' />
          </View>),
          });        
      }, []);


    useEffect(() => {
        switch(handler) {
            case 'save': writeChar(); 
            setHandler(undefined);
            break;
        }        

        return (() => {
            console.log('Leaving sensors page.');
            ble.emitter.removeAllListeners('receive');
            ble.unsubscribe();
        })
    }, [handler]);

    if (!initialCall) {
        setDeviceAddress(peripheralId);
        console.log('>>>>initial setup<<<< -> ' + peripheralId);
        setInitialCall(true);

        if (peripheralId) {
            getDeviceProperties(peripheralId);
        }
    }

    return (
        <View style={styles.scrollContainer}>
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
    );
}