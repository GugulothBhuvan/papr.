"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectStore, FileMeta } from "../../../store/projectStore";
import Editor, { DiffEditor } from "@monaco-editor/react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("@/components/PDFViewer"), {
  ssr: false,
});

function PaprLogo({ className = "h-6 w-auto" }: { className?: string }) {
  const { theme } = useProjectStore();
  // Note: logo-dark.svg contains light text (for dark mode), logo-white.svg contains dark text (for light mode)
  const logoSrc = theme === "dark" ? "/logo-dark.svg" : "/logo-white.svg";
  
  return (
    <img 
      src={logoSrc} 
      alt="Papr Logo" 
      className={className} 
    />
  );
}
import {
  FileText,
  Plus,
  Trash2,
  ChevronLeft,
  Loader2,
  Save,
  Play,
  MessageSquare,
  Eye,
  Settings,
  AlertCircle,
  Terminal,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Sparkles,
  Sun,
  Moon,
  CornerDownLeft,
  CornerDownRight,
  SlidersHorizontal,
  PanelLeftClose,
  Search,
  User,
  LayoutGrid,
  Mail,
  MoreVertical,
  Paperclip,
  Mic,
  Send,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCw,
  ArrowUp,
  Pencil,
  Copy,
  Download,
  Share2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Check,
  X,
  HelpCircle,
  LogIn,
  BookOpen,
  Presentation,
  Calculator
} from "lucide-react";

import SettingsModal from "@/components/SettingsModal";
import ProfileFooter from "@/components/ProfileFooter";

export default function EditorWorkspace() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const {
    currentProject,
    activeFileId,
    fileContents,
    saveStatus,
    isLoading,
    error,
    isCompiling,
    compileErrors,
    compileLogs,
    pdfUrl,
    selectProject,
    selectFile,
    updateFileContent,
    saveFile,
    createFile,
    deleteFile,
    compileProject,
    chatHistory,
    isChatting,
    sendChatMessage,
    clearChat,
    editSelection,
    fixErrorWithAI,
    theme,
    toggleTheme,
    aiModel,
    setAiModel,
    deleteProject,
    renameProject
  } = useProjectStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const [newFileName, setNewFileName] = useState("");
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState<"files" | "chats">("files");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Project Dropdown States
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Selection Edit States
  const [selectionToolbar, setSelectionToolbar] = useState<{ top: number; left: number } | null>(null);
  const [isInlineExpanded, setIsInlineExpanded] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectionRange, setSelectionRange] = useState<any>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffOriginal, setDiffOriginal] = useState("");
  const [diffModified, setDiffModified] = useState("");
  const [fixingErrorIndex, setFixingErrorIndex] = useState<number | null>(null);

  // Panel Resizing States & Handlers
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [previewWidth, setPreviewWidth] = useState(500);
  const [rightPanelWidth, setRightPanelWidth] = useState(350);
  const [consoleHeight, setConsoleHeight] = useState(224);
  const [chatHeight, setChatHeight] = useState(350);

  const handleChatResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = chatHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.max(200, Math.min(800, startHeight + deltaY));
      setChatHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [chatHeight]);

  const handlePreviewResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = previewWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = startX - moveEvent.clientX;
      const newWidth = Math.max(300, Math.min(1200, startWidth + deltaX));
      setPreviewWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [previewWidth]);

  const handleSidebarResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = sidebarWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(160, Math.min(600, startWidth + deltaX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [sidebarWidth]);

  const handleRightResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = rightPanelWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(300, Math.min(900, startWidth - deltaX));
      setRightPanelWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [rightPanelWidth]);

  const handleConsoleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = consoleHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.clientY - startY;
      const newHeight = Math.max(120, Math.min(600, startHeight - deltaY));
      setConsoleHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [consoleHeight]);

  const editorRef = useRef<any>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const isToolbarActiveRef = useRef(false);

  // Keep ref in sync so Monaco's closure-captured callback can check it
  useEffect(() => {
    isToolbarActiveRef.current = isInlineExpanded || isEditLoading;
  }, [isInlineExpanded, isEditLoading]);

  const triggerSelectionEdit = useCallback((editor: any) => {
    const selection = editor.getSelection();
    if (!selection || selection.isEmpty()) {
      alert("Please select some text in the editor first.");
      return;
    }

    const model = editor.getModel();
    if (!model) return;

    const text = model.getValueInRange(selection);
    if (!text.trim()) {
      alert("Please select some text in the editor first.");
      return;
    }

    // Save selection data
    setSelectedText(text);
    setSelectionRange({
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn
    });

    // Compute toolbar position
    const endPos = { lineNumber: selection.endLineNumber, column: selection.endColumn };
    const scrolledPos = editor.getScrolledVisiblePosition(endPos);
    if (scrolledPos) {
      setSelectionToolbar({ top: scrolledPos.top + scrolledPos.height + 8, left: Math.max(8, scrolledPos.left) });
    }

    // Expand to show input and focus
    setIsInlineExpanded(true);
    setPromptText("");
    setTimeout(() => inlineInputRef.current?.focus(), 50);
  }, []);

  // Load project on mount/id change
  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId, selectProject]);

  // Listen for Ctrl+B (Compile), Ctrl+S (Save & Compile), Ctrl+K (Edit Selection), Escape (close toolbar)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === "b" || e.key.toLowerCase() === "s")) {
        e.preventDefault();
        compileProject();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (editorRef.current) {
          triggerSelectionEdit(editorRef.current);
        }
      }
      if (e.key === "Escape") {
        setSelectionToolbar(null);
        setIsInlineExpanded(false);
        editorRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [compileProject, triggerSelectionEdit]);

  // Open console automatically if there are compile errors
  useEffect(() => {
    if (compileErrors.length > 0) {
      setIsConsoleOpen(true);
    }
  }, [compileErrors]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleEditorDidMount = (editor: any, monacoInstance: any) => {
    editorRef.current = editor;

    // Register selection edit command: Ctrl+K / Cmd+K
    editor.addCommand(
      monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyK,
      () => {
        triggerSelectionEdit(editor);
      }
    );

    // Auto-show floating toolbar on text selection (ChatGPT-style)
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();
      if (!selection || selection.isEmpty()) {
        // Don't hide if user is interacting with toolbar or mid-edit
        if (isToolbarActiveRef.current) return;
        if (toolbarRef.current && toolbarRef.current.contains(document.activeElement)) return;
        setSelectionToolbar(null);
        setIsInlineExpanded(false);
        return;
      }

      const model = editor.getModel();
      if (!model) return;

      const text = model.getValueInRange(selection);
      if (!text.trim()) {
        if (!isToolbarActiveRef.current) {
          setSelectionToolbar(null);
          setIsInlineExpanded(false);
        }
        return;
      }

      // Save selection data
      setSelectedText(text);
      setSelectionRange({
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      });

      // Position toolbar below the selection end
      const endPos = { lineNumber: selection.endLineNumber, column: selection.endColumn };
      const scrolledPos = editor.getScrolledVisiblePosition(endPos);
      if (scrolledPos) {
        setSelectionToolbar({
          top: scrolledPos.top + scrolledPos.height + 8,
          left: Math.max(8, scrolledPos.left)
        });
      }
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!activeFileId || value === undefined) return;

    // 1. Update in-memory state
    updateFileContent(activeFileId, value);

    // 2. Debounce auto-save (3 seconds)
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveFile(activeFileId);
    }, 3000);
  };

  const handleAddFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const extension = newFileName.split(".").pop();
    if (!["tex", "bib", "png", "jpg", "pdf"].includes(extension || "")) {
      alert("Invalid file extension! Allowed: .tex, .bib, .png, .jpg, .pdf");
      return;
    }

    await createFile(newFileName.trim());
    setIsAddingFile(false);
    setNewFileName("");
  };

  const handleDeleteFile = async (e: React.MouseEvent, fileId: string, filename: string) => {
    e.stopPropagation();
    if (filename === "main.tex") {
      alert("Cannot delete main.tex: it is the primary compilation source.");
      return;
    }

    if (confirm(`Are you sure you want to delete ${filename}?`)) {
      await deleteFile(fileId);
    }
  };

  const jumpToLine = (line: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: 1 });
      editorRef.current.focus();
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;
    const msg = chatInput.trim();
    setChatInput("");
    await sendChatMessage(msg);
  };

  const insertTextAtCursor = (text: string) => {
    if (editorRef.current) {
      const selection = editorRef.current.getSelection();
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      
      const id = { major: 1, minor: 1 };
      const textEdit = {
        identifier: id,
        range: range,
        text: text,
        forceMoveMarkers: true
      };
      
      editorRef.current.executeEdits("ai-insertion", [textEdit]);
      editorRef.current.focus();
    } else {
      alert("Please place your cursor in the editor first.");
    }
  };

  // Open the Diff editor to review autonomous AI edits
  const reviewAIEdits = (newContent: string) => {
    if (!activeFileId) return;
    
    const activeContent = fileContents[activeFileId] || "";
    setDiffOriginal(activeContent);
    setDiffModified(newContent);
    
    const model = editorRef.current?.getModel();
    if (model) {
      const fullRange = model.getFullModelRange();
      setSelectionRange({
        startLineNumber: fullRange.startLineNumber,
        startColumn: fullRange.startColumn,
        endLineNumber: fullRange.endLineNumber,
        endColumn: fullRange.endColumn
      });
    } else {
      const lineCount = activeContent.split('\n').length;
      setSelectionRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: Math.max(1, lineCount),
        endColumn: 1
      });
    }
    
    setIsDiffOpen(true);
  };

  // Smart apply: Use AI to intelligently merge the response into the active document
  const applyAIResponse = async (responseText: string) => {
    if (!currentProject || !activeFileId) {
      alert("Please open a file to apply the AI response.");
      return;
    }

    setIsEditLoading(true);
    try {
      const activeContent = fileContents[activeFileId] || "";
      const instruction = `Please integrate this AI response into the document. Intelligently merge any code blocks or text suggestions into the appropriate locations. Here is the response:\n\n${responseText}`;
      
      const result = await editSelection(activeContent, instruction);
      
      setDiffOriginal(activeContent);
      setDiffModified(result);
      
      // Select the entire file range for the diff application
      const model = editorRef.current?.getModel();
      if (model) {
        const fullRange = model.getFullModelRange();
        setSelectionRange({
          startLineNumber: fullRange.startLineNumber,
          startColumn: fullRange.startColumn,
          endLineNumber: fullRange.endLineNumber,
          endColumn: fullRange.endColumn
        });
      } else {
        const lineCount = activeContent.split('\n').length;
        setSelectionRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: Math.max(1, lineCount),
          endColumn: 1
        });
      }
      
      setIsDiffOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to apply AI response.");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleReviewDiff = (newContent: string) => {
    const activeContent = activeFileId ? (fileContents[activeFileId] || "") : "";
    setDiffOriginal(activeContent);
    setDiffModified(newContent);
    
    const model = editorRef.current?.getModel();
    if (model) {
      const fullRange = model.getFullModelRange();
      setSelectionRange({
        startLineNumber: fullRange.startLineNumber,
        startColumn: fullRange.startColumn,
        endLineNumber: fullRange.endLineNumber,
        endColumn: fullRange.endColumn
      });
    } else {
      const lineCount = activeContent.split('\n').length;
      setSelectionRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: Math.max(1, lineCount),
        endColumn: 1
      });
    }
    setIsDiffOpen(true);
  };

  const handleAcceptToolCall = async (newContent: string) => {
    if (activeFileId) {
      updateFileContent(activeFileId, newContent);
      await saveFile(activeFileId);
      await compileProject();
      setIsDiffOpen(false);
    }
  };

  const handleFixErrorWithAI = async (err: any, idx: number) => {
    if (fixingErrorIndex !== null) return;
    setFixingErrorIndex(idx);
    try {
      const { explanation, fileId, fixedCode } = await fixErrorWithAI(err);
      
      // Update Monaco editor if the fixed file is the active one
      if (fileId === activeFileId && editorRef.current) {
        editorRef.current.setValue(fixedCode);
      }
      
      alert(`✅ Applied AI Fix:\n\n${explanation}`);
    } catch (error: any) {
      console.error("Fix with AI failed:", error);
      alert(`❌ Fix with AI failed: ${error.message || error}`);
    } finally {
      setFixingErrorIndex(null);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleEditSubmit = async (e?: React.FormEvent, presetInstruction?: string) => {
    if (e) e.preventDefault();
    const instruction = presetInstruction || promptText;
    if (!instruction.trim() || isEditLoading) return;

    setIsEditLoading(true);
    try {
      const result = await editSelection(selectedText, instruction);
      setDiffOriginal(selectedText);
      setDiffModified(result);
      // Close inline toolbar, open diff modal
      setSelectionToolbar(null);
      setIsInlineExpanded(false);
      setIsDiffOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to edit selection.");
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleAcceptEdit = () => {
    if (editorRef.current && selectionRange) {
      const id = { major: 1, minor: 1 };
      const textEdit = {
        identifier: id,
        range: selectionRange,
        text: diffModified,
        forceMoveMarkers: true
      };
      editorRef.current.executeEdits("ai-selection-edit", [textEdit]);
      editorRef.current.focus();
    }
    setIsDiffOpen(false);
  };

  const handleRejectEdit = () => {
    setIsDiffOpen(false);
  };

  const getActiveFileMeta = (): FileMeta | null => {
    if (!currentProject || !activeFileId) return null;
    return (currentProject.files || []).find((f) => f.id === activeFileId) || null;
  };

  const activeFileMeta = getActiveFileMeta();
  const activeFileContent = activeFileId ? fileContents[activeFileId] || "" : "";

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 gap-4">
        <AlertCircle className="text-red-400" size={48} />
        <h2 className="text-xl font-bold">Error loading project</h2>
        <p className="text-muted-text text-sm max-w-md text-center">{error}</p>
        <button
          onClick={() => router.push("/")}
          className="mt-2 papr-btn-primary px-4 py-2 text-sm"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-bg-global text-foreground flex select-none overflow-hidden font-sans transition-colors duration-200">
      
      {/* Sidebar */}
      <aside 
        className="bg-bg-sidebar flex flex-col shrink-0 relative border-r border-border-layout"
        style={{ width: sidebarWidth }}
      >
        {/* Sidebar Resizer Handle */}
        <div
          onMouseDown={handleSidebarResizeMouseDown}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/30 z-10 transition-colors"
        />

        {/* Top Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div 
            onClick={() => router.push("/")}
            className="flex items-center text-foreground cursor-pointer hover:opacity-80 transition-opacity"
          >
            <PaprLogo className="h-6 w-auto" />
          </div>
          <PanelLeftClose size={18} className="text-muted-text hover:text-foreground transition-colors cursor-pointer" />
        </div>

        {/* Project Dropdown */}
        <div className="relative px-4 py-2">
          <div 
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center justify-between group cursor-pointer w-max"
          >
            <span className="text-lg font-display tracking-[-0.5px] font-normal text-foreground">
              {currentProject?.name || "New Project"} <ChevronDown size={14} className="inline-block text-muted-text ml-1" />
            </span>
          </div>

          {isProjectDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProjectDropdownOpen(false)}></div>
              <div className="absolute top-full left-4 mt-1 w-60 bg-bg-element border border-border-layout rounded-[2px] shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                <button className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-bg-global transition-colors w-full text-left">
                  <Plus size={14} className="text-muted-text" /> Share and collaborate
                </button>
                <button 
                  onClick={() => {
                    setRenameValue(currentProject?.name || "");
                    setIsProjectDropdownOpen(false);
                    setIsRenameModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-bg-global transition-colors w-full text-left"
                >
                  <Pencil size={14} className="text-muted-text" /> Rename
                </button>
                <button 
                  onClick={async () => {
                    setIsProjectDropdownOpen(false);
                    if (currentProject && confirm(`Are you sure you want to delete ${currentProject.name}?`)) {
                      await deleteProject(currentProject.id);
                      router.push("/");
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-bg-global transition-colors w-full text-left"
                >
                  <Trash2 size={14} className="text-muted-text" /> Delete
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-bg-global transition-colors w-full text-left">
                  <Copy size={14} className="text-muted-text" /> Duplicate
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-bg-global transition-colors w-full text-left border-b border-border-layout">
                  <Download size={14} className="text-muted-text" /> Export (zip)
                </button>
                <button className="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-bg-global transition-colors w-full text-left mt-1">
                  <Star size={14} className="text-muted-text" /> XeLaTeX / LuaLaTeX
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="px-4 py-2 flex items-center justify-between mt-2">
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <span 
              onClick={() => setActiveSidebarTab("files")}
              className={`pb-1 cursor-pointer transition-colors ${activeSidebarTab === "files" ? "text-foreground border-b-[1.5px] border-foreground" : "text-muted-text hover:text-foreground"}`}
            >
              Files
            </span>
            <span 
              onClick={() => setActiveSidebarTab("chats")}
              className={`pb-1 cursor-pointer transition-colors ${activeSidebarTab === "chats" ? "text-foreground border-b-[1.5px] border-foreground" : "text-muted-text hover:text-foreground"}`}
            >
              Chats
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Search size={14} className="text-muted-text hover:text-foreground transition-colors cursor-pointer" />
            <button
              onClick={() => setIsAddingFile(!isAddingFile)}
              className="text-muted-text hover:text-foreground transition-colors cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {isAddingFile && (
          <form onSubmit={handleAddFileSubmit} className="px-4 py-2">
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. section1.tex"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="w-full px-2 py-1.5 bg-bg-editor border border-border-layout rounded-[2px] text-foreground text-xs focus:outline-none focus:border-primary"
            />
          </form>
        )}

        {/* Sidebar Content */}
        <div className="px-2 py-2 flex flex-col gap-0.5 mt-2">
          {activeSidebarTab === "files" ? (
            <>
              {isLoading && !currentProject ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="animate-spin text-muted-text" size={18} />
                </div>
              ) : (currentProject?.files || []).length === 0 ? (
                <div className="text-[11px] text-muted-text text-center py-6">No files</div>
              ) : (
                (currentProject?.files || []).map((file) => {
                  const isActive = activeFileId === file.id;
                  return (
                    <div
                      key={file.id}
                      onClick={() => selectFile(file.id)}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded-[2px] cursor-pointer transition-all ${
                        isActive
                          ? "bg-bg-element text-foreground"
                          : "text-muted-text hover:text-foreground hover:bg-bg-header"
                      }`}
                    >
                      <div className="flex items-center min-w-0">
                        <span className="text-[12px] truncate font-medium">{file.filename}</span>
                      </div>
                      {file.filename !== "main.tex" && (
                        <button
                          onClick={(e) => handleDeleteFile(e, file.id, file.filename)}
                          className="text-muted-text hover:text-red-400 p-1 rounded-[2px] opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </>
          ) : (
            <div className="flex flex-col gap-2">
              <button 
                className="flex items-center gap-2 px-3 py-2 bg-bg-element rounded-[2px] text-foreground text-[12px] font-semibold hover:bg-border-layout-strong transition-colors border border-border-layout-strong shadow-sm"
              >
                <MessageSquare size={14} className="text-muted-text" />
                New chat
              </button>
            </div>
          )}
        </div>

        {/* Outline Mock */}
        <div className="mt-4">
          <div className="px-4 flex items-center gap-1.5 cursor-pointer text-muted-text hover:text-foreground transition-colors">
            <ChevronDown size={14} />
            <span className="text-[11px] font-semibold">Outline</span>
          </div>
          <div className="px-8 mt-2 flex flex-col gap-2">
            <span className="text-[11px] text-muted-text hover:text-foreground cursor-pointer transition-colors">Introduction</span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Profile Footer */}
        <ProfileFooter showInvite={true} />
      </aside>

      {/* Main Workspace Area */}
      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col bg-bg-editor overflow-hidden relative">
          <div className="h-12 px-4 border-b border-border-layout flex items-center justify-between shrink-0 bg-bg-header">
            <div className="flex items-center gap-2">
              {activeSidebarTab === "chats" ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 border border-border-layout-strong rounded-[2px] cursor-pointer bg-bg-element">
                    <MessageSquare size={12} className="text-muted-text" />
                    <span className="text-[11px] font-semibold text-foreground">New chat</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[2px]">
                    <FileText size={12} className="text-muted-text" />
                    <span className="text-[11px] font-semibold text-muted-text">
                      {activeFileMeta ? activeFileMeta.filename : "No file"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-element rounded-[2px] border border-border-layout-strong">
                  <FileText size={12} className="text-muted-text" />
                  <span className="text-[11px] font-semibold text-foreground">
                    {activeFileMeta ? activeFileMeta.filename : "No file"}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                className={`p-1.5 rounded-[2px] border transition-colors ${
                  isConsoleOpen ? "border-primary text-primary" : "border-transparent text-muted-text hover:text-foreground"
                }`}
                title="Toggle Logs"
              >
                <Terminal size={14} />
              </button>
              
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="bg-bg-element text-[11px] font-semibold text-foreground border border-border-layout-strong px-2 py-1.5 rounded-[2px] outline-none cursor-pointer hover:border-primary/50 transition-colors"
                title="Select AI Model"
              >
                <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</option>
                <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile</option>
                <option value="llama-3.1-8b-instant">llama-3.1-8b-instant</option>
              </select>

              <button className="flex items-center gap-1.5 papr-btn-primary px-3 py-1.5 text-[11px]">
                Tools <LayoutGrid size={12} />
              </button>
            </div>
          </div>

          {/* Monaco Editor Wrapper OR Chat View */}
          <div className="flex-1 min-h-0 relative flex flex-col">
            {activeSidebarTab === "chats" ? (
              <div className="flex-1 flex flex-col p-8 relative max-h-full overflow-hidden">
                <div className="flex-1 flex flex-col w-full max-w-3xl mx-auto relative h-full">
                  
                  {chatHistory.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center -mt-10">
                      <img src="/papr-chatbot.svg" alt="Papr Chatbot" className="w-56 h-auto mb-8" />
                      <h1 className="text-2xl font-bold text-foreground mb-2">What would you like to write?</h1>
                      <p className="text-[13px] text-muted-text mb-8 max-w-md text-center">From research papers to mathematical proofs, presentations, and beautifully typeset documents.</p>
                      
                      <div className="grid grid-cols-5 gap-3 w-full max-w-2xl">
                        {[
                          { label: "Research Paper", icon: FileText },
                          { label: "Equation", icon: Calculator },
                          { label: "Beamer Slides", icon: Presentation },
                          { label: "Bibliography", icon: BookOpen },
                          { label: "Table / Figure", icon: LayoutGrid },
                        ].map((btn, i) => (
                          <button
                            key={i}
                            onClick={() => setChatInput(btn.label)}
                            className="flex flex-col items-center justify-center gap-3 p-4 rounded-[8px] bg-bg-element/50 border border-border-layout hover:border-primary/50 hover:bg-bg-element transition-all cursor-pointer text-foreground text-[11px] font-medium"
                          >
                            <btn.icon size={18} className="text-primary/70" />
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col gap-6 pb-24">
                      {chatHistory.map((msg, idx) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[85%] rounded-[2px] px-4 py-3 text-[13px] leading-relaxed border ${
                              isUser
                                ? "self-end bg-primary/10 text-foreground border-primary/20 rounded-tr-none"
                                : "self-start bg-bg-element text-foreground border-border-layout-strong rounded-tl-none"
                            }`}
                          >
                            <pre className="whitespace-pre-wrap font-sans leading-relaxed break-words">
                              {msg.content}
                            </pre>
                            {!isUser && !msg.content.startsWith("Error:") && (
                              <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-border-layout-strong self-end w-full">
                                {msg.newContent ? (
                                  <div className="flex flex-col gap-2 border border-border-layout-strong rounded-[4px] bg-bg-editor p-3 w-full">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-muted-text" />
                                        <span className="text-[12px] font-semibold text-foreground">
                                          {activeFileMeta?.filename || "main.tex"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[11px] font-mono">
                                        <span className="text-green-400">+{msg.additions}</span>
                                        <span className="text-red-400">-{msg.deletions}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                      <button
                                        type="button"
                                        onClick={() => handleReviewDiff(msg.newContent!)}
                                        className="text-[10px] text-muted-text hover:text-foreground bg-bg-element px-2.5 py-1 rounded-[2px] border border-border-layout-strong transition-all cursor-pointer font-medium"
                                      >
                                        Review Diff
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAcceptToolCall(msg.newContent!)}
                                        className="text-[10px] text-primary hover:text-white bg-primary/10 hover:bg-primary px-2.5 py-1 rounded-[2px] border border-primary/20 transition-all font-semibold cursor-pointer"
                                      >
                                        Accept
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-2 w-full">
                                    <button
                                      type="button"
                                      onClick={() => handleCopyText(msg.content)}
                                      className="text-[10px] text-muted-text hover:text-foreground bg-bg-editor px-2.5 py-1 rounded-[2px] border border-border-layout-strong transition-all cursor-pointer font-medium"
                                    >
                                      Copy
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => applyAIResponse(msg.content)}
                                      className="text-[10px] text-primary hover:text-white bg-primary/10 hover:bg-primary px-2.5 py-1 rounded-[2px] border border-primary/20 transition-all font-semibold cursor-pointer"
                                    >
                                      Apply
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {isChatting && (
                        <div className="self-start flex items-center gap-2 rounded-[2px] bg-bg-element border border-border-layout-strong px-4 py-3 text-[13px] rounded-tl-none animate-pulse">
                          <Loader2 className="animate-spin text-primary" size={14} />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center gap-3 w-full bg-gradient-to-t from-bg-editor via-bg-editor to-transparent pt-6 pb-2">
                    {chatHistory.length === 0 && (
                      <button className="flex items-center gap-2 px-4 py-2 bg-bg-element hover:bg-border-layout border border-border-layout-strong rounded-[2px] text-xs font-semibold transition-colors shadow-sm cursor-pointer">
                        <Sparkles size={14} className="text-muted-text" />
                        Review paper
                      </button>
                    )}
                    
                    <form 
                      onSubmit={(e) => { 
                        e.preventDefault(); 
                        if(chatInput.trim()) { 
                          handleChatSubmit(e); 
                        } 
                      }} 
                      className="w-full flex items-center gap-2 bg-bg-element/80 backdrop-blur-xl border border-border-layout-strong rounded-[2px] p-1.5 shadow-2xl transition-all focus-within:border-primary/50 mx-auto"
                    >
                      <div className="flex-1 flex items-center px-3">
                        <input
                          type="text"
                          placeholder="Ask anything"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="w-full bg-transparent text-foreground text-[13px] focus:outline-none placeholder:text-muted-text"
                          disabled={isChatting}
                        />
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0 px-2">
                        <button type="button" className="text-muted-text hover:text-foreground p-1.5 transition-colors cursor-pointer rounded-[2px] hover:bg-border-layout-strong">
                          <Paperclip size={16}/>
                        </button>
                        <button type="button" className="text-muted-text hover:text-foreground p-1.5 transition-colors cursor-pointer rounded-[2px] hover:bg-border-layout-strong">
                          <Mic size={16}/>
                        </button>
                        <button 
                          type="submit" 
                          className={`p-1.5 rounded-[2px] transition-colors cursor-pointer flex items-center justify-center ${chatInput.trim() ? "bg-foreground text-black hover:bg-white" : "text-muted-text hover:text-foreground hover:bg-border-layout-strong"}`}
                        >
                          <ArrowUp size={16} strokeWidth={3}/>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            ) : activeFileId ? (
              <Editor
                height="100%"
                theme={theme === "dark" ? "vs-dark" : "vs"}
                path={activeFileMeta?.filename}
                language={
                  activeFileMeta?.file_type === "tex"
                    ? "latex"
                    : activeFileMeta?.file_type === "bib"
                    ? "bibtex"
                    : "plaintext"
                }
                value={activeFileContent}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  fontFamily: "'JetBrains Mono', monospace",
                  lineNumbers: "on",
                  scrollbar: {
                    verticalScrollbarSize: 10,
                    horizontalScrollbarSize: 10,
                  },
                  automaticLayout: true,
                  padding: { top: 16 },
                }}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-2">
                <FileText size={36} className="text-gray-600" />
                <span className="text-sm">Select a file to begin writing</span>
              </div>
            )}

            {/* Inline Floating Selection Toolbar */}
            {selectionToolbar && (
              <div
                ref={toolbarRef}
                className="absolute z-40 animate-in fade-in zoom-in-95 duration-100"
                style={{
                  top: `${selectionToolbar.top}px`,
                  left: `${Math.min(selectionToolbar.left, 320)}px`,
                  maxWidth: 'calc(100% - 16px)'
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {!isInlineExpanded ? (
                  <div className="flex items-center gap-1 bg-bg-element/95 backdrop-blur-xl border border-border-layout-strong rounded-[2px] px-1.5 py-1 shadow-lg shadow-black/20">
                    <button
                      type="button"
                      onClick={() => {
                        setIsInlineExpanded(true);
                        setTimeout(() => inlineInputRef.current?.focus(), 50);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-border-layout-strong rounded-[2px] transition-all cursor-pointer"
                    >
                      <Sparkles size={12} className="text-primary" />
                      Ask AI
                    </button>
                    <div className="w-px h-5 bg-border-layout-strong" />
                    <button
                      type="button"
                      onClick={() => handleEditSubmit(undefined, "Improve the writing quality, clarity, and style.")}
                      disabled={isEditLoading}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-muted-text hover:text-foreground hover:bg-border-layout-strong rounded-[2px] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isEditLoading ? <Loader2 className="animate-spin" size={10} /> : null}
                      Improve
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 bg-bg-element/95 backdrop-blur-xl border border-border-layout-strong rounded-[2px] p-3 shadow-lg shadow-black/20 w-[340px]">
                    <form onSubmit={(e) => handleEditSubmit(e)} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 flex-1 bg-bg-editor border border-border-layout-strong rounded-[2px] px-2.5 py-1.5 focus-within:border-primary/60 transition-colors">
                        <Sparkles size={11} className="text-primary shrink-0" />
                        <input
                          ref={inlineInputRef}
                          type="text"
                          placeholder="Ask AI to edit..."
                          value={promptText}
                          onChange={(e) => setPromptText(e.target.value)}
                          className="flex-1 bg-transparent text-foreground text-[11px] focus:outline-none placeholder:text-muted-text"
                          disabled={isEditLoading}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isEditLoading || !promptText.trim()}
                        className="px-2.5 py-1.5 bg-primary hover:bg-primary-hover disabled:opacity-40 text-white text-[11px] font-bold rounded-[2px] transition-all shrink-0 cursor-pointer flex items-center gap-1"
                      >
                        {isEditLoading ? <Loader2 className="animate-spin" size={10} /> : <ChevronUp size={12} />}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Floating Chat Input inside Editor (Only in Files Mode) */}
          {activeSidebarTab === "files" && (
            <div className="absolute bottom-6 left-12 right-12 flex flex-col gap-3 z-30 pointer-events-none">
               <div className="pointer-events-auto flex flex-col gap-2 max-w-2xl mx-auto w-full">
               
               {/* Chat History Overlay */}
               {isChatOpen && (
                 <div 
                   style={{ height: chatHeight }}
                   className="bg-bg-chat backdrop-blur-xl border border-border-layout rounded-[2px] shadow-2xl p-4 relative overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-200"
                 >
                    {/* Chat Resizer Handle */}
                    <div
                      onMouseDown={handleChatResizeMouseDown}
                      className="absolute top-0 left-0 right-0 h-3 cursor-row-resize hover:bg-white/5 z-10 flex items-center justify-center group"
                    >
                      <div className="w-8 h-1 bg-border-layout-strong group-hover:bg-primary/50 rounded-[2px] transition-colors" />
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-border-layout shrink-0 mt-2">
                      <span className="text-[11px] font-semibold flex items-center gap-2 text-foreground">
                        <Sparkles size={12} className="text-primary" /> Papr Copilot
                      </span>
                      <button onClick={() => setIsChatOpen(false)} className="text-muted-text hover:text-foreground">
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden flex flex-col gap-4 mt-4">
                    {chatHistory.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-text py-8">
                        <p className="text-[11px] leading-relaxed max-w-xs">
                          Ask questions about this LaTeX document, or ask for formatting tips.
                        </p>
                      </div>
                    ) : (
                      chatHistory.map((msg, idx) => {
                        const isUser = msg.role === "user";
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col max-w-[85%] rounded-[2px] px-3.5 py-2.5 text-xs leading-relaxed border ${
                              isUser
                                ? "self-end bg-primary/10 text-foreground border-primary/20 rounded-tr-none"
                                : "self-start bg-bg-element text-foreground border-border-layout-strong rounded-tl-none"
                            }`}
                          >
                            <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed break-words">
                              {msg.content}
                            </pre>

                            {/* "1 file changed +59 -4 > | Review" Box */}
                            {msg.newContent && (
                              <div className="mt-3 bg-[#09090b] border border-border-layout-strong rounded p-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-[10px] font-mono">
                                  <span className="text-foreground">1 file changed</span>
                                  <span className="text-green-500">+{msg.additions || 0}</span>
                                  <span className="text-red-500">-{msg.deletions || 0}</span>
                                  <ChevronRight size={12} className="text-muted-text ml-1" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => reviewAIEdits(msg.newContent!)}
                                  className="flex items-center gap-1.5 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-[4px] text-[10px] text-white transition-all cursor-pointer font-medium"
                                >
                                  <FileText size={10} /> Review
                                </button>
                              </div>
                            )}

                            {/* Icon Action Bar */}
                            {!isUser && !msg.content.startsWith("Error:") && (
                              <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border-layout/50 self-start text-muted-text w-full">
                                <button
                                  type="button"
                                  onClick={() => applyAIResponse(msg.content)}
                                  className="p-1 hover:text-foreground hover:bg-white/5 rounded transition-all"
                                  title="Smart Apply Text"
                                >
                                  <CornerDownRight size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(msg.content)}
                                  className="p-1 hover:text-foreground hover:bg-white/5 rounded transition-all"
                                  title="Copy"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="p-1 hover:text-foreground hover:bg-white/5 rounded transition-all ml-1"
                                  title="Helpful"
                                >
                                  <ThumbsUp size={13} />
                                </button>
                                <button
                                  type="button"
                                  className="p-1 hover:text-foreground hover:bg-white/5 rounded transition-all"
                                  title="Not Helpful"
                                >
                                  <ThumbsDown size={13} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                    {isChatting && (
                      <div className="self-start flex items-center gap-2 rounded-[2px] bg-bg-element border border-border-layout-strong px-3.5 py-2.5 text-xs rounded-tl-none animate-pulse">
                        <Loader2 className="animate-spin text-primary" size={10} />
                      </div>
                    )}
                   </div>
                 </div>
               )}

               {/* Input Bar */}
               <form 
                 onSubmit={(e) => { 
                   e.preventDefault(); 
                   if(chatInput.trim()) { 
                     handleChatSubmit(e); 
                     setIsChatOpen(true); 
                   } else {
                     setIsChatOpen(!isChatOpen);
                   }
                 }} 
                 className="relative flex items-center gap-2 bg-bg-element/80 backdrop-blur-md rounded-[8px] p-2 transition-all border border-border-layout-strong focus-within:border-primary focus-within:shadow-[0_0_0_3px_var(--bg-editor),0_0_0_4.5px_var(--primary)] mb-4 shrink-0 mx-auto w-full max-w-3xl"
               >
                 <button type="button" className="text-muted-text hover:text-foreground p-1.5 transition-colors cursor-pointer rounded-[4px] border border-border-layout shrink-0 ml-1">
                   <Plus size={16}/>
                 </button>
                 
                 <div className="flex-1 flex items-center px-1">
                   <input
                     type="text"
                     placeholder="Write an equation, theorem, or paper..."
                     value={chatInput}
                     onChange={(e) => setChatInput(e.target.value)}
                     className="w-full bg-transparent text-foreground text-[13px] focus:outline-none placeholder:text-muted-text"
                     disabled={isChatting}
                   />
                 </div>
                 
                 <div className="flex items-center gap-4 shrink-0 px-2 text-muted-text text-[12px] font-medium">
                   <button type="button" className="hover:text-foreground transition-colors cursor-pointer flex items-center">
                     <SlidersHorizontal size={14}/>
                   </button>
                   <div className="flex items-center gap-1.5 cursor-pointer hover:text-foreground">
                     <span>Template</span>
                     <ChevronDown size={12}/>
                   </div>
                   <button 
                     type="submit" 
                     className="hover:text-foreground transition-colors cursor-pointer ml-1"
                   >
                     <CornerDownLeft size={16} />
                   </button>
                 </div>
               </form>

               </div>
            </div>
          )}

          {/* Bottom Drawer: Compiler Console */}
          {isConsoleOpen && (
            <div className="absolute bottom-0 left-0 right-0 h-[30vh] border-t border-border-layout bg-bg-sidebar/95 backdrop-blur-xl flex flex-col z-20">
              <div
                onMouseDown={handleConsoleResizeMouseDown}
                className="absolute top-0 left-0 right-0 h-1 cursor-row-resize hover:bg-primary/60 transition-colors select-none"
              />
              <div className="h-9 px-4 border-b border-border-layout flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider">
                  Compiler Console
                </span>
                <button
                  onClick={() => setIsConsoleOpen(false)}
                  className="text-muted-text hover:text-foreground p-1 transition-colors cursor-pointer"
                >
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex-1 flex min-h-0">
                {/* Error List */}
                <div className="w-1/2 border-r border-border-layout overflow-y-auto p-3 flex flex-col gap-2">
                  {compileErrors.length === 0 ? (
                    <div className="text-xs text-muted-text italic">No errors!</div>
                  ) : (
                    compileErrors.map((err, idx) => (
                      <div
                        key={idx}
                        onClick={() => jumpToLine(err.line)}
                        className="flex flex-col p-2 bg-red-500/10 border border-red-500/20 rounded-[2px] cursor-pointer hover:border-red-500/40 text-xs"
                      >
                        <span className="text-red-400 font-semibold mb-1">Line {err.line}</span>
                        <p className="text-foreground/90 font-mono text-[10px]">{err.error}</p>
                      </div>
                    ))
                  )}
                </div>
                {/* Raw Logs */}
                <div className="w-1/2 overflow-y-auto p-3 font-mono text-[10px] text-muted-text">
                  <pre className="whitespace-pre-wrap">{compileLogs || "Idle."}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PDF Preview Container */}
        <div 
          style={{ width: previewWidth }}
          className="bg-bg-editor text-foreground overflow-hidden flex flex-col relative border-l border-border-layout shrink-0"
        >
          {/* Preview Resizer Handle */}
          <div
            onMouseDown={handlePreviewResizeMouseDown}
            className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-black/10 z-10"
          />
          
          {/* PDF Internal Header */}
          <div className="h-12 border-b border-border-layout px-4 flex items-center shrink-0">
            <button 
              onClick={() => compileProject()} 
              disabled={isCompiling} 
              className="flex items-center gap-1.5 text-foreground hover:text-white transition-colors text-[11px] font-semibold cursor-pointer"
            >
              <Loader2 size={14} className={isCompiling ? "animate-spin" : "hidden"} />
              {!isCompiling && <RotateCw size={12} className="rotate-0" />}
              {isCompiling ? "Compiling..." : "Compile"}
            </button>
          </div>

          {/* PDF Viewer Area */}
          <div className="flex-1 relative bg-white overflow-hidden">
            {isCompiling ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 gap-3 bg-white/50 backdrop-blur-sm z-10">
                <Loader2 className="animate-spin text-gray-400" size={28} />
              </div>
            ) : pdfUrl ? (
              <PDFViewer url={pdfUrl} />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2 p-6 text-center">
                <Play size={24} fill="currentColor" className="text-gray-300" />
                <p className="text-xs max-w-xs">Compile to view PDF</p>
              </div>
            )}
          </div>
        </div>

      {/* Diff Review Modal Overlay */}
      {isDiffOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl h-[85vh] bg-surface border border-panel-border rounded-[2px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-100">
            {/* Modal Header */}
            <div className="h-12 border-b border-panel-border bg-surface px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={14} />
                <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                  Review AI Selection Edits
                </span>
              </div>
              <span className="text-[10px] text-muted-text">
                Original (Left) vs. Modified (Right)
              </span>
            </div>

            {/* Diff Editor Container */}
            <div className="flex-1 min-h-0 bg-background">
              <DiffEditor
                height="100%"
                theme={theme === "dark" ? "vs-dark" : "vs"}
                language="latex"
                original={diffOriginal}
                modified={diffModified}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                  },
                  automaticLayout: true,
                }}
              />
            </div>

            {/* Modal Footer Actions */}
            <div className="h-14 border-t border-panel-border bg-surface px-4 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={handleRejectEdit}
                className="px-4 py-1.5 border border-panel-border bg-background hover:bg-btn-secondary-hover text-muted-text hover:text-foreground text-xs font-semibold rounded-[2px] transition-all cursor-pointer"
              >
                Reject Changes
              </button>
              <button
                type="button"
                onClick={handleAcceptEdit}
                className="papr-btn-double flex items-center gap-1.5 text-xs cursor-pointer"
              >
                <span className="papr-corner tl"></span>
                <span className="papr-corner tr"></span>
                <span className="papr-corner bl"></span>
                <span className="papr-corner br"></span>
                Accept Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {isRenameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-editor border border-border-layout rounded-[2px] p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h2 className="text-xl font-bold text-foreground mb-2">Rename Project</h2>
            <p className="text-muted-text text-sm mb-6">
              Enter a new name for your project.
            </p>

            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                if (!renameValue.trim() || !currentProject) return;
                setIsRenaming(true);
                try {
                  await renameProject(currentProject.id, renameValue.trim());
                  setIsRenameModalOpen(false);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsRenaming(false);
                }
              }} 
              className="flex flex-col gap-4"
            >
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-text mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-global border border-border-layout rounded-[2px] focus:outline-none focus:border-primary/50 text-foreground text-sm"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsRenameModalOpen(false)}
                  className="papr-btn-primary px-4 py-2 text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRenaming}
                  className="flex items-center gap-2 papr-btn-primary px-4 py-2 text-xs transition-opacity text-xs font-semibold cursor-pointer"
                >
                  {isRenaming && <Loader2 className="animate-spin" size={14} />}
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
