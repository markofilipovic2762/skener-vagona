import { Vagon } from "@/types/types";
import React, { createContext, useContext, useState } from "react";

interface VagonContextType {
  vagoni: Vagon[];
  setVagoni: React.Dispatch<React.SetStateAction<Vagon[]>>;
}

 const VagonContext = createContext<VagonContextType>({
  vagoni: [],
  setVagoni: () => {},
});

export function StateProvider({ children }: { children: any }) {
  const [vagoni, setVagoni] = useState<Vagon[]>([]);

  return (
    <VagonContext.Provider value={{ vagoni, setVagoni }}>
      {children}
    </VagonContext.Provider>
  );
}

export function useVagonState() {
  return useContext(VagonContext);
}
