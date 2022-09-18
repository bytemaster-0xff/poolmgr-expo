import React, { useEffect, useState } from "react";

import { IReactPageServices } from "../services/react-page-services";
import { TouchableOpacity, ScrollView, View, Text, TextInput, FlatList, ActivityIndicator, Pressable, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { StatusBar } from 'expo-status-bar';

import AppServices from '../services/app-services';

import styles from '../styles';
export const ChangeOrgPage = ({ props, navigation, route }: IReactPageServices) => {

    const [initialCall, setInitialCall] = useState<boolean>(true);
    const [orgs, setOrgs] = useState<Users.OrgUser[]>();
    const [user, setUser] = useState<Users.AppUser>();
    const [isBusy, setIsBusy] = useState<boolean>(true);
    const [appServices, setAppServices] = useState<AppServices>(new AppServices());
    const colorScheme = "useColorScheme()"

    const loadUserOrgs = async () => {
        let orgs = await appServices.userServices.getOrgsForCurrentUser()
        setOrgs(orgs.model);
        let user = await appServices.userServices.getUser();
        setUser(user);
    }

    useEffect(() => {
        if (initialCall) {
            appServices.networkCallStatusService.emitter.addListener('busy', (e) => { setIsBusy(true) })
            appServices.networkCallStatusService.emitter.addListener('idle', (e) => { setIsBusy(false) })
            setInitialCall(false);
            loadUserOrgs();
        }
    });

    const setNewUserOrg = async (org: Users.OrgUser) => {
        console.log('ChangeOrgPage__setNewUserOrg, Org=' + org.organizationName);
        let result = await appServices.userServices.changeOrganization(org.orgId);
        if (result) {
            appServices.userServices.refreshToken()
        }

        let user = await appServices.userServices.getUser();
        setUser(user);

        Alert.alert('Organization Changed', `Welcome to the ${user?.currentOrganization.text}!`)
    }

    const myItemSeparator = () => { return <View style={{ height: 1, backgroundColor: "#c0c0c0git ", marginHorizontal: 6 }} />; };

    const myListEmpty = () => {
        return (
            <View style={{ alignItems: "center" }}>
                <Text style={styles.item}> no data </Text>
            </View>
        );
    };

    return (
        isBusy ?
                <View style={styles.spinnerView}>                
                    <Text style={{fontSize: 25}}>Please Wait</Text>    
                    <ActivityIndicator size="large" color="#00ff00" animating={isBusy} />
                </View>
            :
            <View>
                {user &&
                    <Text>{user.currentOrganization.text}</Text>}
                {orgs &&
                    <FlatList
                        contentContainerStyle={{ alignItems: "stretch" }}
                        style={{ backgroundColor: 'white', width: "100%" }}
                        ItemSeparatorComponent={myItemSeparator}
                        ListEmptyComponent={myListEmpty}
                        data={orgs}
                        renderItem={({ item }) =>
                            <Pressable onPress={() => setNewUserOrg(item)} key={item.orgId} >
                                <View style={[styles.listRow, { padding: 10, height: 40, }]}  >
                                    <View style={{ flex: 4 }} key={item.orgId}>
                                        <Text style={[{ color: 'black', flex: 3 }]}>{item.organizationName}</Text>
                                    </View>
                                </View>
                            </Pressable>
                        }
                    />

                }
            </View>
    )
}

export default ChangeOrgPage;

