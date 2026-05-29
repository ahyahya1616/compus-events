import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, TextInput, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import { GraduationCap, ShieldCheck, Mail, Lock } from 'lucide-react-native';
import { usersDb } from '../database/users';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const user = usersDb.getByEmail(email);
    if (user && user.password === password) {
      await signIn(email, user.role);
    } else {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
    }
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
        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#94a3b8" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>

        <View style={styles.signupPrompt}>
          <Text style={styles.signupText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>OU ACCÈS RAPIDE</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.quickAccess}>
          <TouchableOpacity 
            style={[styles.smallButton, styles.adminButton]}
            onPress={() => { setEmail('admin@campus.ma'); setPassword('admin123'); }}
          >
            <ShieldCheck size={18} color="#fff" />
            <Text style={styles.smallButtonText}>Admin</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.smallButton, styles.studentButton]}
            onPress={() => { setEmail('etudiant@campus.ma'); setPassword('etudiant123'); }}
          >
            <GraduationCap size={18} color="#fff" />
            <Text style={styles.smallButtonText}>Étudiant</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.footer}>Multi-role Demo • Expo v54</Text>
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
    marginBottom: 40,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 50, fontSize: 16, color: '#1e293b' },
  loginButton: {
    backgroundColor: '#6366f1',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupText: { color: '#64748b' },
  signupLink: { color: '#6366f1', fontWeight: '700' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  line: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  quickAccess: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallButton: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
  },
  adminButton: { backgroundColor: '#1e293b' },
  studentButton: { backgroundColor: '#6366f1' },
  smallButtonText: { color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 13 },
  footer: {
    marginTop: 40,
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 11,
  }
});
