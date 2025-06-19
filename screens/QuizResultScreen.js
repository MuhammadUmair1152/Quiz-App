import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Theme';

const QuizResultScreen = ({ route }) => {
  // Expect route.params to contain { result: { totalQuestions, correctAnswers, incorrectAnswers } }
  const { result } = route.params || { result: { totalQuestions: 0, correctAnswers: 0, incorrectAnswers: 0 } };
  const { totalQuestions, correctAnswers, incorrectAnswers } = result;
  const percentage = totalQuestions ? (correctAnswers / totalQuestions) * 100 : 0;
  const isPassed = percentage >= 50; // Example passing threshold
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Results</Text>
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>Correct Answers: {correctAnswers}</Text>
        <Text style={styles.resultText}>Incorrect Answers: {incorrectAnswers}</Text>
        <Text style={styles.resultText}>Percentage: {percentage.toFixed(2)}%</Text>
        <Text style={[styles.statusText, isPassed ? styles.passed : styles.failed]}>{isPassed ? 'Passed' : 'Failed'}</Text>
      </View>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() =>
          navigation.reset({ index: 0, routes: [{ name: 'StudentDashboard' }] })
        }
      >
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: Colors.primary,
  },
  resultContainer: {
    backgroundColor: Colors.textLight,
    padding: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  resultText: {
    fontSize: 18,
    marginBottom: 10,
    color: Colors.textDark,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  passed: {
    color: Colors.success,
  },
  failed: {
    color: Colors.danger,
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderRadius: 5,
  },
  backButtonText: {
    color: Colors.textLight,
    fontSize: 16,
  },
});

export default QuizResultScreen;