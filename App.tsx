import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from './pages/auth.page';
import SplashPage from './pages/splash.page';
import ScanPage from './pages/scan.page';
import HomePage from './pages/home.page';
import { ConnectivityPage } from './pages/connectivity.page';
import { BlePropertiesPage } from './pages/bleproperties.page';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="splashPage" component={SplashPage} options={{ title: 'Welcome' }}/>
        <Stack.Screen name="authPage" component={Auth} options={{ title: 'Please Login' }}/>
        <Stack.Screen name="homePage" component={HomePage} options={{ title: 'Home Page'}}/>
        <Stack.Screen name="settingsPage" component={ConnectivityPage} options={{ title: 'Device Connectivity'}}/>
        <Stack.Screen name="scanPage" component={ScanPage} options={{ title: 'Device Scan Page'}}/>
        <Stack.Screen name="blePropertiesPage" component={BlePropertiesPage} options={{ title: 'Device Properties Page' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
