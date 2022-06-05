import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Auth from './pages/auth.page';
import ScanPage from './pages/scan.page';
import { BlePropertiesPage } from './pages/bleproperties.page';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="authPage" component={Auth} options={{ title: 'Welcome' }}/>
        <Stack.Screen name="scanPage" component={ScanPage} options={{ title: 'Device Scan Page' }}/>
        <Stack.Screen name="blePropertiesPage" component={BlePropertiesPage} options={{ title: 'Device Properties Page' }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
