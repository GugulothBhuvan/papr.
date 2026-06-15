import React, { useState } from "react";
import { X, Code, FileText, Folder, Database, Puzzle } from "lucide-react";
import { useProjectStore } from "../store/projectStore";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, toggleTheme } = useProjectStore();
  const [activeTab, setActiveTab] = useState("editor");

  if (!isOpen) return null;

  const tabs = [
    { id: "editor", label: "Editor", icon: Code },
    { id: "pdf", label: "PDF Viewer", icon: FileText },
    { id: "files", label: "File Management", icon: Folder },
    { id: "data", label: "Data Controls", icon: Database },
    { id: "integrations", label: "Integrations", icon: Puzzle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex w-[850px] max-w-[95vw] h-[600px] max-h-[90vh] bg-bg-editor rounded-[2px] shadow-2xl overflow-hidden border border-border-layout flex-col md:flex-row">
        
        {/* Sidebar */}
        <div className="w-64 bg-bg-sidebar flex flex-col p-4 border-r border-border-layout shrink-0">
          <div className="flex flex-col gap-1 mt-6">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-[2px] text-[13px] font-semibold transition-colors w-full text-left cursor-pointer ${
                    isActive
                      ? "bg-bg-element text-foreground"
                      : "text-muted-text hover:text-foreground hover:bg-bg-element/50"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col relative bg-bg-editor overflow-y-auto">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-1.5 text-muted-text hover:text-foreground hover:bg-bg-element rounded-[2px] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-10 py-10 flex flex-col gap-10 max-w-2xl">
            <h2 className="text-2xl font-bold text-foreground">
              {tabs.find(t => t.id === activeTab)?.label}
            </h2>

            {activeTab === "editor" ? (
              <div className="flex flex-col gap-8">
                {/* Interface Theme */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-foreground">Interface Theme</span>
                    <span className="text-[13px] text-muted-text">Select your interface color scheme.</span>
                  </div>
                  <select 
                    value={theme}
                    onChange={() => toggleTheme()}
                    className="bg-bg-element border border-border-layout-strong text-foreground text-[13px] font-semibold px-3 py-1.5 rounded-[2px] cursor-pointer focus:outline-none focus:border-primary"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>

                {/* Language */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 pr-8">
                    <span className="text-[14px] font-bold text-foreground">Language</span>
                    <span className="text-[13px] text-muted-text leading-relaxed">Choose the interface language. System default follows your browser settings.</span>
                  </div>
                  <select 
                    className="bg-bg-element border border-border-layout-strong text-foreground text-[13px] font-semibold px-3 py-1.5 rounded-[2px] cursor-pointer focus:outline-none"
                    disabled
                  >
                    <option>System default</option>
                  </select>
                </div>

                {/* Font size */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-foreground">Font size</span>
                    <span className="text-[13px] text-muted-text">Adjust the editor font size.</span>
                  </div>
                  <select 
                    className="bg-bg-element border border-border-layout-strong text-foreground text-[13px] font-semibold px-3 py-1.5 rounded-[2px] cursor-pointer focus:outline-none"
                    disabled
                  >
                    <option>Normal</option>
                  </select>
                </div>

                {/* Auto Formatting */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1 pr-8">
                    <span className="text-[14px] font-bold text-foreground">Auto Formatting</span>
                    <span className="text-[13px] text-muted-text">Automatically add the correct number of spaces before each code command</span>
                  </div>
                  <div className="w-10 h-6 bg-foreground rounded-[2px] flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-bg-editor rounded-[2px] ml-auto"></div>
                  </div>
                </div>

                {/* Realtime compilation */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-foreground">Realtime compilation</span>
                    <span className="text-[13px] text-muted-text">Automatically compile the document as you type</span>
                  </div>
                  <div className="w-10 h-6 bg-foreground rounded-[2px] flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-bg-editor rounded-[2px] ml-auto"></div>
                  </div>
                </div>

                {/* Vim Mode */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-foreground">Vim Mode</span>
                    <span className="text-[13px] text-muted-text">Enable vim mode in the editor</span>
                  </div>
                  <div className="w-10 h-6 bg-foreground rounded-[2px] flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-bg-editor rounded-[2px] ml-auto"></div>
                  </div>
                </div>

                {/* Equation hover */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <span className="text-[14px] font-bold text-foreground">Equation hover</span>
                    <span className="text-[13px] text-muted-text">Show live equation previews when hovering LaTeX math.</span>
                  </div>
                  <div className="w-10 h-6 bg-foreground rounded-[2px] flex items-center p-1 cursor-pointer">
                    <div className="w-4 h-4 bg-bg-editor rounded-[2px] ml-auto"></div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-muted-text">
                <Puzzle size={48} className="opacity-20" />
                <p className="text-[14px] font-semibold">Coming Soon</p>
                <p className="text-[13px] max-w-sm">We are actively working on this feature. It will be available in a future update.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
