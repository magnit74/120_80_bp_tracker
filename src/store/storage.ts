import AsyncStorage from '@react-native-async-storage/async-storage';

export interface BloodPressureRecord {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number;
  tags: string[];
  timestamp: number;
}

const STORAGE_KEY = '@bp_records';

export const saveRecord = async (record: Omit<BloodPressureRecord, 'id' | 'timestamp'>) => {
  try {
    const newRecord: BloodPressureRecord = {
      ...record,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11),
      timestamp: Date.now(),
    };

    const existingRecords = await getRecords();
    const updatedRecords = [newRecord, ...existingRecords];

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecords));

    return newRecord;
  } catch (error) {
    console.error('Error saving record', error);
    throw error;
  }
};

export const getRecords = async (): Promise<BloodPressureRecord[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error reading records', error);
    return [];
  }
};

export const clearRecords = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing records', error);
  }
};
