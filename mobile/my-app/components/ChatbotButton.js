import { useState } from 'react';
import {
  View, TouchableOpacity, Text, StyleSheet,
  Modal, SafeAreaView, TouchableWithoutFeedback,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function ChatbotButton() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      {/* Floating button */}
      <TouchableOpacity style={styles.fab} onPress={() => setVisible(true)}>
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>

      {/* Chat modal */}
      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setVisible(false)}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <SafeAreaView style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>LEARN<Text style={styles.headerOva}>OVA</Text> Assistant</Text>
            <TouchableOpacity onPress={() => setVisible(false)} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Chatbase WebView */}
          <WebView
            source={{ uri: 'https://www.chatbase.co/chatbot-iframe/1z-0HVnhilJA-GBj4C31a' }}
            style={styles.webview}
            startInLoadingState
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#C5A059',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 999,
  },
  fabIcon: { fontSize: 24 },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    height: '75%',
    backgroundColor: '#fdfaf6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#fdfaf6',
    borderBottomWidth: 2,
    borderBottomColor: '#C5A059',
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#2c3e50' },
  headerOva: { color: '#C5A059' },
  closeBtn: { padding: 4 },
  closeText: { fontSize: 16, color: '#8e7f68', fontWeight: '700' },
  webview: { flex: 1 },
});
