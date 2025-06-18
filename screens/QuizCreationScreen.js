import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Alert, KeyboardAvoidingView, Platform, TouchableOpacity, SafeAreaView } from 'react-native';
import { TextInput, Button, Card, IconButton } from 'react-native-paper';
import { API_URL } from '../constants/Config';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors } from '../constants/Theme';

const QuizCreationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const editingQuiz = route.params?.quiz;

  const [quizTitle, setQuizTitle] = useState(editingQuiz?.title || '');
  const [quizDescription, setQuizDescription] = useState(editingQuiz?.description || '');
  const [questions, setQuestions] = useState(
    editingQuiz?.questions?.map((q) => ({
      text: q.questionText,
      options: q.answerOptions,
      correctAnswer: q.correctAnswer,
    })) || []
  );

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: [], correctAnswer: '' }]);
  };

  const removeQuestion = (index) => {
    const newQs = [...questions];
    newQs.splice(index, 1);
    setQuestions(newQs);
  };

  const updateQuestionText = (text, index) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const addOption = (questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const updateOptionText = (text, questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = text;
    setQuestions(newQuestions);
  };

  const setCorrectAnswer = (text, questionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = text;
    setQuestions(newQuestions);
  };

  const saveQuiz = async () => {
    try {
      const token = await AsyncStorage.getItem('token'); // Retrieve JWT from AsyncStorage
      if (!token) {
        console.error('No token found.');
        // Handle case where token is not available (e.g., navigate to login)
        return;
      }

      // Transform questions to match backend schema
      const formattedQuestions = questions.map((q) => ({
        questionText: q.text,
        answerOptions: q.options,
        correctAnswer: q.correctAnswer,
      }));

      const url = editingQuiz ? `${API_URL}/api/quizzes/${editingQuiz._id}` : `${API_URL}/api/quizzes/create`;
      const method = editingQuiz ? 'put' : 'post';

      const response = await axios[method](
        url,
        {
          title: quizTitle,
          description: quizDescription,
          questions: formattedQuestions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include JWT in headers
          },
        }
      );
      console.log('Quiz saved successfully:', response.data);
      Alert.alert('Success', `Quiz ${editingQuiz ? 'updated' : 'created'} successfully!`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);

      // Reset form
      setQuizTitle('');
      setQuizDescription('');
      setQuestions([]);
    } catch (error) {
      console.error('Error saving quiz:', error);
      Alert.alert('Error', 'Failed to create quiz.');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.flexContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>{editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Quiz Title"
              value={quizTitle}
              onChangeText={setQuizTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Quiz Description"
              value={quizDescription}
              onChangeText={setQuizDescription}
              multiline
            />

            <Text style={styles.sectionTitle}>Questions</Text>
            {questions.map((question, questionIndex) => (
              <Card key={questionIndex} style={styles.questionCard}>
                <Card.Title
                  title={`Question ${questionIndex + 1}`}
                  right={(props) => (
                    <IconButton {...props} icon="close" onPress={() => removeQuestion(questionIndex)} />
                  )}
                />
                <Card.Content>
                  <TextInput
                    mode="outlined"
                    label="Question Text"
                    value={question.text}
                    onChangeText={(text) => updateQuestionText(text, questionIndex)}
                  />
                  <Text style={styles.optionsTitle}>Options</Text>
                  {question.options.map((option, optionIndex) => (
                    <TextInput
                      key={optionIndex}
                      mode="outlined"
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChangeText={(text) => updateOptionText(text, questionIndex, optionIndex)}
                      style={{ marginBottom: 6 }}
                    />
                  ))}
                  <Button mode="outlined" onPress={() => addOption(questionIndex)}>
                    Add Option
                  </Button>
                  <TextInput
                    mode="outlined"
                    label="Correct Answer"
                    value={question.correctAnswer}
                    onChangeText={(text) => setCorrectAnswer(text, questionIndex)}
                    style={{ marginTop: 8 }}
                  />
                </Card.Content>
              </Card>
            ))}
            <Button mode="contained" onPress={addQuestion} style={{ marginTop: 8 }}>
              Add Question
            </Button>
          </ScrollView>

          {/* Footer Save button */}
          <View style={styles.footer}>
            <Button mode="contained" onPress={saveQuiz}>
              {editingQuiz ? 'Update Quiz' : 'Save Quiz'}
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    top: 10,
    textAlign: 'center',
    color: Colors.primary,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 6,
    marginBottom: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    left: 18,
    color: Colors.primary,
  },
  questionCard: {
    marginBottom: 10,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: Colors.background,
  },
  flexContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});

export default QuizCreationScreen;