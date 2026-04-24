/**
 * PathContext
 * Manages the student's selected study path globally
 */

import React, { createContext, useContext, useState } from "react";
import { StudentPathType } from "@/types/unified";

interface PathContextType {
  selectedPath: StudentPathType | null;
  setSelectedPath: (path: StudentPathType) => void;
  clearPath: () => void;
}

const PathContext = createContext<PathContextType | undefined>(undefined);

export function PathProvider({ children }: { children: React.ReactNode }) {
  const [selectedPath, setSelectedPath] = useState<StudentPathType | null>(null);

  const clearPath = () => setSelectedPath(null);

  return (
    <PathContext.Provider value={{ selectedPath, setSelectedPath, clearPath }}>
      {children}
    </PathContext.Provider>
  );
}

export function usePath() {
  const context = useContext(PathContext);
  if (!context) {
    throw new Error("usePath must be used within PathProvider");
  }
  return context;
}
