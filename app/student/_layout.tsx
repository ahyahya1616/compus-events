import { Tabs } from 'expo-router';
import { Calendar, Heart, UserCheck, Sparkles, LogOut } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { TouchableOpacity, StyleSheet } from 'react-native';

export default function StudentLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#6366f1',
      tabBarInactiveTintColor: '#94a3b8',
      tabBarStyle: {
        borderTopWidth: 0,
        elevation: 10,
        height: 60,
        paddingBottom: 10,
        paddingTop: 5,
        backgroundColor: '#fff',
      },
      headerRight: () => (
        <TouchableOpacity onPress={signOut} style={styles.logoutButton}>
          <LogOut size={20} color="#ef4444" />
        </TouchableOpacity>
      ),
    }}>
      <Tabs.Screen
        name="events"
        options={{
          title: 'Événements',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color, size }) => <Heart size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="registrations"
        options={{
          title: 'Inscriptions',
          tabBarIcon: ({ color, size }) => <UserCheck size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant IA',
          tabBarIcon: ({ color, size }) => <Sparkles size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 16,
    padding: 8,
  }
});
