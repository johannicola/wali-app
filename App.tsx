import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import BottomTabs from './src/navigation/BottomTabs';
import { TransactionsProvider } from './src/services/TransactionsContext';
import { BudgetProvider } from './src/services/BudgetContext';
import { colors } from './src/constants/colors';

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background, card: colors.surface, primary: colors.primary },
};

export default function App() {
  return (
    <TransactionsProvider>
      <BudgetProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="light" />
          <BottomTabs />
        </NavigationContainer>
      </BudgetProvider>
    </TransactionsProvider>
  );
}