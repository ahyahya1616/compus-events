import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { favoritesDb } from '../../database/favorites';
import { useAuth } from '../../context/AuthContext';
import { Event } from '../../database/events';
import { Heart, Calendar, MapPin, ChevronRight } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Event[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  const loadFavorites = useCallback(() => {
    if (user) {
      const data = favoritesDb.getUserFavorites(user.email);
      setFavorites(data);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [loadFavorites])
  );

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/student/event-detail', params: { id: item.id } })}
    >
      <View style={styles.cardContent}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
          <View style={styles.infoRow}>
            <Calendar size={14} color="#94a3b8" />
            <Text style={styles.infoText}>
              {format(new Date(item.startDateTime), 'PP', { locale: fr })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin size={14} color="#94a3b8" />
            <Text style={styles.infoText}>{item.locationName}</Text>
          </View>
        </View>
        <ChevronRight size={20} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Heart size={48} color="#f1f5f9" style={{ marginBottom: 16 }} />
            <Text style={styles.emptyText}>Aucun événement en favoris.</Text>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
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
