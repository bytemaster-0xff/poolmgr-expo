import { Text, PermissionsAndroid, Platform, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Button, Pressable, BackHandler, Alert, } from 'react-native';
import { IReactPageServices } from '../services/react-page-services';

import styles from '../styles';

export default function AccountPage({ navigation }: IReactPageServices) {
    return (
        <View style={[styles.container, { backgroundColor: 'white' }]}>            
            <Text>Account</Text>
        </View>
    );
}