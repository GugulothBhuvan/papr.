"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore, Project } from "../store/projectStore";
import { Plus, Trash2, Search, ChevronDown, LayoutGrid, List, FileText, Loader2, Sidebar, MoreHorizontal } from "lucide-react";
import ProfileFooter from "@/components/ProfileFooter";

function PaprLogo({ className = "h-8 w-auto" }: { className?: string }) {
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

export default function Dashboard() {
  const router = useRouter();
  const { projects, isLoading, error, fetchProjects, createProject, deleteProject, theme, toggleTheme } =
    useProjectStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("Blank");
  const [isCreating, setIsCreating] = useState(false);

  // New state variables for Dashboard controls
  const [activeTab, setActiveTab] = useState<"all" | "your" | "shared">("your");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const [isNewDropdownOpen, setIsNewDropdownOpen] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    try {
      const projectId = await createProject(newProjectName.trim(), selectedTemplate);
      setIsModalOpen(false);
      setNewProjectName("");
      setSelectedTemplate("Blank");
      router.push(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Avoid triggering open card navigation
    if (confirm("Are you sure you want to delete this project?")) {
      await deleteProject(id);
    }
  };

  // Filter projects based on active tab and search query
  const filteredProjects = projects.filter((project) => {
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (activeTab === "your") {
      return true; // For now, treat all fetched projects as "your" projects
    }
    if (activeTab === "shared") {
      return false; // Mocking no shared projects for now
    }
    return true; // "all"
  });

  return (
    <div className="flex h-screen bg-bg-global text-foreground font-sans overflow-hidden transition-colors duration-200">
      
      {/* Sidebar */}
      <aside className="w-64 bg-bg-sidebar flex flex-col justify-between shrink-0 border-r border-border-layout">
        <div className="flex flex-col">
          {/* Top Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b border-border-layout shrink-0">
            <div className="cursor-pointer" onClick={() => router.push("/")} title="Go to Home">
              <PaprLogo className="h-6 w-auto ml-2 hover:opacity-80 transition-opacity" />
            </div>
            <button onClick={toggleTheme} className="p-1.5 rounded-[2px] text-muted-text hover:text-foreground hover:bg-bg-element transition-colors">
              <Sidebar size={18} />
            </button>
          </div>
          
          <div className="p-4 mt-2">
            {/* Navigation */}
            <nav className="flex flex-col gap-1 text-[12px] text-muted-text font-medium">
            <button 
              onClick={() => setActiveTab("all")}
              className={`flex items-center justify-start gap-2 px-3 py-2 rounded-[2px] transition-colors ${activeTab === 'all' ? 'bg-bg-element text-foreground' : 'hover:bg-bg-element/50'}`}
            >
              All Projects
            </button>
            <button 
              onClick={() => setActiveTab("your")}
              className={`flex items-center justify-start gap-2 px-3 py-2 rounded-[2px] transition-colors ${activeTab === 'your' ? 'bg-bg-element text-foreground' : 'hover:bg-bg-element/50'}`}
            >
              Your Projects
            </button>
            <button 
              onClick={() => setActiveTab("shared")}
              className={`flex items-center justify-start gap-2 px-3 py-2 rounded-[2px] transition-colors ${activeTab === 'shared' ? 'bg-bg-element text-foreground' : 'hover:bg-bg-element/50'}`}
            >
              Shared with you
            </button>
            </nav>
          </div>
        </div>

        {/* Bottom Profile */}
        <ProfileFooter showInvite={false} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 bg-bg-editor overflow-hidden flex flex-col relative shadow-sm">
          
          {/* Main Header */}
          <header className="flex items-center justify-between h-16 px-6 shrink-0 border-b border-border-layout bg-bg-header">
            <h1 className="text-3xl font-display tracking-[-1px] font-normal text-foreground">
              {activeTab === "all" && "All Projects"}
              {activeTab === "your" && "Your Projects"}
              {activeTab === "shared" && "Shared with you"}
            </h1>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text" size={14} />
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-1.5 bg-bg-global border border-border-layout rounded-[2px] text-[12px] text-foreground focus:outline-none focus:border-primary/50 transition-colors w-64"
                />
              </div>

              {/* View Toggles */}
              <div className="flex items-center bg-bg-global border border-border-layout rounded-[2px] p-0.5">
                <button 
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-[2px] transition-colors ${viewMode === 'list' ? 'text-foreground bg-bg-element shadow-sm' : 'text-muted-text hover:text-foreground'}`}
                >
                  <List size={14}/>
                </button>
                <button 
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-[2px] transition-colors ${viewMode === 'grid' ? 'text-foreground bg-bg-element shadow-sm' : 'text-muted-text hover:text-foreground'}`}
                >
                  <LayoutGrid size={14}/>
                </button>
              </div>

              {/* Import Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsImportDropdownOpen(!isImportDropdownOpen)}
                  className="flex items-center gap-1.5 papr-btn-primary px-4 py-1.5 transition-colors text-[12px] font-medium"
                >
                  Import <ChevronDown size={14} />
                </button>
                {isImportDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsImportDropdownOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-64 bg-bg-element border border-border-layout rounded-[2px] shadow-xl py-2 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => setIsImportDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-global text-foreground transition-colors font-medium"
                      >
                        Import archive (.zip, .tar.gz)
                      </button>
                      <button 
                        onClick={() => setIsImportDropdownOpen(false)}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-global text-foreground transition-colors font-medium"
                      >
                        Import Folder
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* New Button Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsNewDropdownOpen(!isNewDropdownOpen)}
                  className="flex items-center gap-1.5 papr-btn-primary px-4 py-1.5 transition-opacity text-[12px] font-medium"
                >
                  <Plus size={14} /> New <ChevronDown size={14} />
                </button>
                {isNewDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsNewDropdownOpen(false)}></div>
                    <div className="absolute top-full right-0 mt-2 w-48 bg-bg-element border border-border-layout rounded-[2px] shadow-xl py-2 z-50 text-[12px] animate-in fade-in zoom-in-95 duration-100">
                      <button 
                        onClick={() => {
                          setSelectedTemplate("Blank");
                          setIsNewDropdownOpen(false);
                          setIsModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-global text-foreground transition-colors font-medium"
                      >
                        Blank project
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedTemplate("IEEE");
                          setIsNewDropdownOpen(false);
                          setIsModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-bg-global text-foreground transition-colors font-medium mt-1"
                      >
                        Example project
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Projects Content Area */}
          <div className="flex-1 overflow-y-auto px-6 pt-4">
            
            {activeTab === "shared" ? (
              <div className="h-full flex flex-col items-center justify-center -mt-10">
                <h2 className="text-[12px] font-bold text-foreground mb-1">You don't have any projects yet</h2>
                <p className="text-[11px] text-muted-text mb-6">Start with a hosted project on papr</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="papr-btn-primary px-5 py-2.5 text-[11px] transition-opacity shadow-sm"
                >
                  Start from Scratch
                </button>
              </div>
            ) : isLoading ? (
              <div className="py-10 text-center text-muted-text flex items-center justify-center gap-2 text-[12px]">
                <Loader2 className="animate-spin" size={16} /> Loading projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="py-20 text-center text-muted-text text-[12px]">
                {searchQuery ? "No projects found matching your search." : "No projects found. Create one to get started!"}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-6">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => router.push(`/project/${project.id}`)}
                    className="group border border-border-layout rounded-[2px] p-4 cursor-pointer hover:border-primary/50 transition-colors flex flex-col gap-4 bg-bg-element/50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-12 bg-bg-editor border border-border-layout rounded shadow-sm flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-muted-text" />
                      </div>
                      <button 
                        onClick={(e) => handleDeleteProject(e, project.id)}
                        className="p-1.5 text-muted-text hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px] hover:bg-red-500/10"
                        title="Delete Project"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-[12px] font-semibold text-foreground line-clamp-1">{project.name}</h3>
                      <p className="text-[11px] text-muted-text mt-1">{new Date(project.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] text-muted-text">
                    <th className="font-normal pb-3 flex items-center gap-1 cursor-pointer hover:text-foreground w-full">
                      Name <ChevronDown size={12}/>
                    </th>
                    <th className="font-normal pb-3 text-right cursor-pointer hover:text-foreground whitespace-nowrap px-4">
                      Created <ChevronDown size={12} className="inline ml-1"/>
                    </th>
                    <th className="w-10 pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project) => (
                    <tr 
                      key={project.id} 
                      onClick={() => router.push(`/project/${project.id}`)}
                      className="group border-b border-border-layout/30 hover:bg-bg-element/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-4">
                          <div className="w-7 h-9 bg-bg-global border border-border-layout rounded shadow-sm flex items-center justify-center shrink-0">
                            <FileText size={14} className="text-muted-text" />
                          </div>
                          <span className="text-[12px] font-medium">{project.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-[11px] text-muted-text px-4 whitespace-nowrap">
                        {new Date(project.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <div className="relative flex justify-end">
                          <button 
                            onClick={(e) => handleDeleteProject(e, project.id)}
                            className="p-1.5 text-muted-text hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px] hover:bg-red-500/10"
                            title="Delete Project"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-bg-editor border border-border-layout rounded-[2px] p-6 shadow-2xl animate-in fade-in zoom-in duration-150">
            <h2 className="text-base font-bold text-foreground mb-2">Name your project</h2>
            <p className="text-muted-text text-[12px] mb-6">
              Enter a name for your {selectedTemplate === "Blank" ? "blank" : "example"} project.
            </p>

            <form onSubmit={handleCreateProject} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-text mb-2">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. RAG Survey Paper"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-bg-global border border-border-layout rounded-[2px] focus:outline-none focus:border-primary/50 text-foreground text-[12px]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="papr-btn-primary px-4 py-2 text-[11px] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 papr-btn-primary px-4 py-2 transition-opacity text-[11px] font-semibold cursor-pointer"
                >
                  {isCreating && <Loader2 className="animate-spin" size={14} />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
