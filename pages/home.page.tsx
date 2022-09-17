import React, { useState, useEffect } from "react";
import { StatusBar } from 'expo-status-bar';
import { Text, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Button, Pressable, TurboModuleRegistry } from 'react-native';
import Tabbar from "@mindinventory/react-native-tab-bar-interaction";

import styles from '../styles';
import { IReactPageServices } from "../services/react-page-services";
import Icon from "react-native-vector-icons/Ionicons";


export default function HomePage({ navigation }: IReactPageServices) {
    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [currentTab, setCurrentTab] = useState<string>("home");

    const tabs = [
        {
            name: 'home',
            activeIcon: <Icon name="home" color="#fff" size={25} />,
            inactiveIcon: <Icon name="home" color="#4d4d4d" size={25} />
        },
        {
            name: 'list',
            activeIcon: <Icon name="bar-chart-outline" color="#fff" size={25} />,
            inactiveIcon: <Icon name="bar-chart-outline" color="#4d4d4d" size={25} />
        },
        {
            name: 'notification',
            activeIcon: <Icon name="notifications-outline" color="#fff" size={25} />,
            inactiveIcon: <Icon name="notifications-outline" color="#4d4d4d" size={25} />
        },
        {
            name: 'profile',
            activeIcon: <Icon name="person-outline" color="#fff" size={25} />,
            inactiveIcon: <Icon name="person-outline" color="#4d4d4d" size={25} />
        },

    ];

    useEffect(() => {
        if (initialCall) {

            navigation.setOptions({
                headerRight: () => (
                    <View style={{ flexDirection: 'row' }} >
                    </View>
                ),
            });

            setInitialCall(false);
        }

        return (() => {
        });
    }, []);

    const showScanPage = () => {
        navigation.navigate('scanPage');
    }

    const showPage = (pageName: string) => {
        navigation.navigate(pageName);
    }

    const reposPage = () => {
        return <View>
            <Text>repos</Text>
        </View>
    }

    const foundDevicesListTab = () => {
        return <View></View>
    }
    
    const notificationPage = () => {
        return <View></View>
    }
        
    const profilePage = () => {
        return <View>
                  <TouchableOpacity style={[styles.navRow]} onPress={() => showPage('changeOrgsPage')}>
                        <Text style={[styles.navRowText]}> Switch Organizations </Text>
                    </TouchableOpacity>
                </View>
    }

    const renderTabs = () => {
        if (currentTab === 'home') return reposPage()
        if (currentTab === 'list') return foundDevicesListTab()
        if (currentTab === 'notification') return notificationPage()
        if (currentTab === 'profile') return profilePage()
    }

    const tabChanged = (tab: any) => {
        setCurrentTab(tab.name);
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
              <View style={{ flexDirection: 'row' }} >
              <Icon.Button  backgroundColor="transparent"  underlayColor="transparent" color="navy" onPress={() => showScanPage()} name='search-outline' />
          </View>),
          });        
      });

    return (
        <View style={[styles.container, { backgroundColor: 'white' }]}>
            {renderTabs()}

            <Tabbar
                tabs={tabs}
                tabBarContainerBackground='#6699ff'
                tabBarBackground='#fff'
                activeTabBackground='#6699ff'
                labelStyle={{ color: '#4d4d4d', fontWeight: '600', fontSize: 10 }}
                onTabChange={(tab) => tabChanged(tab)}
            />

        </View>
    );
}

