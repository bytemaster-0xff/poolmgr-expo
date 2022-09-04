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

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="splashPage" component={SplashPage} options={{ title: 'Welcome' }} />
        <Stack.Screen name="authPage" component={Auth} options={{ title: 'Please Login' }} />
        <Stack.Screen name="homePage" component={HomePage} options={{ title: 'Home Page' }} />
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
