import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  SafeAreaView, TextInput, FlatList, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';
import axios from 'axios';
import { BASE_URL, GROQ_API_KEY } from '../config/api';

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your Library Assistant. I can help you find books, summarize them, and answer your questions!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [books, setBooks] = useState([]);
  
  const flatListRef = useRef(null);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/books`)
      .then(res => setBooks(res.data))
      .catch(() => {});
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const booksContext = books.length > 0
        ? `Available books:\n${books.map(b => `- "${b.title}" by ${b.author}`).join('\n')}`
        : 'No books available currently.';

      const systemPrompt = {
        role: 'system',
        content: `You are a helpful library assistant. ${booksContext} 
        Respond in the same language the user uses (Arabic or English). 
        If the user speaks Arabic, reply in professional and friendly Arabic.`
      };

      const cleanedHistory = messages.map(({ role, content }) => ({ role, content }));

      const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: 'llama-3.3-70b-versatile',
        messages: [systemPrompt, ...cleanedHistory, userMessage],
        max_tokens: 500
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      });

      const reply = res.data.choices?.[0]?.message?.content || 'Empty response';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[
      styles.bubble,
      item.role === 'user' ? styles.userBubble : styles.assistantBubble
    ]}>
      <Text style={{ color: item.role === 'user' ? 'white' : 'black', fontSize: 14 }}>
        {item.content}
      </Text>
    </View>
  );

  return (
    <View>
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setIsOpen(true)}
      >
        <Text style={{ fontSize: 24, color: 'white' }}>💬</Text>
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📚 Library Assistant</Text>
            <TouchableOpacity onPress={() => setIsOpen(false)}>
              <Text style={{ color: 'white', fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(_, i) => i.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 15 }}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          />

          {loading && <Text style={styles.typing}>Typing...</Text>}

          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <View style={styles.inputArea}>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={setInput}
                placeholder="Type a message..."
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white' }}>Send</Text>}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute', bottom: 90, right: 20,
    width: 55, height: 55, borderRadius: 27.5,
    backgroundColor: '#002147', justifyContent: 'center', alignItems: 'center',
    elevation: 5
  },
  container: { flex: 1, backgroundColor: 'white' },
  header: {
    backgroundColor: '#002147', padding: 15,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  headerTitle: { color: 'white', fontWeight: 'bold' },
  bubble: {
    padding: 10, borderRadius: 12, marginBottom: 10, maxWidth: '80%'
  },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#002147' },
  assistantBubble: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0' },
  typing: { paddingLeft: 15, color: '#999', fontSize: 12, marginBottom: 5 },
  inputArea: {
    flexDirection: 'row', padding: 10, borderTopWidth: 1, borderColor: '#eee', backgroundColor: 'white'
  },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginRight: 5, color: 'black' },
  sendBtn: { backgroundColor: '#C5A059', padding: 10, borderRadius: 5, justifyContent: 'center' }
});