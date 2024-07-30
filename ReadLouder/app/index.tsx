import React from "react";
import { View } from "react-native";
import Home from './Home';
import Toast from "react-native-toast-message";

export default function Index() {
  return (
    <View style={{ flex: 1 }}>
      <Home />
      <Toast />
    </View>
  );
}
