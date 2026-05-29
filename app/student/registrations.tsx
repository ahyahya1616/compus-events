import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { registrationsDb } from '../../database/registrations';
import { useAuth } from '../../context/AuthContext';
import { Calendar, MapPin, ChevronRight, CheckCircle } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function RegistrationsScreen() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  const loadRegistrations = useCallback(() => {
    if (user) {
      const data = registrationsDb.getUserRegistrations(user.email);
      setRegistrations(data);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadRegistrations();
    }, [loadRegistrations])
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/student/event-detail', params: { id: item.eventId } })}
    >
      <View style={styles.cardContent}>
        <View style={styles.statusBadge}>
          <CheckCircle size={14} color="#10b981" />
          <Text style={styles.statusText}>Confirmé</Text>
        </View>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.infoRow}>
          <Calendar size={14} color="#94a3b8" />
          <Text style={styles.infoText}>
            {format(new Date(item.startDateTime), 'PPPPp', { locale: fr })}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <MapPin size={14} color="#94a3b8" />
          <Text style={styles.infoText}>{item.locationName}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Vous ne participez à aucun événement.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardContent: {},
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  statusText: {
    color: '#059669',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  }
});
