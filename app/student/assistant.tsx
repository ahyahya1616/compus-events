import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { llmService, LLMTask } from '../../services/llm';
import { eventsDb } from '../../database/events';
import { registrationsDb } from '../../database/registrations';
import { favoritesDb } from '../../database/favorites';
import { 
  Sparkles, 
  Search, 
  Target, 
  Calendar, 
  MessageSquare,
  Send,
  AlertCircle,
  RefreshCw,
  ChevronRight
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function AssistantScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<LLMTask>('search');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const TASKS = [
    { id: 'search', label: 'Recherche NL', icon: Search, desc: 'Trouvez par sens (ex: "un atelier IA ce weekend")' },
    { id: 'recommendation', label: 'Recommandations', icon: Target, desc: 'Basé sur vos intérêts passés' },
    { id: 'planning', label: 'Planning', icon: Calendar, desc: 'Organisez votre semaine selon vos cours' },
    { id: 'qa', label: 'Questions/Réponses', icon: MessageSquare, desc: 'Posez des questions sur le campus' },
  ];

  const handleRunTask = async () => {
    if (!user) return;
    if (activeTask !== 'recommendation' && !inputText.trim()) {
      Alert.alert('Info', 'Veuillez saisir votre demande.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let contextData: any = {};
      const allEvents = eventsDb.getAll();

      switch (activeTask) {
        case 'search':
          contextData = allEvents.map(e => ({ id: e.id, title: e.title, description: e.description, category: e.category }));
          break;
        case 'recommendation':
          const favs = favoritesDb.getUserFavorites(user.email);
          const regs = registrationsDb.getUserRegistrations(user.email);
          const upcoming = allEvents.filter(e => new Date(e.startDateTime) > new Date());
          contextData = {
            history: [...favs, ...regs].map(e => ({ title: e.title, category: e.category })),
            catalog: upcoming.map(e => ({ id: e.id, title: e.title, description: e.description, category: e.category }))
          };
          break;
        case 'planning':
          const thisWeek = allEvents.filter(e => {
            const start = new Date(e.startDateTime);
            const now = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(now.getDate() + 7);
            return start >= now && start <= endOfWeek;
          });
          contextData = thisWeek.map(e => ({ title: e.title, start: e.startDateTime, end: e.endDateTime }));
          break;
        case 'qa':
          contextData = allEvents.map(e => ({ title: e.title, category: e.category, location: e.locationName, date: e.startDateTime, capacity: e.capacity, registered: e.registeredCount }));
          break;
      }

      const output = await llmService.runTask({
        userId: user.email,
        type: activeTask,
        inputText: activeTask === 'recommendation' ? 'Suggère-moi des événements' : inputText,
        contextData
      });

      if (activeTask === 'search' || activeTask === 'recommendation') {
        setResult(JSON.parse(output));
      } else {
        setResult(output);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return null;

    if (activeTask === 'search') {
      const results = result.results || [];
      if (results.length === 0) return <EmptyResult />;
      return (
        <View style={styles.resultContainer}>
          {results.map((res: any) => {
            const event = eventsDb.getById(res.id);
            if (!event) return null;
            return (
              <EventResultItem 
                key={event.id} 
                event={event} 
                justification={res.justification} 
                onPress={() => router.push({ pathname: '/student/event-detail', params: { id: event.id } })}
              />
            );
          })}
        </View>
      );
    }

    if (activeTask === 'recommendation') {
      const recs = result.recommendations || [];
      return (
        <View style={styles.resultContainer}>
          <Text style={styles.recsHeader}>Suggestions personnalisées</Text>
          {recs.map((res: any) => {
            const event = eventsDb.getById(res.id);
            if (!event) return null;
            return (
              <EventResultItem 
                key={event.id} 
                event={event} 
                justification={res.reason} 
                onPress={() => router.push({ pathname: '/student/event-detail', params: { id: event.id } })}
              />
            );
          })}
        </View>
      );
    }

    return (
      <View style={styles.textResultCard}>
        <Text style={styles.textResult}>{result}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.taskSelector}>
          <Text style={styles.sectionTitle}>Quelle est votre demande ?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
            {TASKS.map((task) => (
              <TouchableOpacity 
                key={task.id}
                style={[styles.taskCard, activeTask === task.id && styles.activeTaskCard]}
                onPress={() => {
                  setActiveTask(task.id as LLMTask);
                  setResult(null);
                  setError(null);
                }}
              >
                <View style={[styles.taskIconCircle, activeTask === task.id && styles.activeTaskIconCircle]}>
                  <task.icon size={24} color={activeTask === task.id ? '#fff' : '#6366f1'} />
                </View>
                <Text style={[styles.taskLabel, activeTask === task.id && styles.activeTaskLabel]}>{task.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.taskDesc}>{TASKS.find(t => t.id === activeTask)?.desc}</Text>
        </View>

        {activeTask !== 'recommendation' && (
          <View style={styles.inputSection}>
            <TextInput
              style={styles.input}
              placeholder={activeTask === 'planning' ? 'Ex: Cours lundi matin, exam jeudi...' : 'Posez votre question...'}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.runButton, loading && styles.disabledButton]} 
              onPress={handleRunTask}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Send size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        )}

        {activeTask === 'recommendation' && !result && !loading && (
          <TouchableOpacity style={styles.bigRunButton} onPress={handleRunTask}>
            <Sparkles size={24} color="#fff" />
            <Text style={styles.bigRunButtonText}>Générer mes recommandations</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
            <Text style={styles.loadingText}>L'IA analyse le catalogue...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <AlertCircle size={24} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRunTask}>
              <RefreshCw size={16} color="#6366f1" />
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {renderResult()}

        <View style={styles.disclaimer}>
          <AlertCircle size={12} color="#94a3b8" />
          <Text style={styles.disclaimerText}>
            L'IA peut faire des erreurs. Ne soumettez pas de données personnelles.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const EventResultItem = ({ event, justification, onPress }: any) => (
  <TouchableOpacity style={styles.resultItem} onPress={onPress}>
    <View style={styles.resultItemHeader}>
      <Text style={styles.resultItemTitle}>{event.title}</Text>
      <ChevronRight size={18} color="#cbd5e1" />
    </View>
    <View style={styles.justificationCard}>
      <Sparkles size={12} color="#6366f1" />
      <Text style={styles.justificationText}>{justification}</Text>
    </View>
  </TouchableOpacity>
);

const EmptyResult = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyText}>Aucun événement ne correspond à cette demande.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  taskSelector: { marginBottom: 24 },
  horizontalScroll: { paddingBottom: 10 },
  taskCard: {
    width: 140,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTaskCard: { borderColor: '#6366f1', backgroundColor: '#f5f3ff' },
  taskIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeTaskIconCircle: { backgroundColor: '#6366f1' },
  taskLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', textAlign: 'center' },
  activeTaskLabel: { color: '#6366f1' },
  taskDesc: { fontSize: 13, color: '#94a3b8', marginTop: 12, fontStyle: 'italic' },
  inputSection: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 24 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    maxHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  runButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bigRunButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    padding: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  bigRunButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 12 },
  disabledButton: { backgroundColor: '#cbd5e1' },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 16, color: '#6366f1', fontWeight: '500' },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  errorText: { color: '#ef4444', textAlign: 'center', marginVertical: 12 },
  retryButton: { flexDirection: 'row', alignItems: 'center' },
  retryText: { marginLeft: 8, color: '#6366f1', fontWeight: '600' },
  resultContainer: { marginBottom: 40 },
  recsHeader: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 16 },
  resultItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  resultItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  resultItemTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  justificationCard: { flexDirection: 'row', backgroundColor: '#f5f3ff', padding: 8, borderRadius: 8, alignItems: 'flex-start' },
  justificationText: { flex: 1, fontSize: 13, color: '#6366f1', marginLeft: 8, lineHeight: 18 },
  textResultCard: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 40 },
  textResult: { fontSize: 15, color: '#334155', lineHeight: 22 },
  disclaimer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 20 },
  disclaimerText: { fontSize: 11, color: '#94a3b8', marginLeft: 6 },
  emptyContainer: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8', textAlign: 'center' }
});
