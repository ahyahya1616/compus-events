import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { eventsDb, Event } from '../../database/events';
import { Search, Filter, Ticket, MapPin, Clock } from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CATEGORIES = ['Tous', 'Talk', 'Workshop', 'Club', 'Exam', 'Other'];

export default function StudentEventsScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [period, setPeriod] = useState<'upcoming' | 'past'>('upcoming');
  const router = useRouter();

  const loadEvents = useCallback(() => {
    let data = eventsDb.getAll();
    const now = new Date();

    // Filter by period
    if (period === 'upcoming') {
      data = data.filter(e => new Date(e.startDateTime) >= now);
    } else {
      data = data.filter(e => new Date(e.startDateTime) < now);
    }

    // Filter by category
    if (selectedCategory !== 'Tous') {
      data = data.filter(e => e.category === selectedCategory);
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(e => 
        e.title.toLowerCase().includes(query) || 
        e.description.toLowerCase().includes(query)
      );
    }

    setEvents(data);
  }, [searchQuery, selectedCategory, period]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const renderItem = ({ item }: { item: Event }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/student/event-detail', params: { id: item.id } })}
    >
      <View style={styles.cardInfo}>
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.dateBadge}>
            {format(new Date(item.startDateTime), 'd MMM', { locale: fr })}
          </Text>
        </View>
        
        <Text style={styles.eventTitle} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.footerInfo}>
          <View style={styles.infoRow}>
            <Clock size={14} color="#94a3b8" />
            <Text style={styles.infoText}>
              {format(new Date(item.startDateTime), 'HH:mm', { locale: fr })}
            </Text>
          </View>
          <View style={[styles.infoRow, { marginLeft: 16 }]}>
            <MapPin size={14} color="#94a3b8" />
            <Text style={styles.infoText} numberOfLines={1}>{item.locationName}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un événement..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.periodTabs}>
          <TouchableOpacity 
            style={[styles.periodTab, period === 'upcoming' && styles.activePeriodTab]}
            onPress={() => setPeriod('upcoming')}
          >
            <Text style={[styles.periodTabText, period === 'upcoming' && styles.activePeriodTabText]}>À venir</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.periodTab, period === 'past' && styles.activePeriodTab]}
            onPress={() => setPeriod('past')}
          >
            <Text style={[styles.periodTabText, period === 'past' && styles.activePeriodTabText]}>Passés</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryChip, selectedCategory === item && styles.activeCategoryChip]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text style={[styles.categoryChipText, selectedCategory === item && styles.activeCategoryChipText]}>
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun événement trouvé.</Text>
          </View>
        }
      />
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
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 48,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  periodTabs: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 2,
  },
  periodTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activePeriodTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  activePeriodTabText: {
    color: '#6366f1',
  },
  categoryList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: '#6366f1',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  activeCategoryChipText: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f1f5f9',
  },
  cardInfo: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dateBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366f1',
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#94a3b8',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 16,
  }
});
