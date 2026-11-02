if (__DEV__) {
  require('./ReactotronConfig');
}

import React from 'react';
import { StatusBar, Text } from 'react-native';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from './theme';
import Button from './components/Button';
import CatalogueScreen from './screens/CatalogueScreen';
import ProductDetailScreen from './screens/ProductDetailScreen';
import EnquiryScreen from './screens/EnquiryScreen';
import ThankYouScreen from './screens/ThankYouScreen';
import MyEnquiriesScreen from './screens/MyEnquiriesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// "Tribe Green" wordmark, same as the website header.
function BrandTitle() {
  const t = useTheme();
  return (
    <Text style={{ fontSize: 20, fontWeight: '800', color: t.text }}>
      Tribe <Text style={{ color: t.green }}>Green</Text>
    </Text>
  );
}

function Tabs() {
  const t = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.bg },
        headerTitleStyle: { color: t.text, fontWeight: '800' },
        tabBarStyle: { backgroundColor: t.bg, borderTopColor: t.border },
        tabBarActiveTintColor: t.green,
        tabBarInactiveTintColor: t.muted,
        tabBarLabelStyle: { fontWeight: '700' },
      }}
    >
      <Tab.Screen
        name="Catalogue"
        component={CatalogueScreen}
        options={({ navigation }) => ({
          headerTitle: () => <BrandTitle />,
          headerTitleAlign: 'left',
          headerRight: () => <Button title="Send enquiry" small onPress={() => navigation.navigate('Enquiry')} />,
          headerRightContainerStyle: { paddingRight: 16 },
          tabBarLabel: 'Catalogue',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🎁</Text>,
        })}
      />
      <Tab.Screen
        name="MyEnquiries"
        component={MyEnquiriesScreen}
        options={{
          title: 'My enquiries',
          tabBarLabel: 'My enquiries',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const t = useTheme();
  const base = t.dark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: { ...base.colors, primary: t.green, background: t.bg, card: t.bg, text: t.text, border: t.border, notification: t.green },
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={t.dark ? 'light-content' : 'dark-content'} backgroundColor={t.bg} />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: t.bg },
            headerTintColor: t.text,
            headerTitleStyle: { fontWeight: '800' },
            contentStyle: { backgroundColor: t.bg },
          }}
        >
          <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
          <Stack.Screen name="Enquiry" component={EnquiryScreen} options={{ title: 'Send an enquiry' }} />
          <Stack.Screen name="ThankYou" component={ThankYouScreen} options={{ title: 'Thank you', headerBackVisible: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
