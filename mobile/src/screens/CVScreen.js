import React, { useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function CVScreen() {
  const [file, setFile] = useState(null);
  const [jobDesc, setJobDesc] = useState('');
  const [rewritten, setRewritten] = useState('');
  const pick = async () => { const res = await DocumentPicker.pick({ type: [DocumentPicker.types.pdf] }); setFile(res[0]); };
  const upload = async () => {
    if(!file) return;
    const fd = new FormData(); fd.append('cv', { uri: file.uri, name: file.name, type: file.type });
    const token = await AsyncStorage.getItem('token');
    const uploadRes = await axios.post('http://your-backend/api/cv/upload', fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
    const rewriteRes = await axios.post('http://your-backend/api/cv/rewrite', { cvId: uploadRes.data.cvId, jobDescription: jobDesc }, { headers: { Authorization: `Bearer ${token}` } });
    setRewritten(rewriteRes.data.rewrittenText);
  };
  return (<View><Button title="Select PDF" onPress={pick} /><TextInput placeholder="Job description" value={jobDesc} onChangeText={setJobDesc} /><Button title="Rewrite" onPress={upload} /><Text>{rewritten}</Text></View>);
}
