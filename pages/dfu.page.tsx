import React, { useEffect, useState } from "react";

import { IReactPageServices } from "../services/react-page-services";
import { TouchableOpacity, ScrollView, View, Text, TextInput } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { StatusBar } from 'expo-status-bar';

import styles from '../styles';
export const  DfuPage = ({ props, navigation, route } : IReactPageServices) => {    
    return (
        <View style={styles.scrollContainer}>
            <StatusBar style="auto" />
            </View>
    )

}

export default DfuPage;