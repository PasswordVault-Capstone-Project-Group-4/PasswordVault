import {
  NavigationContainer,
  type CompositeScreenProps,
  type NavigatorScreenParams,
} from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator, type NativeStackScreenProps } from '@react-navigation/native-stack';

import AddPasswordScreen from '../screens/AddPasswordScreen';
import EditPasswordScreen from '../screens/EditPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import PinLockScreen from '../screens/PinLockScreen';
import SettingsScreen from '../screens/SettingsScreen';
import SplashScreen from '../screens/SplashScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import CreatePinScreen from '../screens/CreatePinScreen';
import ConfirmPinScreen from '../screens/ConfirmPinScreen';
import ChangePinScreen from '../screens/ChangePinScreen';
import FloatingTabBar from '../components/FloatingTabBar';

export type TabParamList = {
  Home: undefined;
  Add: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Splash: { destination: StartupDestination };
  Welcome: undefined;
  CreatePin: undefined;
  ConfirmPin: { pin: string };
  ChangePin: undefined;
  MainTabs: NavigatorScreenParams<TabParamList> | undefined;
  EditPassword: { passwordId: string };
  PinLock: undefined;
};

export type StartupDestination = 'Welcome' | 'PinLock' | 'MainTabs';

export type AppNavigatorProps = {
  initialDestination: StartupDestination;
};

export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type AddPasswordScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Add'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type EditPasswordScreenProps = NativeStackScreenProps<RootStackParamList, 'EditPassword'>;
export type PinLockScreenProps = NativeStackScreenProps<RootStackParamList, 'PinLock'>;
export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
export type CreatePinScreenProps = NativeStackScreenProps<RootStackParamList, 'CreatePin'>;
export type ConfirmPinScreenProps = NativeStackScreenProps<RootStackParamList, 'ConfirmPin'>;
export type SettingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type ChangePinScreenProps = NativeStackScreenProps<RootStackParamList, 'ChangePin'>;

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tabs.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen component={HomeScreen} name="Home" />
      <Tabs.Screen component={AddPasswordScreen} name="Add" />
      <Tabs.Screen component={SettingsScreen} name="Settings" />
    </Tabs.Navigator>
  );
}

export default function AppNavigator({ initialDestination }: AppNavigatorProps) {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen
          component={SplashScreen}
          initialParams={{ destination: initialDestination }}
          name="Splash"
        />
        <Stack.Screen component={WelcomeScreen} name="Welcome" />
        <Stack.Screen component={CreatePinScreen} name="CreatePin" />
        <Stack.Screen component={ConfirmPinScreen} name="ConfirmPin" />
        <Stack.Screen component={ChangePinScreen} name="ChangePin" />
        <Stack.Screen component={MainTabs} name="MainTabs" />
        <Stack.Screen component={EditPasswordScreen} name="EditPassword" />
        <Stack.Screen component={PinLockScreen} name="PinLock" />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
