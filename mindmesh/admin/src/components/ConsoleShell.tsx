"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./ui/CommandPalette";

export const ConsoleShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#F6F7F5] text-[#17201C]">
      <Sidebar onOpenCommandPalette={() => setIsCommandOpen(true)} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
};
