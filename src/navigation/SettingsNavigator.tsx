import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import SettingsScreen from '../screens/SettingsScreen';
import BudgetScreen from '../screens/BudgetScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import RecurringScreen from '../screens/RecurringScreen';
import DataScreen from '../screens/DataScreen';

export type SettingsStackParamList = {
  SettingsHome: undefined;
  Budget: undefined;
  Categories: undefined;
  Recurring: undefined;
  Data: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerShadowVisible: false,
        headerBackTitle: 'Ajustes',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Budget" component={BudgetScreen} options={{ title: 'Presupuesto' }} />
      <Stack.Screen name="Categories" component={CategoriesScreen} options={{ title: 'Categorías' }} />
      <Stack.Screen name="Recurring" component={RecurringScreen} options={{ title: 'Gastos recurrentes' }} />
      <Stack.Screen name="Data" component={DataScreen} options={{ title: 'Exportar datos' }} />
    </Stack.Navigator>
  );
}