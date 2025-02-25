import React, { createContext, useState, useContext } from "react";

const CollectionContext = createContext(undefined);

export const CollectionProvider = ({ children }) => {
  const [collectionAddress, setCollectionAddress] = useState("");

  return (
    <CollectionContext.Provider
      value={{ collectionAddress, setCollectionAddress }}
    >
      {children}
    </CollectionContext.Provider>
  );
};

export const useCollection = () => {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
};
