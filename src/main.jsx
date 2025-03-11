import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { CollectionProvider } from "./Contexts/CollectionContext";
import App from "./App";
import { WalletProvider } from "./components/WalletProvider";
import { WrongNetworkAlert } from "./WrongNetworkAlert";
import { GameEngineProvider } from "./hooks/useGameEngine";
import { insertCoin } from "playroomkit";

const queryClient = new QueryClient();

const AppContext = React.createContext({});
const AppContextProvider = ({ children }) => {
  const value = {
    user: null, // Example context value
    setUser: () => {}, // Example setter for context value
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

insertCoin({
  skipLobby: true,
  // streamMode: true,
}).then(() => {
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <CollectionProvider>
      <AppContextProvider>
        <WalletProvider>
          <QueryClientProvider client={queryClient}>
            <GameEngineProvider>
            <App />
            </GameEngineProvider>
            <WrongNetworkAlert />
          </QueryClientProvider>
        </WalletProvider>
      </AppContextProvider>
    </CollectionProvider>
  </React.StrictMode>
);
});


// import { insertCoin } from "playroomkit";
// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";
// import { GameEngineProvider } from "./hooks/useGameEngine";

// insertCoin({
//   skipLobby: true,
//   // streamMode: true,
// }).then(() => {
//   ReactDOM.createRoot(document.getElementById("root")).render(
//     <React.StrictMode>
//       <GameEngineProvider>
//          <App />
//       </GameEngineProvider>
//     </React.StrictMode>
//   );
// });
