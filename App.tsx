import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from './pages/auth.page';
import SplashPage from './pages/splash.page';
import HomePage from './pages/home.page';
import { ConnectivityPage } from './pages/connectivity.page';
import { BlePropertiesPage } from './pages/bleproperties.page';
import { SensorsPage } from './pages/sensors.page';
import { DevicePage} from './pages/device.page';
import { TempSensorPage } from './pages/tempSensor.page';
import ProvisionPage from './pages/provision.page';
import { ConfigureDevicePage } from './pages/configureDevice.page';
import ScanPage from './pages/scan.page';
import AccountPage from './pages/account.page';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="splashPage" component={SplashPage} options={{ title: 'Welcome' }} />
        <Stack.Screen name="authPage" component={Auth} options={{ title: 'Please Login' }} />
        <Stack.Screen name="provisionPage" component={ProvisionPage} options={{ title: 'Provision' }} />
        <Stack.Screen name="configureDevice" component={ConfigureDevicePage} options={{ title: 'Configure Device' }} />
        <Stack.Screen name="homePage" component={HomePage} options={{ title: 'Home Page' }} />
        <Stack.Screen name="accountPage" component={AccountPage} options={{ title: 'My Account Page' }} />
        <Stack.Screen name="scanPage" component={ScanPage} options={{ title: 'Scan Page' }} />
        <Stack.Screen name="devicePage" component={DevicePage} options={{ title: 'Device' }} />
        <Stack.Screen name="sensorsPage" component={SensorsPage} options={{ title: 'Sensors' }} />
        <Stack.Screen name="settingsPage" component={ConnectivityPage} options={{ title: 'Settings' }} />
        <Stack.Screen name="tempSensorsPage" component={TempSensorPage } options={{ title: 'Sensors' }} />
        <Stack.Screen name="blePropertiesPage" component={BlePropertiesPage} options={{ title: 'Device Properexpoties Page' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
