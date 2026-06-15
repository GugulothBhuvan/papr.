"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as pdfjs from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react";

// Configure PDF.js Worker to load from CDN
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs";

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [pageNum, setPageNum] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [zoom, setZoom] = useState<number | "fit">(1.0); // 1.0 = 100%, "fit" = Fit to Width
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRendering, setIsRendering] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderTaskRef = useRef<any>(null);

  // Load PDF Document
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjs.getDocument(url);
        const doc = await loadingTask.promise;
        
        if (!active) return;
        
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        
        // Retain page number or adjust to bounds if doc page size changed
        setPageNum((prev) => {
          if (prev > doc.numPages) return doc.numPages;
          if (prev < 1) return 1;
          return prev;
        });
        
        setIsLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error("Error loading PDF:", err);
        setError("Failed to load PDF preview. Make sure document compiles successfully.");
        setIsLoading(false);
      }
    };

    loadPDF();

    return () => {
      active = false;
    };
  }, [url]);

  // Main Page Rendering Function
  const renderPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    try {
      setIsRendering(true);
      const page = await pdfDoc.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;

      // Calculate scale
      let scale = 1.0;
      if (zoom === "fit") {
        const containerWidth = containerRef.current.clientWidth - 32; // padding
        const viewportWidth = page.getViewport({ scale: 1 }).width;
        scale = containerWidth / viewportWidth;
      } else {
        scale = zoom;
      }

      const viewport = page.getViewport({ scale });

      // Handle Device Pixel Ratio for crystal-clear render
      const dpr = window.devicePixelRatio || 1;
      canvas.width = viewport.width * dpr;
      canvas.height = viewport.height * dpr;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;

      context.resetTransform();
      context.scale(dpr, dpr);

      // Cancel previous render task if active
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      setIsRendering(false);
    } catch (err: any) {
      if (err.name === "RenderingCancelledException" || err.name === "HeadingStatus") {
        // Render was cancelled, normal behavior during page/zoom switches
        return;
      }
      console.error("Error rendering PDF page:", err);
      setIsRendering(false);
    }
  }, [pdfDoc, pageNum, zoom]);

  // Render page when pdfDoc, pageNum, or zoom updates
  useEffect(() => {
    renderPage();
  }, [renderPage]);

  // Listen to container resizes for "Fit to Width"
  useEffect(() => {
    if (zoom !== "fit" || !containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      renderPage();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [zoom, renderPage]);

  // Pagination Controls
  const goToPrevPage = () => {
    setPageNum((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNum((prev) => Math.min(prev + 1, numPages));
  };

  // Zoom Controls
  const zoomIn = () => {
    setZoom((prev) => {
      if (prev === "fit") return 1.25;
      return Math.min(prev + 0.25, 3.0);
    });
  };

  const zoomOut = () => {
    setZoom((prev) => {
      if (prev === "fit") return 0.75;
      return Math.max(prev - 0.25, 0.5);
    });
  };

  const fitToWidth = () => {
    setZoom("fit");
  };

  const downloadPDF = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "document.pdf";
      link.click();
      window.URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Failed to download PDF:", err);
      alert("Failed to download PDF document.");
    }
  };

  return (
    <div className="h-full relative bg-background text-foreground overflow-hidden select-none">
      {/* Main Canvas Viewport Area */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-auto p-4 flex items-start justify-center bg-background/55"
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/90 z-10">
            <Loader2 className="animate-spin text-primary" size={24} />
            <span className="text-xs text-muted-text">Loading document...</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 gap-2 bg-background/95 z-10">
            <AlertCircle className="text-red-400" size={32} />
            <p className="text-xs text-muted-text max-w-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* Render Canvas */}
        <div className={`shadow-2xl border border-panel-border bg-white transition-opacity duration-200 ${
          isRendering ? "opacity-75" : "opacity-100"
        }`}>
          <canvas ref={canvasRef} />
        </div>
      </div>

      {/* Floating Bottom Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 bg-surface/80 backdrop-blur-xl border border-panel-border rounded-xl shadow-2xl shadow-black/20 z-20 transition-all hover:bg-surface/95">
        {/* Zoom controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={zoomOut}
            disabled={(zoom !== "fit" && zoom <= 0.5) || isLoading}
            className="flex items-center justify-center disabled:opacity-30 text-muted-text hover:text-foreground transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <span className="text-xs font-bold text-foreground min-w-[45px] text-center">
            {zoom === "fit" ? "Fit" : `${Math.round(zoom * 100)}%`}
          </span>
          <button
            onClick={zoomIn}
            disabled={(zoom !== "fit" && zoom >= 3.0) || isLoading}
            className="flex items-center justify-center disabled:opacity-30 text-muted-text hover:text-foreground transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className="w-[1px] h-5 bg-panel-border" />

        {/* Page navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={goToPrevPage}
            disabled={pageNum <= 1 || isLoading}
            className="flex items-center justify-center disabled:opacity-30 text-muted-text hover:text-foreground transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-semibold text-foreground min-w-[60px] text-center">
            {isLoading ? "--" : `${pageNum} / ${numPages}`}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNum >= numPages || isLoading}
            className="flex items-center justify-center disabled:opacity-30 text-muted-text hover:text-foreground transition-all cursor-pointer hover:scale-110 active:scale-95"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Floating Top Right Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-20">
        <button
          onClick={fitToWidth}
          disabled={isLoading}
          className={`h-9 w-9 flex items-center justify-center rounded-lg shadow-xl backdrop-blur-md transition-all cursor-pointer border ${
            zoom === "fit"
              ? "bg-primary/20 text-primary border-primary/30 shadow-primary/10"
              : "bg-surface/70 border-panel-border text-muted-text hover:text-foreground hover:bg-surface/95"
          }`}
          title="Fit to Width"
        >
          <Maximize2 size={16} />
        </button>
        <button
          onClick={downloadPDF}
          disabled={isLoading}
          className="h-9 w-9 flex items-center justify-center rounded-lg shadow-xl backdrop-blur-md border border-panel-border bg-surface/70 hover:bg-surface/95 disabled:opacity-30 text-muted-text hover:text-foreground transition-all cursor-pointer"
          title="Download PDF"
        >
          <Download size={16} />
        </button>
      </div>
    </div>
  );
}
