import { useState, useEffect, useRef } from 'react';
import {View, Text, Modal, TouchableOpacity, ActivityIndicator,StyleSheet, ScrollView, TextInput, Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
import { BASE_URL } from '../config/api';

const COLORS = [
  { id: 'yellow', hex: '#FFD700' },
  { id: 'green',  hex: '#00C851' },
  { id: 'blue',   hex: '#00BFFF' },
  { id: 'pink',   hex: '#FF69B4' },
  { id: 'red',    hex: '#FF4444' },
];

function PdfViewer({ bookId, token }) {
  const [base64, setBase64]         = useState(null);
  const [fetchErr, setFetchErr]     = useState(null);
  const [webLoading, setWebLoading] = useState(true);
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [activeTool,  setActiveTool]  = useState('pen');
  const [activeColor, setActiveColor] = useState(COLORS[0].hex);
  const webRef = useRef(null);

  const sendCmd = (cmd) => webRef.current?.postMessage(JSON.stringify(cmd));

  const selectTool  = (tool)  => { setActiveTool(tool);   sendCmd({ type: 'SET_TOOL',  tool });  };
  const selectColor = (color) => { setActiveColor(color); sendCmd({ type: 'SET_COLOR', color }); };
  const clearPage   = () => {
    Alert.alert('Clear page', 'Remove all drawings on this page?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => sendCmd({ type: 'CLEAR' }) },
    ]);
  };

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
    .page-wrap{position:relative;display:block;margin-bottom:8px;touch-action:none}
    canvas.pdf-canvas{display:block;width:100%!important;height:auto!important}
    canvas.draw-canvas{position:absolute;top:0;left:0;width:100%!important;height:100%!important;touch-action:none}
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
    let activeTool = 'pen', activeColor = '#FFD700', isDrawing = false, currentCanvas = null;
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
          renders.push((function(pageNum) {
            return pdf.getPage(pageNum).then(page => {
              const scale = window.innerWidth / page.getViewport({ scale: 1 }).width;
              const vp = page.getViewport({ scale });
              const wrap = document.createElement('div');
              wrap.className = 'page-wrap';
              wrap.style.height = vp.height + 'px';
              const pdfC = document.createElement('canvas');
              pdfC.className = 'pdf-canvas';
              pdfC.width = vp.width; pdfC.height = vp.height;
              const drawC = document.createElement('canvas');
              drawC.className = 'draw-canvas';
              drawC.width = vp.width; drawC.height = vp.height;
              wrap.appendChild(pdfC); wrap.appendChild(drawC);
              viewer.appendChild(wrap);
              attachDrawing(drawC);
              return page.render({ canvasContext: pdfC.getContext('2d'), viewport: vp }).promise;
            });
          })(i));
        }
        return renders.reduce((p, r) => p.then(() => r), Promise.resolve());
      })
      .catch(err => {
        loadingEl.style.display = 'none';
        errorEl.style.display = 'block';
        errorEl.textContent = 'Render error: ' + (err.message || err);
      });
    function getPos(c, e) {
      const rect = c.getBoundingClientRect();
      const scaleX = c.width / rect.width, scaleY = c.height / rect.height;
      const src = e.touches ? e.touches[0] : e;
      return { x: (src.clientX - rect.left) * scaleX, y: (src.clientY - rect.top) * scaleY };
    }
    function applyTool(ctx) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (activeTool === 'pen') {
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 4; ctx.strokeStyle = activeColor; ctx.globalAlpha = 1;
      } else if (activeTool === 'highlight') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.lineWidth = 28; ctx.strokeStyle = activeColor; ctx.globalAlpha = 0.4;
      } else if (activeTool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 36; ctx.globalAlpha = 1;
      }
    }
    function attachDrawing(canvas) {
      function start(e) {
        e.preventDefault(); isDrawing = true; currentCanvas = canvas;
        const pos = getPos(canvas, e);
        const ctx = canvas.getContext('2d');
        applyTool(ctx); ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
      }
      function move(e) {
        if (!isDrawing || currentCanvas !== canvas) return;
        e.preventDefault();
        const pos = getPos(canvas, e);
        const ctx = canvas.getContext('2d');
        applyTool(ctx); ctx.lineTo(pos.x, pos.y); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
      }
      function stop(e) {
        if (!isDrawing || currentCanvas !== canvas) return;
        e.preventDefault(); isDrawing = false;
        canvas.getContext('2d').beginPath();
      }
      canvas.addEventListener('touchstart', start, { passive: false });
      canvas.addEventListener('touchmove',  move,  { passive: false });
      canvas.addEventListener('touchend',   stop,  { passive: false });
      canvas.addEventListener('mousedown',  start);
      canvas.addEventListener('mousemove',  move);
      canvas.addEventListener('mouseup',    stop);
      canvas.addEventListener('mouseleave', stop);
    }
    document.addEventListener('message', handle);
    window.addEventListener('message',   handle);
    function handle(e) {
      try {
        const cmd = JSON.parse(e.data);
        if (cmd.type === 'SET_TOOL')  activeTool  = cmd.tool;
        if (cmd.type === 'SET_COLOR') activeColor = cmd.color;
        if (cmd.type === 'CLEAR') {
          document.querySelectorAll('.draw-canvas').forEach(c => {
            const ctx = c.getContext('2d');
            ctx.globalCompositeOperation = 'source-over';
            ctx.clearRect(0, 0, c.width, c.height);
          });
        }
      } catch(_) {}
    }
  </script>
</body></html>`;

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.readerToolbar}>
        <TouchableOpacity
          style={[styles.toolToggleBtn, toolbarVisible && styles.toolToggleBtnActive]}
          onPress={() => setToolbarVisible(v => !v)}
        >
          <Text style={[styles.toolToggleText, toolbarVisible && { color: '#fff' }]}>
            ✏️ {toolbarVisible ? 'Hide Tools' : 'Drawing Tools'}
          </Text>
        </TouchableOpacity>
      </View>

      {toolbarVisible && (
        <View style={styles.drawToolbar}>
          <View style={styles.toolRow}>
            {[{ key: 'pen', label: '🖊 Pen' }, { key: 'highlight', label: '🖍 Highlight' }, { key: 'eraser', label: '🧹 Eraser' }].map(t => (
              <TouchableOpacity
                key={t.key}
                style={[styles.toolBtn, activeTool === t.key && styles.toolBtnActive]}
                onPress={() => selectTool(t.key)}
              >
                <Text style={[styles.toolBtnText, activeTool === t.key && { color: '#fff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.clearBtn} onPress={clearPage}>
              <Text style={styles.clearBtnText}>🗑 Clear</Text>
            </TouchableOpacity>
          </View>
          {activeTool !== 'eraser' && (
            <View style={styles.colorRow}>
              {COLORS.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.colorDot, { backgroundColor: c.hex }, activeColor === c.hex && styles.colorDotActive]}
                  onPress={() => selectColor(c.hex)}
                />
              ))}
            </View>
          )}
        </View>
      )}

      <WebView
        ref={webRef}
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

function BorrowForm({ book, token, onBack }) {
  const [data,    setData]    = useState({ fullName: '', phone: '', address: '', nationalId: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const fields = [
    { key: 'fullName',   label: 'Full Name',    placeholder: 'e.g. Ahmed Mohamed',         keyboardType: 'default'   },
    { key: 'phone',      label: 'Phone Number', placeholder: 'e.g. 01012345678',            keyboardType: 'phone-pad' },
    { key: 'address',    label: 'Address',      placeholder: 'e.g. 15 El-Tahrir St, Cairo', keyboardType: 'default'   },
    { key: 'nationalId', label: 'National ID',  placeholder: 'e.g. 29901011234567',         keyboardType: 'numeric'   },
  ];

  const handleSubmit = async () => {
    const empty = fields.find(f => !data[f.key].trim());
    if (empty) { setError(`${empty.label} is required`); return; }
    setError(''); setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/api/borrow`,
        { bookId: book._id, ...data },
        { headers: { 'x-auth-token': token } }
      );
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.msg || 'Something went wrong, please try again.');
    }
    setLoading(false);
  };

  if (success) return (
    <View style={styles.center}>
      <Text style={{ fontSize: 56, marginBottom: 16 }}>✅</Text>
      <Text style={styles.successTitle}>Request Sent!</Text>
      <Text style={styles.successSub}>
        Your borrow request for{'\n'}<Text style={{ fontWeight: '800' }}>{book?.title}</Text>{'\n'}has been submitted.{'\n'}The admin will review it shortly.
      </Text>
      <TouchableOpacity style={styles.submitBtn} onPress={onBack}>
        <Text style={styles.submitBtnText}>← Back to Book</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
      <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>📋</Text>
      <Text style={styles.formTitle}>Borrow Request</Text>
      <Text style={styles.formSub}>
        Fill in your details to borrow <Text style={{ fontWeight: '800' }}>{book?.title}</Text>
      </Text>
      {!!error && <View style={styles.errorBox}><Text style={styles.errorBoxText}>{error}</Text></View>}
      {fields.map(f => (
        <View key={f.key} style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{f.label} <Text style={{ color: '#e74c3c' }}>*</Text></Text>
          <TextInput
            style={styles.input}
            placeholder={f.placeholder}
            placeholderTextColor="#aaa"
            value={data[f.key]}
            onChangeText={v => setData(p => ({ ...p, [f.key]: v }))}
            keyboardType={f.keyboardType}
          />
        </View>
      ))}
      <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Request</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={onBack}>
        <Text style={styles.cancelBtnText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function PdfViewerModal({ book, token, onClose, isAdmin = false }) {
  const [mode, setMode] = useState('choose');
  useEffect(() => { setMode('choose'); }, [book?._id]);
  if (!book) return null;
  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={mode === 'choose' ? onClose : () => setMode('choose')} style={styles.backBtn}>
            <Text style={styles.backText}>{mode === 'choose' ? '← Back' : '← Back'}</Text>
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{book.title || 'Book'}</Text>
        </View>

        {mode === 'choose' && (
          <ScrollView contentContainerStyle={styles.chooseScroll}>
            <Text style={styles.chooseTitle}>{book?.title}</Text>
            <Text style={styles.chooseAuthor}>by {book?.author}</Text>
            {Array.isArray(book?.tags) && book.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {book.tags.map((tag, i) => (
                  <View key={tag._id || i} style={styles.tagChip}>
                    <Text style={styles.tagText}>{typeof tag === 'object' ? tag.name : tag}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.chooseDivider}>How would you like to access this book?</Text>
            <TouchableOpacity style={styles.readBtn} onPress={() => setMode('reading')}>
              <Text style={{ fontSize: 32 }}>💻</Text>
              <Text style={styles.readBtnTitle}>Read Online</Text>
              <Text style={styles.readBtnSub}>Open now in your browser</Text>
            </TouchableOpacity>
            {!isAdmin && (
              <TouchableOpacity style={styles.borrowBtn} onPress={() => setMode('borrow')}>
                <Text style={{ fontSize: 32 }}>📦</Text>
                <Text style={styles.borrowBtnTitle}>Borrow Book</Text>
                <Text style={styles.borrowBtnSub}>Request a physical copy</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        )}

        {mode === 'reading' && <PdfViewer bookId={book._id} token={token} />}
        {mode === 'borrow'  && <BorrowForm book={book} token={token} onBack={() => setMode('choose')} />}
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

  readerToolbar: {
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#e8dcc8',
  },
  toolToggleBtn: {
    alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#C5A059',
  },
  toolToggleBtnActive: { backgroundColor: '#C5A059' },
  toolToggleText:      { color: '#C5A059', fontWeight: '700', fontSize: 13 },
  drawToolbar: { backgroundColor: '#002147', paddingHorizontal: 12, paddingVertical: 10, gap: 10 },
  toolRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  toolBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(197,160,89,0.5)',
  },
  toolBtnActive: { backgroundColor: '#C5A059', borderColor: '#C5A059' },
  toolBtnText:   { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  clearBtn:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#ff5c5c', marginLeft: 'auto' },
  clearBtnText:  { color: '#ff5c5c', fontSize: 12, fontWeight: '700' },
  colorRow:      { flexDirection: 'row', gap: 10, paddingLeft: 2 },
  colorDot:      { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive:{ borderColor: '#fff', transform: [{ scale: 1.2 }] },

  chooseScroll:   { padding: 24, alignItems: 'center' },
  chooseTitle:    { fontSize: 22, fontWeight: '900', color: '#002147', textAlign: 'center', marginBottom: 6 },
  chooseAuthor:   { fontSize: 14, color: '#8e7f68', marginBottom: 14 },
  chooseDivider:  { fontSize: 15, fontWeight: '600', color: '#555', marginVertical: 20, textAlign: 'center' },
  tagsRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 4 },
  tagChip:        { backgroundColor: '#f0e8d5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  tagText:        { fontSize: 12, color: '#C5A059', fontWeight: '700' },
  readBtn:        { width: '100%', backgroundColor: '#2980b9', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 14, gap: 6 },
  readBtnTitle:   { color: '#fff', fontSize: 17, fontWeight: '800' },
  readBtnSub:     { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  borrowBtn:      { width: '100%', backgroundColor: '#e67e22', borderRadius: 16, padding: 20, alignItems: 'center', gap: 6 },
  borrowBtnTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  borrowBtnSub:   { color: 'rgba(255,255,255,0.8)', fontSize: 13 },

  formScroll:   { padding: 24 },
  formTitle:    { fontSize: 22, fontWeight: '900', color: '#002147', textAlign: 'center', marginBottom: 6 },
  formSub:      { fontSize: 14, color: '#8e7f68', textAlign: 'center', marginBottom: 20 },
  fieldWrap:    { marginBottom: 14 },
  fieldLabel:   { fontSize: 13, fontWeight: '700', color: '#333', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e8dcc8', borderRadius: 10,
    padding: 12, fontSize: 14, color: '#333', backgroundColor: '#fff',
  },
  errorBox:     { backgroundColor: '#fdecea', borderWidth: 1, borderColor: '#e74c3c', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorBoxText: { color: '#c0392b', fontSize: 13 },
  submitBtn:    { backgroundColor: '#C5A059', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitBtnText:{ color: '#fff', fontSize: 16, fontWeight: '800' },
  cancelBtn:    { padding: 14, alignItems: 'center', marginTop: 6 },
  cancelBtnText:{ color: '#C5A059', fontWeight: '700', fontSize: 14 },
  successTitle: { fontSize: 22, fontWeight: '900', color: '#27ae60', marginBottom: 12 },
  successSub:   { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24, marginBottom: 24 },
});