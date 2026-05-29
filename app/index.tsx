import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LogIn, GraduationCap, ShieldCheck } from 'lucide-react-native';

export default function LoginScreen() {
  const { signIn } = useAuth();

  const handleLogin = async (email: string, role: 'admin' | 'student') => {
    await signIn(email, role);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <GraduationCap size={64} color="#6366f1" />
        </View>
        <Text style={styles.title}>CampusEvents AI</Text>
        <Text style={styles.subtitle}>Votre compagnon intelligent du campus</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.sectionLabel}>Se connecter en tant que :</Text>
        
        <TouchableOpacity 
          style={[styles.button, styles.adminButton]}
          onPress={() => handleLogin('admin@campus.ma', 'admin')}
        >
          <ShieldCheck size={24} color="#fff" style={styles.buttonIcon} />
          <View>
            <Text style={styles.buttonText}>Administrateur</Text>
            <Text style={styles.buttonSubtext}>Gérer le catalogue d'événements</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.studentButton]}
          onPress={() => handleLogin('etudiant@campus.ma', 'student')}
        >
          <GraduationCap size={24} color="#fff" style={styles.buttonIcon} />
          <View>
            <Text style={styles.buttonText}>Étudiant</Text>
            <Text style={styles.buttonSubtext}>Découvrir et s'inscrire</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={styles.footer}>Multi-role Local Demo • Expo v56</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  adminButton: {
    backgroundColor: '#1e293b', // Slate 900
  },
  studentButton: {
    backgroundColor: '#6366f1', // Indigo 500
  },
  buttonIcon: {
    marginRight: 16,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    marginTop: 'auto',
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 12,
  }
});
