import React, { useState } from "react";
import { ChevronDown, Settings, HelpCircle, MessageSquare, LogIn } from "lucide-react";
import SettingsModal from "./SettingsModal";

interface ProfileFooterProps {
  showInvite?: boolean;
}

export default function ProfileFooter({ showInvite = true }: ProfileFooterProps) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return (
    <>
      <div className="p-4 flex items-center justify-between border-t border-border-layout relative">
        <div 
          className="flex items-center gap-2 overflow-hidden cursor-pointer group flex-1"
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
        >
          <div className="w-6 h-6 rounded-full bg-border-layout flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-muted-text group-hover:text-foreground transition-colors">B</span>
          </div>
          <span className="text-[11px] font-medium text-muted-text group-hover:text-foreground truncate transition-colors">
            bhuvanrajnaik@gmail...
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {showInvite && (
            <button className="papr-btn-primary px-3 py-1 text-[10px] shrink-0">
              Invite
            </button>
          )}
          <button 
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="p-1 text-muted-text hover:text-foreground cursor-pointer transition-colors"
          >
            <ChevronDown size={14} />
          </button>
        </div>

        {/* Profile Dropdown Menu */}
        {isProfileDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsProfileDropdownOpen(false)}
            />
            <div className="absolute bottom-14 left-4 w-64 bg-bg-element border border-border-layout shadow-2xl rounded-[2px] z-50 flex flex-col py-1 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
              <button 
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  setIsSettingsModalOpen(true);
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-muted-text hover:text-foreground hover:bg-bg-header transition-colors text-left text-[13px] font-medium w-full cursor-pointer"
              >
                <Settings size={16} />
                Settings
              </button>
              <button 
                className="flex items-center gap-3 px-4 py-2.5 text-muted-text hover:text-foreground hover:bg-bg-header transition-colors text-left text-[13px] font-medium w-full cursor-pointer"
              >
                <HelpCircle size={16} />
                support@papr.com
              </button>
              <button 
                className="flex items-center gap-3 px-4 py-2.5 text-muted-text hover:text-foreground hover:bg-bg-header transition-colors text-left text-[13px] font-medium w-full cursor-pointer border-b border-border-layout"
              >
                <MessageSquare size={16} />
                Join the Papr discord
              </button>
              <button 
                className="flex items-center gap-3 px-4 py-2.5 text-muted-text hover:text-foreground hover:bg-bg-header transition-colors text-left text-[13px] font-medium w-full cursor-pointer mt-1"
              >
                <LogIn size={16} />
                Sign in
              </button>
            </div>
          </>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsModalOpen} 
        onClose={() => setIsSettingsModalOpen(false)} 
      />
    </>
  );
}
