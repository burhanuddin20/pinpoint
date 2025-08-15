import React, { createContext, useContext, useState } from 'react';

interface BottomSheetContextType {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isHalfway: boolean;
  setIsHalfway: (halfway: boolean) => void;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export function BottomSheetProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHalfway, setIsHalfway] = useState(false);

  return (
    <BottomSheetContext.Provider value={{ isExpanded, setIsExpanded, isHalfway, setIsHalfway }}>
      {children}
    </BottomSheetContext.Provider>
  );
}

export function useBottomSheet() {
  const context = useContext(BottomSheetContext);
  if (context === undefined) {
    throw new Error('useBottomSheet must be used within a BottomSheetProvider');
  }
  return context;
} 