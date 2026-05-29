import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { eventsDb, Event } from '../../database/events';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function AdminEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const router = useRouter();

  const loadEvents = useCallback(() => {
    const data = eventsDb.getAll();
    setEvents(data);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Supprimer',
      `Êtes-vous sûr de vouloir supprimer "${title}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            eventsDb.delete(id);
            loadEvents();
          }
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Event }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => router.push({ pathname: '/admin/event-form', params: { id: item.id } })}
            style={styles.iconButton}
          >
            <Edit2 size={18} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleDelete(item.id, item.title)}
            style={styles.iconButton}
          >
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.eventTitle}>{item.title}</Text>
      
      <View style={styles.infoRow}>
        <Calendar size={14} color="#64748b" />
        <Text style={styles.infoText}>
          {format(new Date(item.startDateTime), 'PPPp', { locale: fr })}
        </Text>
      </View>

      <View style={styles.infoRow}>
        <MapPin size={14} color="#64748b" />
        <Text style={styles.infoText}>{item.locationName}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun événement au catalogue.</Text>
          </View>
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => router.push('/admin/event-form')}
      >
        <Plus size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const getCategoryColor = (cat: string) => {
  switch (cat) {
    case 'Talk': return '#0ea5e9';
    case 'Workshop': return '#8b5cf6';
    case 'Club': return '#10b981';
    case 'Exam': return '#f43f5e';
    default: return '#64748b';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 12,
    padding: 4,
  },
  eventTitle: {
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
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
