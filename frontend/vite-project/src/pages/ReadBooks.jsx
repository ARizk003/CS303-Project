import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";
const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

export default function ReadBook() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};

  const [mode, setMode] = useState("choose");
  const [borrowData, setBorrowData] = useState({ fullName: "", phone: "", address: "", nationalId: "" });
  const [borrowLoading, setBorrowLoading] = useState(false);
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [borrowError, setBorrowError] = useState("");

  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const blobUrlRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const renderPage = useCallback(
    async (pageNum, pdfDoc = pdfDocRef.current) => {
      if (!pdfDoc || !canvasRef.current) return;
      try {
        if (renderTaskRef.current) renderTaskRef.current.cancel();
        const page = await pdfDoc.getPage(pageNum);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        const outputScale = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height = Math.floor(viewport.height) + "px";
        const renderContext = {
          canvasContext: context,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
        };
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err) {
        if (err.name !== "RenderingCancelledException") console.error("Render Error:", err);
      }
    },
    [scale]
  );

  useEffect(() => {
    if (mode !== "reading") return;
    if (!book?._id) { navigate("/books"); return; }

    const init = async () => {
      try {
        setLoading(true);
        if (!window.pdfjsLib) {
          await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `${PDFJS_CDN}/pdf.min.js`;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
        const token = localStorage.getItem("token");
        if (!token) { setError("You Should sign-in firstly"); setLoading(false); return; }
        const response = await fetch(`${API_URL}/api/books/${book._id}/view`, {
          headers: { "x-auth-token": token },
          credentials: "omit",
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error("failed to load book");
        }
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        blobUrlRef.current = url;
        const pdf = await window.pdfjsLib.getDocument(url).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        await renderPage(1, pdf);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    init();
    return () => {
      if (blobUrlRef.current) window.URL.revokeObjectURL(blobUrlRef.current);
      if (renderTaskRef.current) renderTaskRef.current.cancel();
    };
  }, [mode, book, navigate, renderPage]);

  useEffect(() => {
    if (pdfDocRef.current && !loading && mode === "reading") renderPage(currentPage);
  }, [currentPage, scale, renderPage, loading, mode]);

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

  if (mode === "choose") {
    return (
      <div style={chooseStyles.overlay}>
        <div style={chooseStyles.card}>
          <button onClick={() => navigate(-1)} style={chooseStyles.closeBtn}>✕</button>
          <div style={{ fontSize: "3rem", marginBottom: 8 }}></div>
          <h2 style={{ fontWeight: 800, fontSize: "1.4rem", color: "#1a1a1a", marginBottom: 4 }}>{book?.title}</h2>
          <p style={{ color: "#888", marginBottom: 20, fontSize: "0.95rem" }}>by {book?.author}</p>
          <p style={{ color: "#555", marginBottom: 28, fontSize: "1rem" }}>How would you like to access this book?</p>
          <div style={chooseStyles.btnGroup}>
            <button style={chooseStyles.readBtn} onClick={() => setMode("reading")}>
              <span style={{ fontSize: "1.5rem" }}></span>
              <strong>Read Online</strong>
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>Open now in your browser</span>
            </button>
            <button style={chooseStyles.borrowBtn} onClick={() => setMode("borrow-form")}>
              <span style={{ fontSize: "1.5rem" }}></span>
              <strong>Borrow Book</strong>
              <span style={{ fontSize: "0.8rem", opacity: 0.85 }}>Request a physical copy</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── BORROW FORM ──
  if (mode === "borrow-form") {
    return (
      <div style={chooseStyles.overlay}>
        <div style={{ ...chooseStyles.card, maxWidth: 520, padding: "40px 36px" }}>
          <button onClick={() => { setBorrowSuccess(false); setBorrowError(""); setMode("choose"); }} style={chooseStyles.closeBtn}>✕</button>

          {borrowSuccess ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: "3.5rem", marginBottom: 16 }}></div>
              <h3 style={{ color: "#27ae60", fontWeight: 700, marginBottom: 8 }}>Request Sent!</h3>
              <p style={{ color: "#555", marginBottom: 24 }}>
                Your borrow request for <strong>{book?.title}</strong> has been submitted.<br />
                The admin will review it shortly.
              </p>
              <button style={{ ...chooseStyles.readBtn, flexDirection: "row", justifyContent: "center", gap: 8, padding: 14 }} onClick={() => navigate("/books")}>
                Back to Library
              </button>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontSize: "2rem", marginBottom: 8 }}></div>
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
                  { label: "Full Name", key: "fullName", placeholder: "e.g. Ahmed Mohamed", type: "text" },
                  { label: "Phone Number", key: "phone", placeholder: "e.g. 01012345678", type: "tel" },
                  { label: "Address", key: "address", placeholder: "e.g. 15 El-Tahrir St, Cairo", type: "text" },
                  { label: "National ID", key: "nationalId", placeholder: "e.g. 29901011234567", type: "text" },
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


  if (error)
    return (
      <div style={{ textAlign: "center", color: "white", marginTop: "100px" }}>
        <h3>Error⚠️ </h3>
        <p>{error}</p>
        <button onClick={() => navigate("/books")} style={{ padding: "5px 15px", cursor: "pointer", background: "#e74c3c", border: "none", borderRadius: "4px", color: "white" }}>
          Back to Library
        </button>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#1a1a1a" }}>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: "#2c3e50", alignItems: "center", color: "white" }}>
        <button onClick={() => navigate(-1)} style={{ padding: "5px 15px", cursor: "pointer", background: "#e74c3c", border: "none", borderRadius: "4px", color: "white" }}>إغلاق</button>
        <div>{book?.title} | Page{currentPage} from{totalPages}</div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.2))}>+</button>
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>-</button>
          <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>السابق</button>
          <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>التالي</button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "20px" }}>
        {loading ? <div style={{ color: "white", marginTop: "100px" }}>جاري التحميل...</div> : <canvas ref={canvasRef} />}
      </div>
    </div>
  );
}

const chooseStyles = {
  overlay: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    background: "#fff",
    borderRadius: 24,
    padding: "48px 40px",
    maxWidth: 460,
    width: "100%",
    boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
    position: "relative",
    textAlign: "center",
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