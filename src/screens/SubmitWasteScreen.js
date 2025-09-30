import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import apiService from '../services/api';

const WASTE_TYPES = [
  { label: 'Select waste type...', value: '' },
  { label: 'Plastic', value: 'PLASTIC' },
  { label: 'Paper', value: 'PAPER' },
  { label: 'Metal', value: 'METAL' },
  { label: 'E-Waste', value: 'E_WASTE' },
  { label: 'Glass', value: 'GLASS' },
  { label: 'Other', value: 'OTHER' },
];

export default function SubmitWasteScreen({ navigation }) {
  const [wasteType, setWasteType] = useState('');
  const [weight, setWeight] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!wasteType || !weight) {
      Alert.alert('Error', 'Please select waste type and enter weight');
      return;
    }

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 200) {
      Alert.alert('Error', 'Please enter a valid weight between 0.1 and 200 kg');
      return;
    }

    setLoading(true);
    try {
      const wasteData = {
        type: wasteType,
        weightKg: weightNum,
      };

      if (location.trim()) {
        wasteData.location = {
          lat: 0, // You could integrate with location services
          lng: 0,
          address: location.trim(),
        };
      }

      const response = await apiService.submitWaste(wasteData);
      
      Alert.alert(
        'Success!',
        'Your waste submission has been recorded and is pending review. You will earn points once approved!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Submission Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Ionicons name="leaf" size={48} color="#2e7d32" />
          <Text style={styles.title}>Submit Recyclable Waste</Text>
          <Text style={styles.subtitle}>
            Help the environment and earn points!
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Waste Type *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={wasteType}
              onValueChange={setWasteType}
              style={styles.picker}
            >
              {WASTE_TYPES.map((type) => (
                <Picker.Item
                  key={type.value}
                  label={type.label}
                  value={type.value}
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Weight (kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter weight in kilograms"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Location (Optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter pickup location or address"
            value={location}
            onChangeText={setLocation}
            multiline
            numberOfLines={3}
          />

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#2e7d32" />
            <Text style={styles.infoText}>
              Your submission will be reviewed by our team. Points will be awarded based on the type and weight of recyclable materials.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Submitting...' : 'Submit Waste'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: 'white',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e8',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});