import { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

function PdfViewer({ url }) {
  const [webLoading, setWebLoading] = useState(true);
  const [error, setError] = useState(false);

  const pdfJsHtml = `<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#fdfaf6}
    canvas{display:block;width:100%!important;height:auto!important;margin-bottom:8px}
    #loading{color:#8e7f68;text-align:center;padding:40px 20px;font-family:sans-serif;font-size:15px}
    #error{color:#c0392b;text-align:center;padding:40px 20px;font-family:sans-serif;display:none}
  </style>
</head><body>
  <div id="loading">Rendering PDF…</div>
  <div id="viewer"></div>
  <div id="error"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const pdfUrl = ${JSON.stringify(url)};
    const viewer = document.getElementById('viewer');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');

    pdfjsLib.getDocument({ url: pdfUrl, withCredentials: false }).promise
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
        errorEl.textContent = 'Failed to load PDF: ' + (err.message || String(err));
      });
  </script>
</body></html>`;

  return (
    <View style={{ flex: 1 }}>
      <WebView
        source={{ html: pdfJsHtml }}
        style={{ flex: 1 }}
        onLoadEnd={() => setWebLoading(false)}
        onError={() => { setWebLoading(false); setError(true); }}
        originWhitelist={['*']}
        javaScriptEnabled
        mixedContentMode="always"
      />
      {webLoading && !error && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#C5A059" />
          <Text style={styles.loadingText}>Loading PDF…</Text>
        </View>
      )}
      {error && (
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load PDF</Text>
        </View>
      )}
    </View>
  );
}

export default function PdfViewerModal({ book, onClose }) {
  if (!book) return null;

  const url = book.pdfUrl || book.pdfPath || '';
  const isPdf = url.toLowerCase().includes('.pdf');

  if (!isPdf) return null;

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{book.title || 'Book'}</Text>
        </View>
        <PdfViewer url={url} />
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
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  overlay: {
    ...StyleSheet.absoluteFillObject, justifyContent: 'center',
    alignItems: 'center', backgroundColor: 'rgba(253,250,246,0.88)', gap: 12,
  },
  loadingText: { color: '#8e7f68', fontSize: 14, fontWeight: '600' },
  errorText:   { fontSize: 15, fontWeight: '700', color: '#c0392b' },
});
