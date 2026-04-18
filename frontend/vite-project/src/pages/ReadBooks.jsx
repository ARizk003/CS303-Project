import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;
const API_URL = "http://localhost:5000";

const COLORS = [
  { id: "yellow", code: "rgba(255, 255, 0, 0.4)" },
  { id: "green",  code: "rgba(0, 255, 0, 0.3)" },
  { id: "blue",   code: "rgba(0, 255, 255, 0.3)" },
  { id: "pink",   code: "rgba(255, 0, 255, 0.3)" },
];

export default function ReadBook() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};

  // ─── Mode: "choose" | "reading" | "borrow-form" ───
  const [mode, setMode] = useState("choose");

  // ─── Borrow state ───
  const [borrowData, setBorrowData] = useState({ fullName: "", phone: "", address: "", nationalId: "" });
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [borrowError, setBorrowError] = useState("");

  // ─── PDF reader state ───
  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const isDrawing = useRef(false);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTool, setActiveTool] = useState("pen"); // pen | highlight | eraser
  const [activeColor, setActiveColor] = useState(COLORS[0].code);

  // ─── Clear drawings for current page ───
  const clearAllDrawings = () => {
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      localStorage.removeItem(`drawings_${book?._id}_${currentPage}`);
    }
  };

  // ─── Render PDF page ───
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    const page = await pdfDocRef.current.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas = canvasRef.current;
    const drawCanvas = drawingCanvasRef.current;

    canvas.height = drawCanvas.height = viewport.height;
    canvas.width  = drawCanvas.width  = viewport.width;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    // Restore saved drawings for this page
    const savedDraw = localStorage.getItem(`drawings_${book?._id}_${pageNum}`);
    if (savedDraw) {
      const drawCtx = drawCanvas.getContext("2d");
      const img = new Image();
      img.src = savedDraw;
      img.onload = () => drawCtx.drawImage(img, 0, 0);
    }
  }, [book?._id]);

  // ─── Load PDF when entering reading mode ───
  useEffect(() => {
    if (mode !== "reading") return;
    if (!book?._id) { navigate("/books"); return; }

    const start = async () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      const res = await fetch(`${API_URL}/api/books/${book._id}/view`, {
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      const blob = await res.blob();
      const pdf = await window.pdfjsLib.getDocument(URL.createObjectURL(blob)).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      setLoading(false);
      renderPage(1);
    };

    const init = async () => {
      if (!window.pdfjsLib) {
        const s = document.createElement("script");
        s.src = `${PDFJS_CDN}/pdf.min.js`;
        document.head.appendChild(s);
        s.onload = start;
      } else {
        start();
      }
    };

    init();
  }, [mode, book, navigate, renderPage]);

  // ─── Re-render on page change ───
  useEffect(() => {
    if (!loading && mode === "reading") renderPage(currentPage);
  }, [currentPage, loading, renderPage, mode]);

  // ─── Drawing logic ───
  const draw = (e) => {
    if (!isDrawing.current) return;
    const ctx = drawingCanvasRef.current.getContext("2d");
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (activeTool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth = 3;
      ctx.strokeStyle = activeColor.replace("0.4", "1").replace("0.3", "1");
    } else if (activeTool === "highlight") {
      ctx.globalCompositeOperation = "multiply";
      ctx.lineWidth = 25;
      ctx.strokeStyle = activeColor;
    } else if (activeTool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = 40;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleStopDrawing = () => {
    isDrawing.current = false;
    drawingCanvasRef.current.getContext("2d").beginPath();
    localStorage.setItem(
      `drawings_${book?._id}_${currentPage}`,
      drawingCanvasRef.current.toDataURL()
    );
  };

  // ─── Borrow submit ───
  const handleBorrowSubmit = async (e) => {
    e.preventDefault();
    setBorrowError("");
    setBorrowLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/borrow`,
        { bookId: book._id, ...borrowData },
        { headers: { "x-auth-token": token } }
      );
      setBorrowSuccess(true);
    } catch (err) {
      setBorrowError(err.response?.data?.msg || "Something went wrong, please try again.");
    }
    setBorrowLoading(false);
  };

  // ════════════════════════════════════════
  //  SCREEN 1 – Choose mode
  // ════════════════════════════════════════
  if (mode === "choose") {
    return (
      <div style={chooseStyles.overlay}>
        <div style={chooseStyles.card}>
          <button onClick={() => navigate(-1)} style={chooseStyles.closeBtn}>✕</button>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}>📖</div>
          <h2 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#1a1a1a", marginBottom: 4 }}>{book?.title}</h2>
          <p style={{ color: "#888", marginBottom: 20, fontSize: "0.95rem" }}>by {book?.author}</p>
          <p style={{ color: "#555", marginBottom: 28, fontSize: "1rem" }}>How would you like to access this book?</p>
          <div style={chooseStyles.btnGroup}>
            <button style={chooseStyles.readBtn} onClick={() => setMode("reading")}>
              <span style={{ fontSize: "1.5rem" }}>💻</span>
              <strong>Read Online</strong>
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>Open now in your browser</span>
            </button>
            <button style={chooseStyles.borrowBtn} onClick={() => setMode("borrow-form")}>
              <span style={{ fontSize: "1.5rem" }}>📦</span>
              <strong>Borrow Book</strong>
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>Request a physical copy</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  //  SCREEN 2 – Borrow form
  // ════════════════════════════════════════
  if (mode === "borrow-form") {
    return (
      <div style={chooseStyles.overlay}>
        <div style={{ ...chooseStyles.card, maxWidth: 520, padding: "40px 36px" }}>
          <button
            onClick={() => { setBorrowSuccess(false); setBorrowError(""); setMode("choose"); }}
            style={chooseStyles.closeBtn}
          >✕</button>

          {borrowSuccess ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>✅</div>
              <h3 style={{ color: "#27ae60", fontWeight: 700, marginBottom: 8 }}>Request Sent!</h3>
              <p style={{ color: "#555", marginBottom: 24 }}>
                Your borrow request for <strong>{book?.title}</strong> has been submitted.<br />
                The admin will review it shortly.
              </p>
              <button
                style={{ ...chooseStyles.readBtn, flexDirection: "row", justifyContent: "center", gap: 8, padding: 14 }}
                onClick={() => navigate("/books")}
              >
                Back to Library
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}>📋</div>
                <h3 style={{ fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Borrow Request</h3>
                <p style={{ color: "#888", fontSize: "0.9rem" }}>
                  Fill in your details to borrow <strong>{book?.title}</strong>
                </p>
              </div>

              {borrowError && (
                <div style={{ background: "#fdecea", border: "1px solid #e74c3c", borderRadius: 10, padding: "10px 14px", marginBottom: 16, color: "#c0392b", fontSize: "0.88rem" }}>
                  ⚠️ {borrowError}
                </div>
              )}

              <form onSubmit={handleBorrowSubmit}>
                {[
                  { label: "Full Name",    key: "fullName",  placeholder: "e.g. Ahmed Mohamed",      type: "text" },
                  { label: "Phone Number", key: "phone",     placeholder: "e.g. 01012345678",         type: "tel"  },
                  { label: "Address",      key: "address",   placeholder: "e.g. 15 El-Tahrir St, Cairo", type: "text" },
                  { label: "National ID",  key: "nationalId",placeholder: "e.g. 29901011234567",      type: "text" },
                ].map(({ label, key, placeholder, type }) => (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "0.88rem", marginBottom: 5, color: "#333" }}>{label}</label>
                    <input
                      type={type}
                      required
                      placeholder={placeholder}
                      value={borrowData[key]}
                      onChange={(e) => setBorrowData({ ...borrowData, [key]: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #ddd", fontSize: "0.92rem", outline: "none", boxSizing: "border-box", background: "#fafafa" }}
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={borrowLoading}
                  style={{ ...chooseStyles.borrowBtn, marginTop: 8, flexDirection: "row", gap: 10, justifyContent: "center", padding: "14px", fontSize: "1rem", width: "100%" }}
                >
                  {borrowLoading ? "Submitting..." : "Submit Request"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════
  //  SCREEN 3 – PDF Reader (heba's version)
  // ════════════════════════════════════════
  return (
    <div style={s.container}>
      <header style={s.header}>
        <button onClick={() => navigate("/books")} style={s.btnExit}>✕</button>

        <div style={s.toolBox}>
          <button onClick={() => setActiveTool("pen")}       style={{ ...s.tool, color: activeTool === "pen"       ? "#C5A059" : "#fff" }}>Pen</button>
          <button onClick={() => setActiveTool("highlight")} style={{ ...s.tool, color: activeTool === "highlight" ? "#C5A059" : "#fff" }}>Highlight</button>
          <button onClick={() => setActiveTool("eraser")}    style={{ ...s.tool, color: activeTool === "eraser"    ? "#C5A059" : "#fff" }}>Eraser</button>
          <button onClick={clearAllDrawings} style={s.btnClear}>Clear All</button>

          <div style={s.vLine} />

          {COLORS.map(c => (
            <div
              key={c.id}
              onClick={() => setActiveColor(c.code)}
              style={{ ...s.colorCircle, background: c.code, border: activeColor === c.code ? "2px solid #C5A059" : "1px solid #444" }}
            />
          ))}
        </div>

        <div style={s.pageInfo}>Page <span style={{ color: "#C5A059" }}>{currentPage}</span> / {totalPages}</div>
      </header>

      <div style={s.mainBody}>
        <button style={{ ...s.sideNav, left: 30 }} disabled={currentPage === 1}          onClick={() => setCurrentPage(p => p - 1)}>❮</button>

        <div style={s.viewer}>
          {loading ? (
            <div style={{ color: "#C5A059", fontSize: "1.2rem" }}>Opening your book...</div>
          ) : (
            <div style={{ position: "relative" }}>
              <canvas ref={canvasRef} style={s.pdfCanvas} />
              <canvas
                ref={drawingCanvasRef}
                onMouseDown={(e) => { isDrawing.current = true; draw(e); }}
                onMouseUp={handleStopDrawing}
                onMouseMove={draw}
                style={s.drawCanvas}
              />
            </div>
          )}
        </div>

        <button style={{ ...s.sideNav, right: 30 }} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>❯</button>
      </div>
    </div>
  );
}

// ─── Styles: Choose / Borrow screens ───
const chooseStyles = {
  overlay: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20,
  },
  card: {
    background: "#fff", borderRadius: 24, padding: "48px 40px",
    maxWidth: 460, width: "100%",
    boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
    position: "relative", textAlign: "center",
  },
  closeBtn: {
    position: "absolute", top: 16, right: 18,
    background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#999",
  },
  btnGroup: { display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" },
  readBtn: {
    flex: 1, minWidth: 150,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "20px 16px", borderRadius: 16,
    border: "2px solid #3498db",
    background: "linear-gradient(135deg, #3498db, #2980b9)",
    color: "#fff", cursor: "pointer", fontSize: "0.95rem",
  },
  borrowBtn: {
    flex: 1, minWidth: 150,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "20px 16px", borderRadius: 16,
    border: "2px solid #f39c12",
    background: "linear-gradient(135deg, #f39c12, #e67e22)",
    color: "#fff", cursor: "pointer", fontSize: "0.95rem",
  },
};

// ─── Styles: PDF Reader screen ───
const s = {
  container:  { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0b121e", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  header:     { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 40px", background: "#151f2c", borderBottom: "1px solid rgba(197,160,89,0.2)", zIndex: 100 },
  btnExit:    { background: "none", border: "none", color: "#ff5c5c", fontSize: "24px", cursor: "pointer" },
  toolBox:    { display: "flex", alignItems: "center", gap: "20px", background: "#1c2a3a", padding: "8px 30px", borderRadius: "40px", border: "1px solid rgba(197,160,89,0.3)" },
  tool:       { background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.2s" },
  btnClear:   { background: "transparent", border: "1px solid #ff5c5c", color: "#ff5c5c", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", fontWeight: "bold" },
  vLine:      { width: "1px", height: "24px", background: "#334155" },
  colorCircle:{ width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", transition: "transform 0.2s" },
  pageInfo:   { color: "#94a3b8", fontWeight: "500", fontSize: "14px" },
  mainBody:   { flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative", padding: "60px 0", width: "100%" },
  sideNav:    { position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "rgba(197,160,89,0.1)", border: "1px solid #C5A059", color: "#C5A059", width: "55px", height: "55px", borderRadius: "50%", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s" },
  viewer:     { flex: 1, display: "flex", justifyContent: "center", maxWidth: "90%" },
  pdfCanvas:  { background: "white", borderRadius: "8px", boxShadow: "0 30px 60px rgba(0,0,0,0.7)", marginBottom: "80px" },
  drawCanvas: { position: "absolute", top: 0, left: 0, cursor: "crosshair" },
};