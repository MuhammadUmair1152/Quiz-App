import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';
import { Colors } from './constants/Theme';

import AuthScreen from './screens/AuthScreen';
import TeacherDashboardScreen from './screens/TeacherDashboardScreen.js';
import StudentDashboardScreen from './screens/StudentDashboardScreen.js';
import QuizCreationScreen from './screens/QuizCreationScreen.js';
import AssignedQuizzesScreen from './screens/AssignedQuizzesScreen.js';
import QuizAttemptScreen from './screens/QuizAttemptScreen.js';
import QuizResultScreen from './screens/QuizResultScreen.js';
import StudentResultsScreen from './screens/StudentResultsScreen.js';
import AssignQuizScreen from './screens/AssignQuizScreen.js';

const Stack = createStackNavigator();

function App() {
  const theme = {
    ...PaperDefaultTheme,
    colors: {
      ...PaperDefaultTheme.colors,
      primary: Colors.primary,
      accent: Colors.secondary,
      background: Colors.background,
      text: Colors.textDark,
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth">
          <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="TeacherDashboard" component={TeacherDashboardScreen} />
          <Stack.Screen name="StudentDashboard" component={StudentDashboardScreen} />
          <Stack.Screen name="QuizCreation" component={QuizCreationScreen} />
          <Stack.Screen name="AssignedQuizzes" component={AssignedQuizzesScreen} />
          <Stack.Screen name="QuizAttempt" component={QuizAttemptScreen} />
          <Stack.Screen name="QuizResult" component={QuizResultScreen} />
          <Stack.Screen name="StudentResults" component={StudentResultsScreen} />
          <Stack.Screen name="AssignQuiz" component={AssignQuizScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default App;