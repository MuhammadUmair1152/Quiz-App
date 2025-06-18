import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { API_URL } from '../constants/Config';
import { Colors } from '../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInput, Button } from 'react-native-paper';
import { setUserEmail } from '../utils/auth';

const AuthScreen = () => {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('student'); // 'student' or 'teacher'
  const [error, setError] = useState('');

//   // Your state and handler definitions

// const handleAuthentication = async () => {
//     setError('');
//     try {
//       let response;
//       if (isLogin) {
//         console.log('Attempting login with:', email, 'as', role);
//         response = await axios.post(`${API_URL}/api/auth/login`, { email, password, role });
//         const { token } = response.data;
//         console.log('Login successful');
//         await AsyncStorage.setItem('token', token);

//         if (role === 'teacher') {
//           navigation.navigate('TeacherDashboard');
//         } else {
//           navigation.navigate('StudentDashboard');
//         }
//       } else {
//         await axios.post(`${API_URL}/api/auth/signup`, { email, password, role });
//         // After successful signup, switch to login mode
//         setIsLogin(true);
//         setError('Signup successful! Please log in.');
//       }
//     } catch (err) {
//       console.error('Authentication failed:', err.response?.data || err.message);
//       setError(err.response?.data?.message || 'Authentication failed. Please try again.');
//     }
//   };


const handleAuthentication = async () => {
  setError('');
  try {
    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (isLogin) {
      console.log('Attempting login with:', trimmedEmail, 'as', role);
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: trimmedEmail,
        password: trimmedPassword,
        role,
      });

      const { token } = response.data;
      console.log('Login successful, token:', token);
      await AsyncStorage.setItem('token', token);
      await setUserEmail(trimmedEmail);

      if (role === 'teacher') {
        navigation.navigate('TeacherDashboard');
      } else {
        navigation.navigate('StudentDashboard');
      }
    } else {
      await axios.post(`${API_URL}/api/auth/signup`, {
        fullName: fullName.trim(),
        email: trimmedEmail,
        password: trimmedPassword,
        role,
      });

      setIsLogin(true);
      setError('Signup successful! Please log in.');
    }
  } catch (err) {
    console.error('Authentication failed:', err.response?.data || err.message);
    setError(err.response?.data?.msg || 'Authentication failed. Please try again.');
  }
}
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      // keyboardVerticalOffset={20}
    >
      <Image source={require('../assets/icon.png')} style={styles.logo} />
      <Text style={styles.welcome}>Welcome to QuizMaster</Text>
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {!isLogin && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
      />

      <View style={styles.roleContainer}>
        <Text style={styles.roleLabel}>Login as:</Text>
        <TouchableOpacity
          style={[styles.roleButton, role === 'student' && styles.selectedRole]}
          onPress={() => setRole('student')}
        >
          <Text style={[styles.roleButtonText, role === 'student' && styles.selectedRoleText]}>Student</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'teacher' && styles.selectedRole]}
          onPress={() => setRole('teacher')}
        >
          <Text style={[styles.roleButtonText, role === 'teacher' && styles.selectedRoleText]}>Teacher</Text>
        </TouchableOpacity>
      </View>

      <Button
        mode="contained"
        style={styles.authButton}
        onPress={handleAuthentication}
      >
        {isLogin ? 'Login' : 'Sign Up'}
      </Button>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggleText}>
          {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

// Legacy color constants removed in favor of theme colors

const textColor = '#333';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  welcome: {
    fontSize: 22,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.textDark,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  roleContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    marginRight: 10,
    color: textColor,
  },
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    backgroundColor: Colors.textLight,
  },
  selectedRole: {
    backgroundColor: Colors.primary,
  },
  roleButtonText: {
    color: Colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedRoleText: {
    color: Colors.textLight,
  },
  authButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 5,
  },
  authButtonText: {
    color: Colors.textLight,
    fontSize: 18,
    textAlign: 'center',
  },
  toggleText: {
    marginTop: 20,
    color: Colors.primary,
  },
});

export default AuthScreen;