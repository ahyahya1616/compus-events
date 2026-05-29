import { Stack } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LogOut } from 'lucide-react-native';

export default function AdminLayout() {
  const { signOut } = useAuth();

  return (
    <Stack>
      <Stack.Screen 
        name="events" 
        options={{ 
          title: 'Gestion Événements',
          headerRight: () => (
            <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
              <LogOut size={20} color="#ef4444" />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: '#fff' },
          headerTitleStyle: { fontWeight: '700', color: '#1e293b' },
        }} 
      />
      <Stack.Screen 
        name="event-form" 
        options={{ 
          title: 'Nouvel Événement',
          presentation: 'modal',
        }} 
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 8,
    padding: 8,
  }
});
