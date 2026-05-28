import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert, ScrollView } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CVScreen() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [rewritten, setRewritten] = useState('');
  const [loading, setLoading] = useState(false);

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pick({ type: [DocumentPicker.types.pdf, DocumentPicker.types.docx] });
      setFile(res[0]);
    } catch (err) { console.log(err); }
  };

  const uploadAndRewrite = async () => {
    if (!file) return Alert.alert('Select a file');
    setLoading(true);
    const formData = new FormData();
    formData.append('cv', { uri: file.uri, name: file.name, type: file.type });
    if (jobDesc) formData.append('jobDescription', jobDesc);
    
    try {
      const token = await AsyncStorage.getItem('token');
      const uploadRes = await axios.post('http://your-backend/api/cv/upload', formData, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      const rewriteRes = await axios.post('http://your-backend/api/cv/rewrite', { cvId: uploadRes.data.cvId, jobDescription: jobDesc }, { headers: { Authorization: `Bearer ${token}` } });
      setRewritten(rewriteRes.data.rewrittenText);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Button title="Select CV (PDF/DOCX)" onPress={pickDocument} />
      {file && <Text>Selected: {file.name}</Text>}
      <TextInput placeholder="Job Description (optional)" value={jobDesc} onChangeText={setJobDesc} style={{ borderWidth: 1, marginVertical: 10, padding: 8 }} multiline />
      <Button title={loading ? 'Processing...' : 'Rewrite CV'} onPress={uploadAndRewrite} disabled={loading} />
      {rewritten !== '' && <Text style={{ marginTop: 20 }}>{rewritten}</Text>}
    </ScrollView>
  );
}
