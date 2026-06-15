import { create } from "zustand";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface FileMeta {
  id: string;
  filename: string;
  path: string;
  file_type: string;
}

export interface Project {
  id: string;
  name: string;
  template: string;
  created_at: string;
  updated_at: string;
  files?: FileMeta[];
  main_file?: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  activeFileId: string | null;
  fileContents: Record<string, string>; // Maps fileId to content
  saveStatus: "saved" | "saving" | "dirty";
  isLoading: boolean;
  error: string | null;
  isCompiling: boolean;
  compileErrors: any[];
  compileLogs: string;
  pdfUrl: string | null;

  // Actions
  fetchProjects: () => Promise<void>;
  createProject: (name: string, template: string) => Promise<string>;
  selectProject: (id: string) => Promise<void>;
  selectFile: (fileId: string) => Promise<void>;
  updateFileContent: (fileId: string, content: string) => void;
  saveFile: (fileId: string) => Promise<void>;
  createFile: (filename: string, pathPrefix?: string) => Promise<void>;
  deleteFile: (fileId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  compileProject: () => Promise<void>;
  chatHistory: { role: "user" | "model"; content: string; newContent?: string; additions?: number; deletions?: number }[];
  isChatting: boolean;
  sendChatMessage: (content: string) => Promise<void>;
  clearChat: () => void;
  editSelection: (text: string, instruction: string) => Promise<string>;
  fixErrorWithAI: (errorInfo: any) => Promise<{ explanation: string; fileId: string; fixedCode: string }>;
  theme: "dark" | "light";
  toggleTheme: () => void;
  aiModel: string;
  setAiModel: (model: string) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  currentProject: null,
  activeFileId: null,
  fileContents: {},
  saveStatus: "saved",
  isLoading: false,
  error: null,
  isCompiling: false,
  compileErrors: [],
  compileLogs: "",
  pdfUrl: null,
  chatHistory: [],
  isChatting: false,
  theme: typeof window !== "undefined" ? (localStorage.getItem("theme") as "dark" | "light" || "dark") : "dark",
  aiModel: "llama-3.3-70b-versatile",

  setAiModel: (model: string) => set({ aiModel: model }),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`);
      const data = await res.json();
      if (data.success) {
        set({ projects: data.data, isLoading: false });
      } else {
        throw new Error(data.error?.message || "Failed to load projects");
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", isLoading: false });
    }
  },

  createProject: async (name: string, template: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, template }),
      });
      const data = await res.json();
      if (data.success) {
        set({ isLoading: false });
        await get().fetchProjects();
        return data.data.project_id;
      } else {
        throw new Error(data.error?.message || "Failed to create project");
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to create project", isLoading: false });
      throw err;
    }
  },

  renameProject: async (projectId: string, newName: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}/rename`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      const data = await res.json();
      if (data.success) {
        await get().fetchProjects();
        // If it's the currently open project, optionally update its name in state
        const { currentProject } = get();
        if (currentProject && currentProject.id === projectId) {
          set({ currentProject: { ...currentProject, name: newName } });
        }
      } else {
        throw new Error(data.error?.message || "Failed to rename project");
      }
    } catch (err: any) {
      set({ error: err.message || "Failed to rename project" });
      throw err;
    }
  },

  selectProject: async (id: string) => {
    set({ isLoading: true, error: null, currentProject: null, activeFileId: null, chatHistory: [] });
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${id}`);
      const data = await res.json();
      if (data.success) {
        set({ currentProject: data.data, isLoading: false });
        
        // Select main.tex by default if it exists
        const files = data.data.files || [];
        const mainTex = files.find((f: FileMeta) => f.filename === "main.tex" || f.path === "main.tex");
        if (mainTex) {
          await get().selectFile(mainTex.id);
        } else if (files.length > 0) {
          await get().selectFile(files[0].id);
        }
        
        // Auto-compile project on initial load
        get().compileProject();
      } else {
        throw new Error(data.error?.message || "Failed to load project details");
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", isLoading: false });
    }
  },

  selectFile: async (fileId: string) => {
    const { currentProject, fileContents } = get();
    if (!currentProject) return;

    set({ activeFileId: fileId });

    // Lazy load content if not already loaded
    if (fileContents[fileId] === undefined) {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/projects/${currentProject.id}/files/${fileId}/content`
        );
        const data = await res.json();
        if (data.success) {
          set((state) => ({
            fileContents: {
              ...state.fileContents,
              [fileId]: data.data.content,
            },
          }));
        } else {
          throw new Error(data.error?.message || "Failed to load file content");
        }
      } catch (err: any) {
        console.error("Failed to load file content:", err);
      }
    }
  },

  updateFileContent: (fileId: string, content: string) => {
    set((state) => ({
      fileContents: {
        ...state.fileContents,
        [fileId]: content,
      },
      saveStatus: "dirty",
    }));
  },

  saveFile: async (fileId: string) => {
    const { currentProject, fileContents } = get();
    if (!currentProject) return;

    set({ saveStatus: "saving" });
    const content = fileContents[fileId] || "";

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/files/${fileId}?project_id=${currentProject.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        }
      );
      const data = await res.json();
      if (data.success) {
        set({ saveStatus: "saved" });
      } else {
        throw new Error(data.error?.message || "Failed to save file");
      }
    } catch (err) {
      console.error("Failed to save file:", err);
      set({ saveStatus: "dirty" });
    }
  },

  createFile: async (filename: string, pathPrefix = "") => {
    const { currentProject } = get();
    if (!currentProject) return;

    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${currentProject.id}/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename, content: "", path_prefix: pathPrefix }),
      });
      const data = await res.json();
      if (data.success) {
        set({ isLoading: false });
        // Reload project to update file tree
        await get().selectProject(currentProject.id);
      } else {
        throw new Error(data.error?.message || "Failed to create file");
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", isLoading: false });
    }
  },

  deleteFile: async (fileId: string) => {
    const { currentProject, activeFileId } = get();
    if (!currentProject) return;

    set({ isLoading: true });
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/files/${fileId}?project_id=${currentProject.id}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (data.success) {
        set({ isLoading: false });
        
        // Remove content from state
        set((state) => {
          const newContents = { ...state.fileContents };
          delete newContents[fileId];
          return { fileContents: newContents };
        });

        // If active file was deleted, switch active file
        const nextActive = activeFileId === fileId ? null : activeFileId;

        // Reload project
        await get().selectProject(currentProject.id);

        if (nextActive) {
          set({ activeFileId: nextActive });
        }
      } else {
        throw new Error(data.error?.message || "Failed to delete file");
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", isLoading: false });
    }
  },

  deleteProject: async (projectId: string) => {
    set({ isLoading: true });
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        set({ isLoading: false });
        await get().fetchProjects();
      } else {
        throw new Error(data.error?.message || "Failed to delete project");
      }
    } catch (err: any) {
      set({ error: err.message || "An error occurred", isLoading: false });
    }
  },

  compileProject: async () => {
    const { currentProject, activeFileId, saveStatus, saveFile } = get();
    if (!currentProject) return;

    set({ isCompiling: true, compileErrors: [], compileLogs: "" });

    // Save active file if it is currently modified and unsaved
    if (saveStatus === "dirty" && activeFileId) {
      await saveFile(activeFileId);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/compile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: currentProject.id }),
      });
      const data = await res.json();
      if (data.success) {
        set({
          isCompiling: false,
          compileErrors: [],
          compileLogs: data.data.logs,
          pdfUrl: `${API_BASE_URL}${data.data.pdf_url}?t=${Date.now()}` // Add cache-busting timestamp
        });
      } else {
        const errorDetails = data.error?.details || {};
        set({
          isCompiling: false,
          compileErrors: errorDetails.errors || [],
          compileLogs: errorDetails.logs || "Compilation failed.",
          pdfUrl: null
        });
      }
    } catch (err: any) {
      set({
        isCompiling: false,
        compileErrors: [{ line: 1, error: err.message || "Failed to trigger compilation", context: "", file: "main.tex" }],
        compileLogs: err.message || "Network error",
        pdfUrl: null
      });
    }
  },

  sendChatMessage: async (content: string) => {
    const { currentProject, activeFileId, fileContents, chatHistory, aiModel } = get();
    if (!currentProject) return;

    // 1. Gather active file context
    const activeFileMeta = (currentProject.files || []).find((f) => f.id === activeFileId);
    let context = "";
    if (activeFileMeta && activeFileId) {
      const activeContent = fileContents[activeFileId] || "";
      context = `Active File: ${activeFileMeta.path}\n\`\`\`latex\n${activeContent}\n\`\`\``;
    }

    const newUserMessage = { role: "user" as const, content };
    const updatedHistory = [...chatHistory, newUserMessage];
    
    set({
      chatHistory: updatedHistory,
      isChatting: true
    });

    try {
      // Setup payload with context.
      let promptWithContext = content;
      if (context) {
        promptWithContext = `<active_document>\n${context}\n</active_document>\n\n<user_request>\n${content}\n</user_request>`;
      } else {
        promptWithContext = `<user_request>\n${content}\n</user_request>`;
      }

      // Format messages for the backend (excluding the current user message which will be replaced with promptWithContext)
      const apiMessages = chatHistory.map(m => ({ role: m.role, content: m.content }));
      apiMessages.push({ role: "user", content: promptWithContext });

      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          provider: "groq",
          model: aiModel,
          project_id: currentProject.id,
          active_file_id: activeFileId
        }),
      });
      const data = await res.json();
      if (data.success) {
        let additions = 0;
        let deletions = 0;
        const newContent = data.data.new_content;
        
        if (newContent && activeFileId) {
          const oldContent = fileContents[activeFileId] || "";
          const oldLines = oldContent.split("\n");
          const newLines = newContent.split("\n");
          
          // Simple diff heuristic
          const oldLineSet = new Set(oldLines);
          const newLineSet = new Set(newLines);
          
          additions = newLines.filter((l: string) => !oldLineSet.has(l)).length;
          deletions = oldLines.filter((l: string) => !newLineSet.has(l)).length;
        }

        set({
          chatHistory: [...updatedHistory, { 
            role: "model" as const, 
            content: data.data.response,
            newContent,
            additions,
            deletions
          }],
          isChatting: false
        });
      } else {
        throw new Error(data.error?.message || "Failed to generate AI response.");
      }
    } catch (err: any) {
      set({
        chatHistory: [...updatedHistory, { role: "model" as const, content: `Error: ${err.message || "Could not connect to AI service."}` }],
        isChatting: false
      });
    }
  },

  clearChat: () => {
    set({ chatHistory: [] });
  },

  editSelection: async (text: string, instruction: string) => {
    const { currentProject, activeFileId, fileContents, aiModel } = get();
    if (!currentProject) throw new Error("No active project");

    // Gather active file context
    const activeFileMeta = (currentProject.files || []).find((f) => f.id === activeFileId);
    let context = "";
    if (activeFileMeta && activeFileId) {
      const activeContent = fileContents[activeFileId] || "";
      context = `Active File: ${activeFileMeta.path}\n\`\`\`latex\n${activeContent}\n\`\`\``;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          instruction,
          context,
          provider: "groq",
          model: aiModel
        }),
      });
      const data = await res.json();
      if (data.success) {
        return data.data.text;
      } else {
        throw new Error(data.error?.message || "Failed to edit selection.");
      }
    } catch (err: any) {
      throw new Error(err.message || "Network error while editing selection.");
    }
  },

  fixErrorWithAI: async (errorInfo: any) => {
    const { currentProject, activeFileId, fileContents, updateFileContent, saveFile, compileProject, aiModel } = get();
    if (!currentProject) throw new Error("No active project");

    // 1. Find the target file associated with the error
    const files = currentProject.files || [];
    const targetFile = files.find(f => f.filename === errorInfo.file || f.path === errorInfo.file)
      || files.find(f => f.filename === "main.tex");

    if (!targetFile) {
      throw new Error(`Could not find the target file: ${errorInfo.file || "main.tex"}`);
    }

    const fileId = targetFile.id;
    let fileContent = fileContents[fileId];

    // 2. Fetch content if not loaded
    if (fileContent === undefined) {
      const res = await fetch(`${API_BASE_URL}/api/projects/${currentProject.id}/files/${fileId}/content`);
      const data = await res.json();
      if (data.success) {
        fileContent = data.data.content;
        updateFileContent(fileId, fileContent);
      } else {
        throw new Error(data.error?.message || "Failed to load file content.");
      }
    }

    // 3. Call AI fix API
    const errorMsg = `Error at line ${errorInfo.line || 1} in file ${errorInfo.file || "main.tex"}: ${errorInfo.error || "Unknown error"}\nContext: ${errorInfo.context || ""}`;
    const res = await fetch(`${API_BASE_URL}/api/ai/fix`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: fileContent,
        errors: errorMsg,
        provider: "groq",
        model: aiModel
      })
    });

    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error?.message || "AI failed to suggest a fix.");
    }

    const { explanation, fixed_code } = data.data;

    // 4. Update and save
    updateFileContent(fileId, fixed_code);
    await saveFile(fileId);

    // 5. Compile
    await compileProject();

    return { explanation, fileId, fixedCode: fixed_code };
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: nextTheme });
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", nextTheme);
      document.documentElement.setAttribute("data-theme", nextTheme);
    }
  },
}));
