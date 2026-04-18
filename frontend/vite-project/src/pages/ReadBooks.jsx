import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

  const canvasRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const isDrawing = useRef(false);

  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [activeTool, setActiveTool] = useState("pen"); // pen, highlight, eraser
  const [activeColor, setActiveColor] = useState(COLORS[0].code);

  // 1. مسح كل الرسومات والهايلايت في الصفحة الحالية
  const clearAllDrawings = () => {
    if (drawingCanvasRef.current) {
      const ctx = drawingCanvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
      localStorage.removeItem(`drawings_${book?._id}_${currentPage}`);
    }
  };

  // 2. تحميل ملف الـ PDF
  const renderPage = useCallback(async (pageNum) => {
    if (!pdfDocRef.current || !canvasRef.current) return;
    const page = await pdfDocRef.current.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    
    const canvas = canvasRef.current;
    const drawCanvas = drawingCanvasRef.current;
    
    canvas.height = drawCanvas.height = viewport.height;
    canvas.width = drawCanvas.width = viewport.width;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    await page.render({ canvasContext: ctx, viewport }).promise;

    // تحميل أي رسم أو هايلايت محفوظ للصفحة دي
    const savedDraw = localStorage.getItem(`drawings_${book?._id}_${pageNum}`);
    if (savedDraw) {
      const drawCtx = drawCanvas.getContext("2d");
      const img = new Image();
      img.src = savedDraw;
      img.onload = () => drawCtx.drawImage(img, 0, 0);
    }
  }, [book?._id]);

  useEffect(() => {
    if (!book?._id) return;
    const init = async () => {
      if (!window.pdfjsLib) {
        const s = document.createElement("script");
        s.src = `${PDFJS_CDN}/pdf.min.js`;
        document.head.appendChild(s);
        s.onload = start;
      } else start();
    };
    const start = async () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDFJS_CDN}/pdf.worker.min.js`;
      const res = await fetch(`${API_URL}/api/books/${book._id}/view`, {
        headers: { "x-auth-token": localStorage.getItem("token") }
      });
      const pdf = await window.pdfjsLib.getDocument(URL.createObjectURL(await res.blob())).promise;
      pdfDocRef.current = pdf;
      setTotalPages(pdf.numPages);
      setLoading(false);
      renderPage(1);
    };
    init();
  }, [book, renderPage]);

  useEffect(() => { if (!loading) renderPage(currentPage); }, [currentPage, loading, renderPage]);

  // 3. منطق الرسم والهايلايت المتطور
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
      ctx.strokeStyle = activeColor.replace("0.4", "1").replace("0.3", "1"); // القلم يكون معتم
    } 
    else if (activeTool === "highlight") {
      // "multiply" بتخلي اللون يبان كأنه ماركر شفاف فوق الكلام
      ctx.globalCompositeOperation = "multiply"; 
      ctx.lineWidth = 25;
      ctx.strokeStyle = activeColor; 
    } 
    else if (activeTool === "eraser") {
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
    localStorage.setItem(`drawings_${book?._id}_${currentPage}`, drawingCanvasRef.current.toDataURL());
  };

  return (
    <div style={s.container}>
      <header style={s.header}>
        <button onClick={() => navigate("/books")} style={s.btnExit}>✕</button>
        
        <div style={s.toolBox}>
          <button onClick={() => setActiveTool("pen")} style={{...s.tool, color: activeTool === "pen" ? "#C5A059" : "#fff"}}>Pen</button>
          <button onClick={() => setActiveTool("highlight")} style={{...s.tool, color: activeTool === "highlight" ? "#C5A059" : "#fff"}}>Highlight</button>
          <button onClick={() => setActiveTool("eraser")} style={{...s.tool, color: activeTool === "eraser" ? "#C5A059" : "#fff"}}>Eraser</button>
          <button onClick={clearAllDrawings} style={s.btnClear}>Clear All</button>
          
          <div style={s.vLine} />
          
          {COLORS.map(c => (
            <div key={c.id} onClick={() => setActiveColor(c.code)} 
                 style={{...s.colorCircle, background: c.code, border: activeColor === c.code ? "2px solid #C5A059" : "1px solid #444"}} />
          ))}
        </div>

        <div style={s.pageInfo}>Page <span style={{color: "#C5A059"}}>{currentPage}</span> / {totalPages}</div>
      </header>

      <div style={s.mainBody}>
        <button style={{...s.sideNav, left: 30}} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>❮</button>

        <div style={s.viewer}>
          {loading ? <div style={{color: "#C5A059", fontSize: "1.2rem"}}>Opening your book...</div> : (
            <div style={{position: "relative"}}>
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

        <button style={{...s.sideNav, right: 30}} disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>❯</button>
      </div>
    </div>
  );
}

const s = {
  container: { display: "flex", flexDirection: "column", minHeight: "100vh", background: "#0b121e", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 40px", background: "#151f2c", borderBottom: "1px solid rgba(197, 160, 89, 0.2)", zIndex: 100 },
  btnExit: { background: "none", border: "none", color: "#ff5c5c", fontSize: "24px", cursor: "pointer" },
  toolBox: { display: "flex", alignItems: "center", gap: "20px", background: "#1c2a3a", padding: "8px 30px", borderRadius: "40px", border: "1px solid rgba(197, 160, 89, 0.3)" },
  tool: { background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", transition: "all 0.2s" },
  btnClear: { background: "transparent", border: "1px solid #ff5c5c", color: "#ff5c5c", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", cursor: "pointer", fontWeight: "bold" },
  vLine: { width: "1px", height: "24px", background: "#334155" },
  colorCircle: { width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", transition: "transform 0.2s" },
  pageInfo: { color: "#94a3b8", fontWeight: "500", fontSize: "14px" },
  mainBody: { flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative", padding: "60px 0", width: "100%" },
  sideNav: { position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10, background: "rgba(197, 160, 89, 0.1)", border: "1px solid #C5A059", color: "#C5A059", width: "55px", height: "55px", borderRadius: "50%", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "0.3s" },
  viewer: { flex: 1, display: "flex", justifyContent: "center", maxWidth: "90%" },
  pdfCanvas: { background: "white", borderRadius: "8px", boxShadow: "0 30px 60px rgba(0,0,0,0.7)", marginBottom: "80px" },
  drawCanvas: { position: "absolute", top: 0, left: 0, cursor: "crosshair" }
};