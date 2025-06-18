import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import axios from 'axios';
import { getAuthToken } from '../utils/auth';
import { API_URL } from '../constants/Config';
import { Colors } from '../constants/Theme';

const AssignQuizScreen = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const fetchData = async () => {
    try {
      const token = await getAuthToken();

      const quizzesResponse = await axios.get(`${API_URL}/api/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setQuizzes(quizzesResponse.data);

      const studentsResponse = await axios.get(`${API_URL}/api/users/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents(studentsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch quizzes or students.');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssignQuiz = async () => {
    if (!selectedQuiz) {
      Alert.alert('Error', 'Please select a quiz to assign.');
      return;
    }
    if (selectedStudents.length === 0) {
      Alert.alert('Error', 'Please select at least one student.');
      return;
    }

    try {
      const token = await getAuthToken();
      await axios.post(
        `${API_URL}/api/quizzes/${selectedQuiz._id}/assign`,
        {
          studentIds: selectedStudents.map((s) => s._id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', `Quiz "${selectedQuiz.title}" assigned.`);
      setSelectedQuiz(null);
      setSelectedStudents([]);
    } catch (error) {
      console.error('Error assigning quiz:', error);
      Alert.alert('Error', 'Failed to assign quiz.');
    }
  };

  const renderQuizItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedQuiz && selectedQuiz._id === item._id && styles.selectedItem,
      ]}
      onPress={() => setSelectedQuiz(item)}
    >
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderStudentItem = ({ item }) => {
    const isSelected = selectedStudents.some((s) => s._id === item._id);
    const displayName = item.fullName || item.name || item.email;
    return (
      <TouchableOpacity
        style={[styles.item, isSelected && styles.selectedItem]}
        onPress={() => {
          setSelectedStudents((prev) =>
            isSelected
              ? prev.filter((s) => s._id !== item._id)
              : [...prev, item]
          );
        }}
      >
        <Text style={styles.checkbox}>{isSelected ? '✓' : ' '}</Text>
        <Text>{displayName}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Assign Quiz</Text>

      <Text style={styles.subHeader}>Select Quiz:</Text>
      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />

      <Text style={styles.subHeader}>Select Students:</Text>
      <FlatList
        data={students}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        style={styles.list}
        extraData={selectedStudents}
      />

      <TouchableOpacity
        style={[styles.assignButton, { backgroundColor: Colors.secondary }]}
        onPress={() => {
          if (selectedStudents.length === students.length) {
            // Deselect all
            setSelectedStudents([]);
          } else {
            // Select all
            setSelectedStudents(students);
          }
        }}
      >
        <Text style={styles.assignButtonText}>
          {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.assignButton} onPress={handleAssignQuiz}>
        <Text style={styles.assignButtonText}>Assign Quiz</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 36,
    backgroundColor: Colors.background,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.primary,
    top: 10,
  },
  subHeader: {
    left: 15,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  list: {
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedItem: {
    backgroundColor: Colors.success,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
    textAlign: 'center',
    lineHeight: 18,
  },
  assignButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
  },
  assignButtonText: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AssignQuizScreen;
