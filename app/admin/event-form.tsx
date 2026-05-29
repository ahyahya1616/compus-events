import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { eventsDb, Event } from '../../database/events';
import { Save, X, Calendar as CalendarIcon, MapPin, Tag, Info, Users } from 'lucide-react-native';

const CATEGORIES = ['Talk', 'Workshop', 'Club', 'Exam', 'Other'];

export default function EventFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Talk' as Event['category'],
    startDateTime: '',
    endDateTime: '',
    locationName: '',
    locationAddress: '',
    organizerName: '',
    capacity: '',
    tags: '',
  });

  useEffect(() => {
    if (id) {
      const event = eventsDb.getById(id);
      if (event) {
        setFormData({
          title: event.title,
          description: event.description,
          category: event.category,
          startDateTime: event.startDateTime,
          endDateTime: event.endDateTime || '',
          locationName: event.locationName,
          locationAddress: event.locationAddress || '',
          organizerName: event.organizerName,
          capacity: event.capacity?.toString() || '',
          tags: event.tags || '',
        });
      }
    } else {
      // Default dates for new event
      const now = new Date();
      now.setMinutes(0);
      now.setSeconds(0);
      setFormData(prev => ({ ...prev, startDateTime: now.toISOString() }));
    }
  }, [id]);

  const handleSave = () => {
    // Basic Validation
    if (!formData.title || !formData.description || !formData.locationName || !formData.startDateTime) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    if (formData.endDateTime && new Date(formData.endDateTime) <= new Date(formData.startDateTime)) {
      Alert.alert('Erreur', 'La date de fin doit être postérieure à la date de début.');
      return;
    }

    const eventData: any = {
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity, 10) : undefined,
    };

    try {
      if (id) {
        eventsDb.update(id, eventData);
      } else {
        eventsDb.create({
          ...eventData,
          id: Math.random().toString(36).substring(2, 15),
        });
      }
      router.back();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'événement.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Titre *</Text>
          <TextInput 
            style={styles.input} 
            value={formData.title}
            onChangeText={(text) => setFormData({...formData, title: text})}
            placeholder="Ex: Workshop React Native"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            value={formData.description}
            onChangeText={(text) => setFormData({...formData, description: text})}
            placeholder="Détails de l'événement..."
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Catégorie</Text>
          <View style={styles.categoryContainer}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity 
                key={cat}
                style={[
                  styles.categoryChip, 
                  formData.category === cat && styles.activeChip
                ]}
                onPress={() => setFormData({...formData, category: cat as any})}
              >
                <Text style={[
                  styles.chipText,
                  formData.category === cat && styles.activeChipText
                ]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Date de début * (ISO)</Text>
            <TextInput 
              style={styles.input} 
              value={formData.startDateTime}
              onChangeText={(text) => setFormData({...formData, startDateTime: text})}
              placeholder="YYYY-MM-DDTHH:MM"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Date de fin (ISO)</Text>
            <TextInput 
              style={styles.input} 
              value={formData.endDateTime}
              onChangeText={(text) => setFormData({...formData, endDateTime: text})}
              placeholder="Facultatif"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Lieu *</Text>
          <View style={styles.iconInput}>
            <MapPin size={18} color="#94a3b8" style={styles.inputIcon} />
            <TextInput 
              style={styles.flexInput} 
              value={formData.locationName}
              onChangeText={(text) => setFormData({...formData, locationName: text})}
              placeholder="Amphi 1, Bâtiment B..."
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Organisateur *</Text>
          <TextInput 
            style={styles.input} 
            value={formData.organizerName}
            onChangeText={(text) => setFormData({...formData, organizerName: text})}
            placeholder="BDE, Club Info, etc."
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Capacité</Text>
            <View style={styles.iconInput}>
              <Users size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.flexInput} 
                value={formData.capacity}
                onChangeText={(text) => setFormData({...formData, capacity: text.replace(/[^0-9]/g, '')})}
                placeholder="Ex: 50"
                keyboardType="numeric"
              />
            </View>
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Tags (JSON)</Text>
            <View style={styles.iconInput}>
              <Tag size={18} color="#94a3b8" style={styles.inputIcon} />
              <TextInput 
                style={styles.flexInput} 
                value={formData.tags}
                onChangeText={(text) => setFormData({...formData, tags: text})}
                placeholder='["IA", "Web"]'
              />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#fff" />
          <Text style={styles.saveButtonText}>Enregistrer</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeChip: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 14,
    color: '#64748b',
  },
  activeChipText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  flexInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  }
});
