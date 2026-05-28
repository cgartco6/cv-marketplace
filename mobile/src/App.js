import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import CVScreen from './screens/CVScreen';
const Stack = createNativeStackNavigator();
export default function App() { return (<NavigationContainer><Stack.Navigator><Stack.Screen name="Home" component={HomeScreen} /><Stack.Screen name="CV" component={CVScreen} /></Stack.Navigator></NavigationContainer>); }
