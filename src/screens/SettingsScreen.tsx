import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';
import type { SettingsStackParamList } from '../navigation/SettingsNavigator';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsHome'>;
type IconName = React.ComponentProps<typeof Ionicons>['name'];

const ITEMS: {
  icon: IconName;
  title: string;
  subtitle: string;
  route: 'Budget' | 'Categories' | 'Recurring';
}[] = [
  { icon: 'wallet-outline', title: 'Presupuesto', subtitle: 'Total mensual y límite por categoría', route: 'Budget' },
  { icon: 'pricetags-outline', title: 'Categorías', subtitle: 'Agregar, editar y eliminar', route: 'Categories' },
  { icon: 'repeat-outline', title: 'Gastos recurrentes', subtitle: 'Alquiler, suscripciones, internet', route: 'Recurring' },
];

export default function SettingsScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ajustes</Text>

      <View style={styles.list}>
        {ITEMS.map((item) => (
          <Pressable
            key={item.route}
            style={styles.row}
            onPress={() => navigation.navigate(item.route)}
          >
            <Ionicons name={item.icon} size={24} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  title: { color: colors.text, fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  list: { gap: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  rowSubtitle: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
});