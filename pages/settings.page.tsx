import React, { Component,  useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { View, ScrollView, Text, TextInput , Switch, TouchableOpacity} from "react-native";
import styles from '../styles';
import { Route } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";

export class SettingsPage<P> extends Component  {

    state : {
        periperalId: string;
        deviceId: string;
        serverUrl: string;
        port: string;
        wifiSSID: string;
        wifiPWD: string;
        commissioned: boolean;
        useWiFi: boolean;
        useCellular: boolean;
    }

    constructor(props: Props, navigation,private route) {
        console.log('construcotr start');
        console.log(props);
        super(props);
        this.state = {
            deviceId: '',
            serverUrl: '',
            port:'80',
            wifiSSID: '',
            wifiPWD: '',
            commissioned: false,
            useWiFi: false,
            useCellular: false,
        }

        this.props.navigation.setOptions({
            headerRight: () => (
                <View style={{ flexDirection: 'row' }} >
                    <Icon.Button  backgroundColor="transparent"  underlayColor="transparent" color="navy" onPress={() => this.writeChar()} name='save' />
                </View>
            ),
        });
    
    }


    componentDidMount() {
        console.log('component will mount');

        this.setState(['periperalId'], this.props.route.params.id);

        console.log(this.props.route.params.id);

     //   let peripheralId = this.route.params.id;
        //console.log(peripheralId);
    }
    

    /*const [wifiSSID, setWiFiSSID] = useState<string | undefined>();
    const [wifiPWD, setWiFiPWD] = useState<string>();
    const [commissioned, setCommissioned] = useState<boolean>(false);
    const [useWiFi, setUseWIFi] = useState<boolean>(true);
    const [useCellular, setUseCellular] = useState<boolean>(false);

    const [deviceAddress, setDeviceAddress] = useState<string>();

    const [deviceId, setDeviceId] = useState<string>();
    const [serverUrl, setServerUrl] = useState<string>();
    const [port, setPort] = useState<string>();

    const [device, setDevice] = useState<Devices.DeviceDetail | undefined>();*/


handleInputChange(value: string, name: string) {    

    this.setState({
        [name]: value
    })
}


    writeChar() {
        console.log(this.state.deviceId);
    };

    render() {
        return (
        <ScrollView style={styles.scrollContainer}>
        <StatusBar style="auto" />

        <Text style={styles.label}>Device Id:</Text>
        <TextInput style={styles.inputStyle} placeholder="enter device id"  value={this.state.deviceId} onChangeText={e => this.handleInputChange(e, 'deviceId')}   />


        <TouchableOpacity style={[styles.submitButton]} onPress={() => this.writeChar()}>
           <Text style={[styles.submitButtonText, { color: 'white' }]}> Update Devices </Text>
        </TouchableOpacity>

    </ScrollView>    
        )
}
}