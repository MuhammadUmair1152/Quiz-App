import React from 'react';
import { SafeAreaView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '../constants/Theme';
import { Appbar, Card, Avatar } from 'react-native-paper';

const StudentDashboardScreen = () => {
  const navigation = useNavigation();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.headerTitle}>QuizMaster - Student</Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
          <Appbar.Action icon="logout" color="#fff" />
        </TouchableOpacity>
      </View>

      <Card style={styles.card} onPress={() => navigation.navigate('AssignedQuizzes')}>
        <Card.Title
          title="Assigned Quizzes"
          left={(props) => <Avatar.Icon {...props} size={32} icon="clipboard-list-outline" />}
        />
      </Card>

      <Card style={styles.card} onPress={() => navigation.navigate('StudentResults')}>
        <Card.Title
          title="My Results"
          left={(props) => <Avatar.Icon {...props} size={32} icon="chart-bar" />}
        />
      </Card>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    marginHorizontal: 16,
    marginTop: 20,
  },
  customHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 30,
    paddingBottom: 60,
    paddingHorizontal: 16,
    position: 'relative',
  },
  headerTitle: {
    color: Colors.textLight,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    right: 1,
    top: 66,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
});

export default StudentDashboardScreen;
