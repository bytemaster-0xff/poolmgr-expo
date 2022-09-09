import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

import services from '../services/app-services';

import styles from '../styles';
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import { IReactPageServices } from "../services/react-page-services";
import { RemoteDeviceState } from "../models/blemodels/state";
import { SysConfig } from "../models/blemodels/sysconfig";

export const DevicePage = ({ props, navigation, route } : IReactPageServices) => {    
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [deviceDetail, setDeviceDetail] = useState<Devices.DeviceDetail | undefined>();
    const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
    const [handler, setHandler] = useState<string|undefined>(undefined)

    const [sysConfig, setSysConfig] = useState<SysConfig>();
    const peripheralId = route.params.id;

    

    const loadDevice = async () => {
        console.log('loading sys config.');
        if (await ble.connectById(peripheralId, CHAR_UUID_SYS_CONFIG)) {
            let sysConfigStr = await ble.getCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG);
            if (sysConfigStr) {
                let sysConfig = new SysConfig(sysConfigStr);
                console.log(sysConfigStr);
                console.log('ORGID -> ' + sysConfig?.orgId);
                console.log('REPOID -> ' + sysConfig?.repoId);
                console.log('ID -> ' + sysConfig?.id);
                setSysConfig(sysConfig);

                let device = await services.deviceServices.getDevice(sysConfig.repoId, sysConfig.id);
                setDeviceDetail(device);
                console.log(device);
            }
        
            await ble.disconnectById(peripheralId);
        }
    }

    if (initialCall) {
        let peripheralId = route.params.id;        
        
        loadDevice();

        setInitialCall(false);
     
        if (peripheralId) {
            console.log(this);
        }
    }

    useEffect(() => {
        switch(handler) {
            case 'configure': navigation.navigate('configureDevice', { id: peripheralId });
            setHandler(undefined);
            break;
        }        
    }, [handler]);

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
              <View style={{ flexDirection: 'row' }} >
              <Icon.Button  backgroundColor="transparent"   underlayColor="transparent" color="navy" onPress={() => setHandler('configure')} name='cog-outline' />
          </View>),
          });        
      });

    return (
        <View style={styles.scrollContainer}>
            <StatusBar style="auto" />
                <View>

                </View>
        </View>
    );

}