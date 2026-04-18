import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";
const PDFJS_VERSION = "3.11.174";
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

export default function ReadBook() {
  const location = useLocation();
  const navigate = useNavigate();
  const { book } = location.state || {};

  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);
  const blobUrlRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
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
          viewport: viewport,
          transform:
            outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null,
        };
        const renderTask = page.render(renderContext);
        renderTaskRef.current = renderTask;
        await renderTask.promise;
      } catch (err) {
        if (err.name !== "RenderingCancelledException")
          console.error("Render Error:", err);
      }
    },
    [scale],
  );

  useEffect(() => {
    if (!book?._id) {
      navigate("/books");
      return;
    }

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

        if (!token) {
          setError("يجب تسجيل الدخول أولاً");
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/books/${book._id}/view`, {
          headers: { "x-auth-token": token },
          credentials: "omit",
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.msg || "فشل تحميل الكتاب");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        blobUrlRef.current = url;

        const loadingTask = window.pdfjsLib.getDocument(url);
        const pdf = await loadingTask.promise;

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
  }, [book, navigate, renderPage]);

  useEffect(() => {
    if (pdfDocRef.current && !loading) renderPage(currentPage);
  }, [currentPage, scale, renderPage, loading]);

  if (error)
    return (
      <div style={styles.errorContainer}>
        <h3>⚠️ خطأ</h3>
        <p>{error}</p>
        <button onClick={() => navigate("/books")} style={styles.backBtn}>
          العودة للمكتبة
        </button>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          إغلاق
        </button>
        <div style={styles.bookTitle}>
          {book?.title} | صفحة {currentPage} من {totalPages}
        </div>
        <div style={styles.controls}>
          <button onClick={() => setScale((s) => Math.min(3, s + 0.2))}>
            +
          </button>
          <button onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}>
            -
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
          >
            السابق
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
          >
            التالي
          </button>
        </div>
      </div>
      <div style={styles.viewer}>
        {loading ? (
          <div style={styles.loading}>جاري التحميل...</div>
        ) : (
          <canvas ref={canvasRef} />
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    background: "#1a1a1a",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#2c3e50",
    alignItems: "center",
    color: "white",
  },
  backBtn: {
    padding: "5px 15px",
    cursor: "pointer",
    background: "#e74c3c",
    border: "none",
    borderRadius: "4px",
    color: "white",
  },
  viewer: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    justifyContent: "center",
    padding: "20px",
  },
  controls: { display: "flex", gap: "10px" },
  loading: { color: "white", marginTop: "100px" },
  errorContainer: { textAlign: "center", color: "white", marginTop: "100px" },
};
