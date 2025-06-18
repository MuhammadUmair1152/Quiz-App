import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants/Config';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../constants/Theme';
import { Card, Button, Avatar, Portal, Dialog, TextInput, HelperText, ActivityIndicator } from 'react-native-paper';
import { getUserEmail } from '../utils/auth';

const AssignedQuizzesScreen = () => {
  const navigation = useNavigation();
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // OTP related state
  const [otpDialogVisible, setOtpDialogVisible] = useState(false);
  const [currentQuizId, setCurrentQuizId] = useState(null);
  const [otpValue, setOtpValue] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState(null);

  useEffect(() => {
    fetchAssignedQuizzes();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchAssignedQuizzes();
    }, [])
  );

  const fetchAssignedQuizzes = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/quizzes/assigned`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const quizzesList = Array.isArray(response.data) ? response.data : response.data.assignedQuizzes;
      setAssignedQuizzes(quizzesList);
    } catch (err) {
      setError('Failed to fetch assigned quizzes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const requestOtpAndShowDialog = async (quizId) => {
    setCurrentQuizId(quizId);
    setOtpDialogVisible(true);
    setSendingOtp(true);
    setOtpValue('');
    setOtpError(null);

    try {
      const email = await getUserEmail();
      const token = await AsyncStorage.getItem('token');
      if (!email || !token) {
        setError('Unable to retrieve auth details. Please login again.');
        setSendingOtp(false);
        return;
      }

      await axios.post(
        `${API_URL}/api/otp/send`,
        { email },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error('Failed to request OTP:', err);
      setError('Failed to request OTP. Please try again later.');
      setOtpDialogVisible(false);
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtpAndStartQuiz = async () => {
    setVerifyingOtp(true);
    try {
      const email = await getUserEmail();
      const token = await AsyncStorage.getItem('token');
      if (!email || !token) {
        setOtpError('Unable to retrieve auth details. Please login again.');
        setVerifyingOtp(false);
        return;
      }

      const otpTrim = otpValue.trim();
      console.log('Verifying OTP', otpTrim, 'for', email);

      const res = await axios.post(
        `${API_URL}/api/otp/verify`,
        { email, otp: otpTrim },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log('Verify response', res.data);

      if (res.data && res.data.success) {
        setOtpDialogVisible(false);
        navigation.navigate('QuizAttempt', { quizId: currentQuizId });
      } else {
        setOtpError('Invalid OTP. Please try again.');
      }
    } catch (err) {
      console.error('OTP verification failed:', err.response?.data || err.message);
      setOtpError('Verification failed. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const renderQuizItem = ({ item }) => {
    const { quiz, teacher } = item;
    return (
      <Card style={styles.card}>
        <Card.Title
          title={`Quiz Title: ${quiz.title}`}
          subtitle={`Assigned by: ${teacher?.fullName || teacher?.email || 'Teacher'}`}
          left={(props) => <Avatar.Icon {...props} icon="clipboard-text" />}
        />
        <Card.Content>
          {quiz.description ? (
            <Text style={styles.description}>{quiz.description}</Text>
          ) : null}
        </Card.Content>
        <Card.Actions>
          <Button mode="contained" onPress={() => requestOtpAndShowDialog(quiz._id)}>
            Start Quiz
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assigned Quizzes List</Text>
      {loading && <Text>Loading assigned quizzes...</Text>}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {!loading && !error && assignedQuizzes.length === 0 && (
        <Text>No quizzes assigned yet.</Text>
      )}
      {!loading && !error && assignedQuizzes.length > 0 && (
        <FlatList
          data={assignedQuizzes}
          renderItem={renderQuizItem}
          keyExtractor={(item) => item.quiz._id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* OTP Dialog */}
      <Portal>
        <Dialog visible={otpDialogVisible} onDismiss={() => setOtpDialogVisible(false)}>
          <Dialog.Title>Verify OTP</Dialog.Title>
          <Dialog.Content>
            {sendingOtp ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <ActivityIndicator animating size="large" />
                <Text style={{ marginTop: 10 }}>Sending OTP...</Text>
              </View>
            ) : (
              <>
                <Text>Please enter the OTP sent to your registered email to start the quiz.</Text>
                <TextInput
                  label="OTP"
                  mode="outlined"
                  keyboardType="numeric"
                  value={otpValue}
                  onChangeText={(text) => {
                    setOtpValue(text);
                    if (otpError) setOtpError(null);
                  }}
                  style={{ marginTop: 12 }}
                />
                {otpError ? <HelperText type="error" visible>{otpError}</HelperText> : null}
              </>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOtpDialogVisible(false)} disabled={verifyingOtp || sendingOtp}>Cancel</Button>
            <Button
              mode="contained"
              onPress={verifyOtpAndStartQuiz}
              loading={verifyingOtp}
              disabled={verifyingOtp || sendingOtp || otpValue.length === 0}
            >
              Verify & Start
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.primary,
  },
  listContent: {
    width: '100%',
    paddingHorizontal: 20,
  },
  card: {
    marginBottom: 16,
    width: '100%',
    alignSelf: 'center',
    elevation: 3,
  },
  description: {
    color: Colors.textDark,
    marginBottom: 8,
    fontSize: 16,
  },
  errorText: {
    color: Colors.danger,
    marginTop: 10,
  },
});

export default AssignedQuizzesScreen;
