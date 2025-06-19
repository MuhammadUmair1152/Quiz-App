import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import { API_URL } from '../constants/Config';
import { Colors } from '../constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const StudentResultsScreen = () => {
  const route = useRoute();
  const quizId = route.params?.quizId; // present when teacher views results

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const url = quizId
        ? `${API_URL}/api/quizzes/${quizId}/results`
        : `${API_URL}/api/results/my`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Handle different response structures
      let resultsData = [];
      if (quizId) {
        // Teacher viewing quiz results - response is direct array
        resultsData = res.data || [];
      } else {
        // Student viewing their results - response might be nested
        resultsData = res.data.studentResults || res.data || [];
      }
      
      setResults(resultsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const renderItem = ({ item }) => {
    const studentMode = !quizId;
    const primaryText = studentMode
      ? item.quiz?.title || 'Quiz'
      : item.student?.fullName || item.student?.email || 'Student';

    const percentage = item.percentage != null ? item.percentage : null;

    // Determine status label
    let statusLabel = 'Pending';
    let statusStyle = styles.pending;

    if (percentage != null) {
      if (percentage >= 50) {
        statusLabel = 'Passed';
        statusStyle = styles.passed;
      } else {
        statusLabel = 'Failed';
        statusStyle = styles.failed;
      }
    }

    const percentageText = percentage != null ? `${percentage.toFixed(1)}%` : '--';

    return (
      <View style={styles.row}>
        <Text style={[styles.cellName]}>{primaryText}</Text>
        <Text style={[styles.cellStatus, statusStyle]}>{statusLabel}</Text>
        <Text style={styles.cellScore}>{percentageText}</Text>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (error) return (
    <View style={styles.container}>
      <Text>{error}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Results</Text>
      {results.length === 0 ? (
        <Text>No results found.</Text>
      ) : (
        <>
        <View style={styles.tableHeader}>
          <Text style={[styles.cellName, styles.headerText]}>{quizId ? 'Student' : 'Quiz'}</Text>
          <Text style={[styles.cellStatus, styles.headerText]}>Status</Text>
          <Text style={[styles.cellScore, styles.headerText]}>Score</Text>
        </View>
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchResults} />}
        />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: Colors.primary,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e0e0e0',
  },
  cellName: { flex: 2 },
  cellStatus: { flex: 1, textAlign: 'center' },
  cellScore: { flex: 1, textAlign: 'right' },
  pending: { color: Colors.secondary },
  headerText: { fontWeight: 'bold' },
  passed: { color: Colors.success },
  failed: { color: Colors.danger },
});

export default StudentResultsScreen;