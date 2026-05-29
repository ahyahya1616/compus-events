import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { eventsDb, Event } from '../../database/events';
import { registrationsDb } from '../../database/registrations';
import { favoritesDb } from '../../database/favorites';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  MapPin, 
  User, 
  Users, 
  Heart, 
  ChevronLeft,
  CheckCircle,
  Clock
} from 'lucide-react-native';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const loadData = useCallback(() => {
    if (id && user) {
      const e = eventsDb.getById(id);
      if (e) {
        setEvent(e);
        setIsRegistered(registrationsDb.isUserRegistered(id, user.email));
        setIsFavorite(favoritesDb.isFavorite(id, user.email));
      }
    }
  }, [id, user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  if (!event) return null;

  const handleRegister = () => {
    if (!user) return;

    if (isRegistered) {
      // Find registration ID to cancel
      const regs = registrationsDb.getUserRegistrations(user.email);
      const reg = regs.find(r => r.eventId === event.id);
      if (reg) {
        Alert.alert('Annuler', 'Voulez-vous annuler votre inscription ?', [
          { text: 'Non', style: 'cancel' },
          { 
            text: 'Oui', 
            onPress: () => {
              registrationsDb.cancel(reg.id);
              loadData();
            }
          }
        ]);
      }
    } else {
      if (event.capacity && event.registeredCount >= event.capacity) {
        Alert.alert('Complet', 'Cet événement est complet.');
        return;
      }

      if (new Date(event.startDateTime) < new Date()) {
        Alert.alert('Passé', 'Impossible de s\'inscrire à un événement passé.');
        return;
      }

      try {
        registrationsDb.create({
          id: Math.random().toString(36).substring(2, 15),
          eventId: event.id,
          userId: user.email,
        });
        Alert.alert('Succès', 'Vous êtes inscrit !');
        loadData();
      } catch (e: any) {
        Alert.alert('Erreur', e.message);
      }
    }
  };

  const toggleFavorite = () => {
    if (!user) return;
    if (isFavorite) {
      favoritesDb.remove(event.id, user.email);
    } else {
      favoritesDb.add(event.id, user.email);
    }
    setIsFavorite(!isFavorite);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft size={24} color="#1e293b" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite} style={styles.iconButton}>
          <Heart size={24} color={isFavorite ? "#ef4444" : "#94a3b8"} fill={isFavorite ? "#ef4444" : "transparent"} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) }]}>
          <Text style={styles.categoryText}>{event.category}</Text>
        </View>
        
        <Text style={styles.title}>{event.title}</Text>
        
        <View style={styles.mainInfo}>
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Calendar size={20} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {format(new Date(event.startDateTime), 'PPPP', { locale: fr })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Clock size={20} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Heure</Text>
              <Text style={styles.infoValue}>
                {format(new Date(event.startDateTime), 'HH:mm', { locale: fr })}
                {event.endDateTime ? ` - ${format(new Date(event.endDateTime), 'HH:mm', { locale: fr })}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MapPin size={20} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Lieu</Text>
              <Text style={styles.infoValue}>{event.locationName}</Text>
              {event.locationAddress && <Text style={styles.infoSubValue}>{event.locationAddress}</Text>}
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <User size={20} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Organisé par</Text>
              <Text style={styles.infoValue}>{event.organizerName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <Users size={20} color="#6366f1" />
            </View>
            <View>
              <Text style={styles.infoLabel}>Disponibilité</Text>
              <Text style={styles.infoValue}>
                {event.capacity ? `${event.registeredCount} / ${event.capacity} inscrits` : `${event.registeredCount} inscrits`}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <Text style={styles.description}>{event.description}</Text>
        </View>

        {event.tags && (
          <View style={styles.section}>
            <View style={styles.tagsContainer}>
              {JSON.parse(event.tags).map((tag: string) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.registerButton, 
            isRegistered && styles.registeredButton,
            (event.capacity && event.registeredCount >= event.capacity && !isRegistered) && styles.disabledButton
          ]}
          onPress={handleRegister}
          disabled={event.capacity !== undefined && event.registeredCount >= event.capacity && !isRegistered}
        >
          {isRegistered ? <CheckCircle size={20} color="#fff" /> : null}
          <Text style={styles.registerButtonText}>
            {isRegistered ? 'Inscrit' : (event.capacity && event.registeredCount >= event.capacity) ? 'Complet' : 'S\'inscrire'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 24,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 24,
  },
  mainInfo: {
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    padding: 20,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  infoSubValue: {
    fontSize: 13,
    color: '#64748b',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#475569',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  registerButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
  },
  registeredButton: {
    backgroundColor: '#10b981',
  },
  disabledButton: {
    backgroundColor: '#cbd5e1',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  }
});
