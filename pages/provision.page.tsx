import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { IReactPageServices } from "../services/react-page-services";
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";
import { RemoteDeviceState } from "../models/blemodels/state";
import { ble, CHAR_UUID_ADC_IOCONFIG, CHAR_UUID_ADC_VALUE, CHAR_UUID_IOCONFIG, CHAR_UUID_IO_VALUE, CHAR_UUID_RELAY, CHAR_UUID_STATE, CHAR_UUID_SYS_CONFIG, SVC_UUID_NUVIOT } from '../NuvIoTBLE'
import styles from '../styles';
import { Picker } from '@react-native-picker/picker';

import services from '../services/app-services';
import { SysConfig } from "../models/blemodels/sysconfig";
import { Device } from "react-native-ble-plx";
import { DevicesService } from "../services/devices.service";

export default function ProvisionPage({ navigation, route }: IReactPageServices) {
    const [remoteDeviceState, setRemoteDeviceState] = useState<RemoteDeviceState | undefined>(undefined);
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [repos, setRepos] = useState<Devices.DeviceRepoSummary[]>([]);
    const [deviceTypes, setDeviceTypes] = useState<Devices.DeviceTypeSummary[]>([])
    const [selectedRepo, setSelectedRepo] = useState<Devices.DeviceRepoSummary | undefined>();
    const [selectedDeviceType, setSelectedDeviceType] = useState<Devices.DeviceTypeSummary | undefined>();

    const [deviceId, setDeviceId] = useState<string>();
    const [deviceName, setDeviceName] = useState<string>();

    const [sysConfig, setSysConfig] = useState<SysConfig>();

    const peripheralId = route.params.id;

    const loadReposAsync = async () => {
        console.log('loading repos.');
        let repos = await services.deviceServices.loadDeviceRepositories();
        setRepos(repos);
        let deviceTypes = await services.deviceServices.getDeviceTypes();
        setDeviceTypes(deviceTypes);
    }

    const loadSysConfigAsync = async () => {
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
            }
            await ble.disconnectById(peripheralId);
        }
    }

    const factoryReset = async() => {
        if (await ble.connectById(peripheralId)) {
            await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, `factoryreset=1`);
            await ble.disconnectById(peripheralId);
        }
        else {
            console.warn('could not connect');
        }
    }

    const provisionDevice = async () => {
        let newDevice = await services.deviceServices.createDevice(selectedRepo!.id)

        newDevice.deviceType = { id: selectedDeviceType!.id, key: selectedDeviceType!.key, text: selectedDeviceType!.name };
        newDevice.deviceConfiguration = { id: selectedDeviceType!.defaultDeviceConfigId!, key: '', text: selectedDeviceType!.defaultDeviceConfigName! };
        newDevice.deviceId = deviceId!;
        newDevice.name = deviceName!;
        newDevice.macAddress = peripheralId;

        let result = await services.deviceServices.addDevice(newDevice);
        console.log(result);
        if (result.successful) {
            if (await ble.connectById(peripheralId)) {
                await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'deviceid=' + deviceId);
                await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'orgid=' + newDevice.ownerOrganization.id);
                await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'repoid=' + newDevice.deviceRepository.id);
                await ble.writeCharacteristic(peripheralId, SVC_UUID_NUVIOT, CHAR_UUID_SYS_CONFIG, 'id=' + newDevice.id);
                await ble.disconnectById(peripheralId);
            }
        }

    }

    const init = async () => {
        await loadReposAsync();
        await loadSysConfigAsync();
    }

    const deviceTypeChanged = async (id: string) => {
        setSelectedDeviceType(deviceTypes.find(dt => dt.id == id));
    }

    const repoChanged = async (id: string) => {
        setSelectedRepo(repos.find(rp => rp.id == id))
    }

    useEffect(() => {
        if (initialCall) {
            init();
            setInitialCall(false);
        }

        return (() => {
            console.log("--------------------------------");
            console.log("----------------");
            console.log('unsubscribe called.');
            ble.unsubscribe();
        });

    }, []);

    return (
        <View style={styles.scrollContainer}>
            <StatusBar style="auto" />
            <Text style={styles.label}>Repositories:</Text>
            <Picker selectedValue={selectedRepo?.id} onValueChange={repoChanged} >
                {repos.map(itm => <Picker.Item key={itm.id} label={itm.name} value={itm.id} />)}
            </Picker>

            <Text style={styles.label}>Device Types:</Text>
            <Picker selectedValue={selectedDeviceType?.id} onValueChange={deviceTypeChanged} >
                {deviceTypes.map(itm => <Picker.Item key={itm.id} label={itm.name} value={itm.id} />)}
            </Picker>

            <TextInput style={styles.inputStyle} placeholder="device name" value={deviceName} onChangeText={e => setDeviceName(e)} />
            <TextInput style={styles.inputStyle} placeholder="device id" value={deviceId} onChangeText={e => setDeviceId(e)} />

            <TouchableOpacity style={styles.submitButton} onPress={() => provisionDevice()}><Text style={styles.submitButtonText}> WRITE </Text></TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={() => factoryReset()}><Text style={styles.submitButtonText}> FACTORY RESET </Text></TouchableOpacity>

            <View>
                {remoteDeviceState &&
                    <View>
                        <Text> {remoteDeviceState.firmwareSku}</Text>
                        <Text> Commissioned {remoteDeviceState.commissioned ? 'Yes' : 'No'}</Text>
                        <Text> Cellular Connected {remoteDeviceState.cellularConnected ? 'Yes' : 'No'}</Text>
                        <Text> Cellular IP: {remoteDeviceState.cellularIPAddress}</Text>
                        <Text> WiFi Connected: {remoteDeviceState.wifiStatus}</Text>
                        <Text> WiFi IP: {remoteDeviceState.wifiIPAddress}</Text>
                        <Text >{remoteDeviceState.firmwareRevision}</Text>
                        <Text >{remoteDeviceState.hardwareRevision}</Text>
                        <Text >{remoteDeviceState.inputVoltage}</Text>
                    </View>
                }
            </View>
        </View>
    );
}