import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { BASE_URL } from '../config/api';


function PdfViewer({ bookId, token }) {
  const [base64, setBase64]         = useState(null);
  const [fetchErr, setFetchErr]     = useState(null);
  const [webLoading, setWebLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/books/${bookId}/view`, {
          headers: { 'x-auth-token': token },
          responseType: 'arraybuffer',
          timeout: 60000,
        });
        if (cancelled) return;

        const bytes = new Uint8Array(res.data);
        let bin = '';
        const chunk = 8192;
        for (let i = 0; i < bytes.length; i += chunk) {
          bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        setBase64(btoa(bin));
      } catch (err) {
        if (!cancelled) {
          const msg = err.response?.data?.msg || err.message || 'Failed to fetch PDF';
          setFetchErr(msg);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [bookId, token]);

  if (fetchErr) return (
    <View style={styles.center}>
      <Text style={styles.errorIcon}>📄</Text>
      <Text style={styles.errorText}>Could not load book</Text>
      <Text style={styles.errorSub}>{fetchErr}</Text>
    </View>
  );

  if (!base64) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#C5A059" />
      <Text style={styles.loadingText}>Fetching PDF…</Text>
    </View>
  );

  const html = `<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#fdfaf6}
    canvas{display:block;width:100%!important;height:auto!important;margin-bottom:8px}
    #loading{color:#8e7f68;text-align:center;padding:40px 20px;font-family:sans-serif}
    #error{color:#c0392b;text-align:center;padding:40px 20px;font-family:sans-serif;display:none}
  </style>
</head><body>
  <div id="loading">Rendering pages…</div>
  <div id="viewer"></div>
  <div id="error"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const b64 = ${JSON.stringify(base64)};
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const viewer = document.getElementById('viewer');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    pdfjsLib.getDocument({ data: bytes }).promise
      .then(pdf => {
        loadingEl.style.display = 'none';
        const renders = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          renders.push(pdf.getPage(i).then(page => {
            const scale = window.innerWidth / page.getViewport({ scale: 1 }).width;
            const vp = page.getViewport({ scale });
            const c = document.createElement('canvas');
            c.width = vp.width; c.height = vp.height;
            viewer.appendChild(c);
            return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
          }));
        }
        return renders.reduce((p, r) => p.then(() => r), Promise.resolve());
      })
      .catch(err => {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = 'Render error: ' + (err.message || err);
      });
  </script>
</body></html>`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html }}
        style={{ flex: 1 }}
        onLoadEnd={() => setWebLoading(false)}
        originWhitelist={['*']}
        javaScriptEnabled
        mixedContentMode="always"
      />
      {webLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Rendering PDF…</Text>
        </View>
      )}
    </View>
  );
}

export default function PdfViewerModal({ book, token, onClose }) {
  if (!book) return null;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{book.title || 'Book'}</Text>
        </View>
        <PdfViewer bookId={book._id} token={token} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfaf6' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e8dcc8', gap: 12,
  },
  backBtn:     { paddingVertical: 4, paddingHorizontal: 2 },
  backText:    { color: '#C5A059', fontWeight: '700', fontSize: 15 },
  title:       { flex: 1, fontSize: 15, fontWeight: '700', color: '#2c3e50' },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 24 },
  overlay: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center',
    alignItems: 'center', backgroundColor: 'rgba(253,250,246,0.9)', gap: 12,
  },
  loadingText: { color: '#8e7f68', fontSize: 14, fontWeight: '600' },
  errorIcon:   { fontSize: 40 },
  errorText:   { fontSize: 16, fontWeight: '700', color: '#c0392b' },
  errorSub:    { fontSize: 13, color: '#8e7f68', textAlign: 'center' },
});
