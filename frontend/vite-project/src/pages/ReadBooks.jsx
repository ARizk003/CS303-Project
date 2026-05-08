import React, { useEffect, useRef, useState, useCallback, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import StarRating from "../components/StarRating.jsx";
import { AuthContext } from '../context/AuthContext';
import TopRatedBadge from "../components/Topratedbadge.jsx";

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
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';

  const [currentRating, setCurrentRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [mode, setMode] = useState("choose");
  const [borrowData, setBorrowData] = useState({ fullName: "", phone: "", address: "", nationalId: "" });
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [borrowError, setBorrowError] = useState("");
  const [descExpanded, setDescExpanded] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);

  const canvasRef        = useRef(null);
  const drawingCanvasRef = useRef(null);
  const pdfDocRef        = useRef(null);
  const isDrawing        = useRef(false);
  const renderingPageRef = useRef(null);

  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages,  setTotalPages]  = useState(0);
  const [activeTool,  setActiveTool]  = useState("pen");
  const [activeColor, setActiveColor] = useState(COLORS[0].code);

  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDocRef.current || !canvasRef.current || !drawingCanvasRef.current) return;

    if (renderingPageRef.current === pageNum) return;
    renderingPageRef.current = pageNum;

    const page     = await pdfDocRef.current.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });

    const canvas     = canvasRef.current;
    const drawCanvas = drawingCanvasRef.current;

    canvas.height = drawCanvas.height = viewport.height;
    canvas.width  = drawCanvas.width  = viewport.width;

    const ctx     = canvas.getContext("2d");
    const drawCtx = drawCanvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_URL}/api/books/${book._id}/drawing/${pageNum}`,
        { headers: { "x-auth-token": token } }
      );

      if (renderingPageRef.current !== pageNum) return;

      if (res.data && res.data.drawingData) {
        const img = new Image();
        img.onload = () => {
          if (renderingPageRef.current === pageNum) {
            drawCtx.drawImage(img, 0, 0);
          }
        };
        img.src = res.data.drawingData;
      }
    } catch (err) {
      console.log("No saved drawing for this page");
    }
  }, [book?._id]);

  const clearAllDrawings = async () => {
    if (!drawingCanvasRef.current) return;
    const ctx = drawingCanvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${API_URL}/api/books/${book._id}/drawing/${currentPage}`,
        { headers: { "x-auth-token": token } }
      );
    } catch (err) {
      console.error("Clear error:", err);
    }
  };

  useEffect(() => {
    if (book?._id) {
      const token = localStorage.getItem("token");
      axios.get(`${API_URL}/api/books/${book._id}/rating`, {
        headers: { 'x-auth-token': token }
      }).then(res => {
        if (res.data.user_rating) setCurrentRating(res.data.user_rating);
        if (res.data.average_rating) setAverageRating(res.data.average_rating);
      });
    }
  }, [book?._id]);

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

  useEffect(() => {
    if (!loading && mode === "reading") renderPage(currentPage);
  }, [currentPage, loading, renderPage, mode]);

  const draw = (e) => {
    if (!isDrawing.current) return;
    const ctx  = drawingCanvasRef.current.getContext("2d");
    const rect = drawingCanvasRef.current.getBoundingClientRect();
    const x    = e.clientX - rect.left;
    const y    = e.clientY - rect.top;

    ctx.lineCap  = "round";
    ctx.lineJoin = "round";

    if (activeTool === "pen") {
      ctx.globalCompositeOperation = "source-over";
      ctx.lineWidth   = 3;
      ctx.strokeStyle = activeColor.replace("0.4", "1").replace("0.3", "1");
    } else if (activeTool === "highlight") {
      ctx.globalCompositeOperation = "multiply";
      ctx.lineWidth   = 25;
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

  const handleStopDrawing = async () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    const drawCanvas = drawingCanvasRef.current;
    drawCanvas.getContext("2d").beginPath();

    const savedPage = currentPage;

    try {
      const drawingData = drawCanvas.toDataURL();
      const token       = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/api/books/${book._id}/drawing`,
        { pageNumber: savedPage, drawingData },
        { headers: { "x-auth-token": token } }
      );
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const handleRate = async (score) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API_URL}/api/books/${book._id}/rate`,
        { rating: score },
        { headers: { "x-auth-token": token } }
      );
      setCurrentRating(res.data.your_rating);
      alert(res.data.msg);
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to submit rating");
    }
  };

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

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setCommentLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
          `${API_URL}/api/books/${book._id}/comments`, // Adjust this URL to match your backend endpoint
          { text: commentText },
          { headers: { "x-auth-token": token } }
      );
      alert("Comment added successfully!");
      setCommentText("");
      setMode("choose");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to add comment. Please try again.");
    }
    setCommentLoading(false);
  };


  if (mode === "choose") {
    const hasDescription = book?.description && book.description.trim().length > 0;
    const hasAuthorBio   = book?.authorBio   && book.authorBio.trim().length > 0;
    const Desc_Limit = 220;
    const Bio_Limit  = 180;

    return (
      <div style={chooseStyles.overlay}>
        <div style={chooseStyles.card}>
          <button onClick={() => navigate(-1)} style={chooseStyles.closeBtn}>✕</button>
       <div style={{ display: "flex", gap: 20, alignItems: "flex-start", marginBottom: 20, textAlign: "left" }}>
            {book?.coverImage && (
              <img
                src={book.coverImage}
                alt={book?.title}
                style={{
                  width: 90, height: 120, objectFit: "cover",
                  borderRadius: 10, flexShrink: 0,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <h2 style={{ fontWeight: 800, fontSize: "1.35rem", color: "#1a1a1a", marginBottom: 4, lineHeight: 1.3 }}>
                {book?.title}
              </h2>
              <p style={{ color: "#888", fontSize: "0.9rem", marginBottom: 10 }}>by {book?.author}</p>

              <TopRatedBadge rating={averageRating} style={{ marginBottom: 10 }} />

              
              {Array.isArray(book?.tags) && book.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {book.tags.map((tag, i) => (
                    <span key={tag._id || i} style={chooseStyles.tag}>
                      {typeof tag === "object" ? tag.name : tag}
                    </span>
                  ))}
                </div>
              )}

              
              <div>
                <p style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: 4 }}>Rate this book</p>
                <StarRating initialRating={currentRating} onRate={handleRate} />
              </div>
            </div>
          </div>

         
          {hasDescription && (
            <div style={chooseStyles.infoBox}>
              <div style={chooseStyles.infoBoxHeader}>
                <span style={chooseStyles.infoBoxTitle}>About this Book</span>
              </div>
              <p style={chooseStyles.infoBoxText}>
                {descExpanded || book.description.length <= Desc_Limit
                  ? book.description
                  : book.description.slice(0, Desc_Limit) + "…"}
              </p>
              {book.description.length > Desc_Limit && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  style={chooseStyles.readMoreBtn}
                >
                  {descExpanded ? "Show less ↑" : "Read more ↓"}
                </button>
              )}
            </div>
          )}

          {hasAuthorBio && (
            <div style={{ ...chooseStyles.infoBox, background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 100%)", borderColor: "#bde0f5" }}>
              <div style={chooseStyles.infoBoxHeader}>
                <span style={chooseStyles.infoBoxTitle}>About the Author</span>
              </div>
              <p style={{ ...chooseStyles.infoBoxText, fontStyle: "italic" }}>
                {bioExpanded || book.authorBio.length <= Bio_Limit
                  ? book.authorBio
                  : book.authorBio.slice(0, Bio_Limit) + "…"}
              </p>
              {book.authorBio.length > Bio_Limit && (
                <button
                  onClick={() => setBioExpanded(!bioExpanded)}
                  style={{ ...chooseStyles.readMoreBtn, color: "#3498db" }}
                >
                  {bioExpanded ? "Show less ↑" : "Read more ↓"}
                </button>
              )}
            </div>
          )}

          <p style={{ color: "#555", margin: "20px 0 12px", fontSize: "0.95rem", fontWeight: 600 }}>
            How would you like to access this book?
          </p>
          <div style={chooseStyles.btnGroup}>
            <button style={chooseStyles.readBtn} onClick={() => setMode("reading")}>
              <span style={{ fontSize: "1.5rem" }}>💻</span>
              <strong>Read Online</strong>
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>Open now in your browser</span>
            </button>
            {!isAdmin && (
              <button style={chooseStyles.borrowBtn} onClick={() => setMode("borrow-form")}>
                <span style={{ fontSize: "1.5rem" }}>📦</span>
                <strong>Borrow Book</strong>
                <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>Request a physical copy</span>
              </button>
            )}

            {/* ADDED: Add Comment Button */}
            <div style={{ marginTop: 20 }}>
              <button
                  onClick={() => setMode("comment-form")}
                  style={chooseStyles.commentBtn}
              >
                💬 Add a Comment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  {borrowError}
                </div>
              )}

              <form onSubmit={handleBorrowSubmit}>
                {[
                  { label: "Full Name",    key: "fullName",   placeholder: "e.g. Ahmed Mohamed",         type: "text" },
                  { label: "Phone Number", key: "phone",      placeholder: "e.g. 01012345678",            type: "tel"  },
                  { label: "Address",      key: "address",    placeholder: "e.g. 15 El-Tahrir St, Cairo", type: "text" },
                  { label: "National ID",  key: "nationalId", placeholder: "e.g. 29901011234567",         type: "text" },
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
  }if (mode === "comment-form") {
    return (
        <div style={chooseStyles.overlay}>
          <div style={{ ...chooseStyles.card, maxWidth: 520, padding: "40px 36px" }}>
            <button
                onClick={() => { setMode("choose"); setCommentText(""); }}
                style={chooseStyles.closeBtn}
            >✕</button>

            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: "2rem", marginBottom: 8 }}>💬</div>
              <h3 style={{ fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>Add a Comment</h3>
              <p style={{ color: "#888", fontSize: "0.9rem" }}>
                Share your thoughts on <strong>{book?.title}</strong>
              </p>
            </div>

            <form onSubmit={handleAddComment}>
            <textarea
                required
                rows={5}
                placeholder="Write your review or thoughts here..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                style={{
                  width: "100%", padding: "14px", borderRadius: 10, border: "1.5px solid #ddd",
                  fontSize: "0.95rem", outline: "none", boxSizing: "border-box",
                  background: "#fafafa", marginBottom: 16, resize: "vertical", fontFamily: "inherit"
                }}
            />
              <button
                  type="submit"
                  disabled={commentLoading}
                  style={{ ...chooseStyles.readBtn, flexDirection: "row", gap: 10, justifyContent: "center", padding: "14px", fontSize: "1rem", width: "100%" }}
              >
                {commentLoading ? "Submitting..." : "Submit Comment"}
              </button>
            </form>
          </div>
        </div>
    );
  }


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
        <button style={{ ...s.sideNav, left: 30 }} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>❮</button>

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
                onMouseLeave={handleStopDrawing}
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

const chooseStyles = {
  overlay: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20,
  },
  card: {
    background: "#fff",borderRadius: 24,padding: "36px 32px",
    maxWidth:520,width: "100%",
    boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
    position: "relative",maxHeight: "90vh",overflowY: "auto",
  },
  closeBtn: {
    position: "absolute", top: 16, right: 18,
    background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#999",
  },
  tag: {
    background: "#f0f0f0",
    color: "#555",
    fontSize: "0.72rem",
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: "0.03em",
    textTransform: "lowercase",
  },
  infoBox: {
    background: "linear-gradient(135deg, #fffbf0 0%, #fff8e8 100%)",
    border: "1px solid #f0d98a",
    borderRadius: 14,
    padding: "16px 18px",
    marginBottom: 14,
    textAlign: "left",
  },
  infoBoxHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoBoxIcon: {
    fontSize: "1rem",
  },
  infoBoxTitle: {
    fontWeight: 700,
    fontSize: "0.88rem",
    color: "#7a6020",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  infoBoxText: {
    fontSize: "0.88rem",
    color: "#444",
    lineHeight: 1.65,
    margin: 0,
  },
  readMoreBtn: {
    background: "none",
    border: "none",
    padding: "4px 0 0",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "#C5A059",
    cursor: "pointer",
    letterSpacing: "0.02em",
  },
  btnGroup: { display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" },
  readBtn: {
    flex: 1, minWidth: 140,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "18px 14px", borderRadius: 16,
    border: "2px solid #3498db",
    background: "linear-gradient(135deg, #3498db, #2980b9)",
    color: "#fff", cursor: "pointer", fontSize: "0.95rem",
  },
  borrowBtn: {
    flex: 1, minWidth: 140,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
    padding: "18px 14px", borderRadius: 16,
    border: "2px solid #f39c12",
    background: "linear-gradient(135deg, #f39c12, #e67e22)",
    color: "#fff", cursor: "pointer", fontSize: "0.95rem",
  },
  commentBtn: {
    width: "100%", padding: "14px", borderRadius: 16,
    border: "1px solid #ddd", background: "#f8f9fa",
    color: "#333", cursor: "pointer", fontSize: "0.95rem", fontWeight: 600,
    transition: "background 0.2s",
  }
};

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