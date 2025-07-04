import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import React from "react";
import AuthProvider from "../AuthContext";

export default function TabLayout() {
  return (
    <AuthProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#11111",
          tabBarInactiveTintColor: "#B0B0B0",
          tabBarStyle: {
            borderTopWidth: 0,
            elevation: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Vagoni",
            tabBarIcon: ({ color }) => (
              <Ionicons name="train" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="barza"
          options={{
            title: "Barža",
            tabBarIcon: ({ color }) => (
              <Ionicons name="desktop-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthProvider>
  );
}
