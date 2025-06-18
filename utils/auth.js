import AsyncStorage from '@react-native-async-storage/async-storage';

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
};

export const setUserEmail = async (email) => {
  try {
    await AsyncStorage.setItem('email', email);
  } catch (error) {
    console.error('Failed to store user email:', error);
  }
};

export const getUserEmail = async () => {
  try {
    return await AsyncStorage.getItem('email');
  } catch (error) {
    console.error('Failed to retrieve user email:', error);
    return null;
  }
}; 