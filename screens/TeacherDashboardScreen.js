import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { Colors } from '../constants/Theme';
import { Appbar, Card, IconButton, Button } from 'react-native-paper';

const TeacherDashboardScreen = () => {
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);

  const fetchQuizzes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuizzes(response.data);
      console.log('Fetched quizzes:', response.data); // Log the fetched data
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      // Handle error (e.g., show an alert)
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchQuizzes();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.customHeader}>
        <Text style={styles.headerTitle}>QuizMaster - Teacher's Dashboard</Text>

        <TouchableOpacity style={styles.assignButton} onPress={() => navigation.navigate('AssignQuiz')}>
          <Text style={styles.assignText}>Assign Quiz</Text>
          <Appbar.Action icon="account-plus" color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={async () => {
          await AsyncStorage.removeItem('token');
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }}>
          <Text style={styles.assignText}>Logout</Text>
          <Appbar.Action icon="logout" color="#fff" />
        </TouchableOpacity>
      </View>


      <FlatList
        data={quizzes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 16 }}>
            <Card.Title
              title={item.title}
              subtitle={`Questions: ${item.questions.length}`}
              right={(props) => (
                <>
                  <IconButton {...props} icon="pencil" onPress={() => navigation.navigate('QuizCreation', { quiz: item })} />
                  <IconButton {...props} icon="delete" color={Colors.danger} onPress={async () => {
                    try {
                      const token = await AsyncStorage.getItem('token');
                      await axios.delete(`${API_URL}/api/quizzes/${item._id}`, { headers: { Authorization: `Bearer ${token}` } });
                      fetchQuizzes();
                    } catch (err) {
                      console.error('Delete failed', err);
                    }
                  }} />
                  <IconButton {...props} icon="chart-bar" onPress={() => navigation.navigate('StudentResults', { quizId: item._id })} />
                </>
              )}
            />
          </Card>
        )}
      />

      <Button
        mode="contained"
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('QuizCreation')}
      >
        Create Quiz
      </Button>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 0,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 10,
  },
  quizList: {
    width: '100%',
    paddingHorizontal: 20,
  },
  quizItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  quizActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: 5,
    backgroundColor: Colors.secondary,
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  fab: {
    margin: 16,
  },
  customHeader: {
    backgroundColor: Colors.primary,
    paddingTop: 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    position: 'relative',
  },

  headerTitle: {
    color: Colors.textLight,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    alignSelf: 'center',
  },

  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    left: 1,
    // gap: ,
  },

  assignText: {
    color: '#fff',
    fontSize: 16,
  },

  logoutButton: {
    position: 'absolute',
    right:1,
    bottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
 
  },

});

export default TeacherDashboardScreen;