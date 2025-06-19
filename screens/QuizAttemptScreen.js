import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { Colors } from '../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config'; // Replace with your actual config
import { RadioButton, Button, Card } from 'react-native-paper';

const QuizAttemptScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { quizId } = route.params; // Receive quizId from previous screen

  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get(`${API_URL}/api/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // The backend may return { quiz: {...} } or just the quiz object directly
        const quizData = res.data.quiz || res.data;

        // Ensure questions exists and is an array
        if (!Array.isArray(quizData.questions)) {
          console.error('Quiz payload missing questions array:', quizData);
          setQuiz(null);
          setLoading(false);
          return;
        }

        // Normalize question shape so UI can rely on .text and .options
        const normalizedQuestions = quizData.questions.map((q) => ({
          text: q.text || q.questionText || '',
          options: q.options || q.answerOptions || [],
          correctAnswer: q.correctAnswer,
        }));

        const normalizedQuiz = { ...quizData, questions: normalizedQuestions };

        setQuiz(normalizedQuiz);
        setSelectedAnswers(new Array(normalizedQuestions.length).fill(undefined));
      } catch (err) {
        console.error('Failed to fetch quiz:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleOptionSelect = (questionIndex, optionIndex) => {
    const updatedSelections = [...selectedAnswers];
    updatedSelections[questionIndex] = optionIndex;
    setSelectedAnswers(updatedSelections);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handleSubmitQuiz = async () => {
    // Convert selected option indices to their corresponding answer texts for local calculation
    const studentAnswerTexts = selectedAnswers.map((selectedIdx, qIdx) =>
      selectedIdx != null ? quiz.questions[qIdx].options[selectedIdx] : null
    );

    // Compute results locally in a tolerant way (correctAnswer may be text or index)
    let correctAnswers = 0;
    quiz.questions.forEach((q, idx) => {
      const chosenAnswerIdx = selectedAnswers[idx];
      const chosenAnswerText = studentAnswerTexts[idx];

      let isCorrect = false;

      // Case 1: correctAnswer stored as index
      if (typeof q.correctAnswer === 'number') {
        isCorrect = chosenAnswerIdx === q.correctAnswer;
      }

      // Case 2: correctAnswer stored as string/text
      if (!isCorrect && typeof q.correctAnswer === 'string' && chosenAnswerText != null) {
        isCorrect = chosenAnswerText.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
      }

      if (isCorrect) correctAnswers += 1;
    });

    const totalQuestions = quiz.questions.length;
    const incorrectAnswers = totalQuestions - correctAnswers;

    const resultObj = { totalQuestions, correctAnswers, incorrectAnswers };

    try {
      const token = await AsyncStorage.getItem('token');
      // Send the indices as studentAnswers (backend expects indices)
      await axios.post(
        `${API_URL}/api/quizzes/${quizId}/submit`,
        {
          studentAnswers: selectedAnswers, // Send indices as expected by backend
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error('Submission failed (still navigating to results):', error);
    } finally {
      navigation.replace('QuizResult', { result: resultObj });
    }
  };

  if (loading || !quiz) return <Text style={styles.loading}>Loading quiz...</Text>;

  const currentQuestion = quiz.questions[currentQuestionIndex];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.quizTitle}>{quiz.title}</Text>
      {/* {quiz.questions.map((question, qIndex) => (
        <Card key={qIndex} style={styles.questionCard}>
          <Card.Title title={`Question ${qIndex + 1}`} />
          <Card.Content>
            <Text style={styles.questionText}>{question.text}</Text>
            <RadioButton.Group
              onValueChange={(value) => handleOptionSelect(qIndex, parseInt(value, 10))}
              value={selectedAnswers[qIndex]?.toString()}>
              {question.options.map((option, oIndex) => (
                <RadioButton.Item
                  key={oIndex}
                  label={option}
                  value={oIndex.toString()}
                />
              ))}
            </RadioButton.Group>
          </Card.Content>
        </Card>
      ))} */}
      <Card style={styles.questionCard}>
        <Card.Title title={`Question ${currentQuestionIndex + 1}`} />
        <Card.Content>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <RadioButton.Group
            onValueChange={(value) => handleOptionSelect(currentQuestionIndex, parseInt(value, 10))}
            value={selectedAnswers[currentQuestionIndex]?.toString()}
          >
            {currentQuestion.options.map((option, oIndex) => (
              <RadioButton.Item
                key={oIndex}
                label={option}
                value={oIndex.toString()}
              />
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
        <Text style={styles.nextButtonText}>
          {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  loading: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 18,
  },
  quizTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.primary,
  },
  questionCard: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default QuizAttemptScreen;
