import React from 'react';
import { View, Text, Button } from 'react-native';
export default function HomeScreen({ navigation }) { return (<View><Text>CV Marketplace</Text><Button title="Upload CV" onPress={()=>navigation.navigate('CV')} /></View>); }
