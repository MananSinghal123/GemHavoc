import { AccountAddress } from "@aptos-labs/ts-sdk";
import { aptosClient } from "../utils/aptosClient";
import { MODULE_ADDRESS_TOKEN } from "../constants";
import { useEffect, useState } from "react";

export const getWinCount = async ({ player_addr }) => {
  const winCount = await aptosClient().view({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS_TOKEN)}::launchpad::get_win_count`,
      functionArguments: [MODULE_ADDRESS_TOKEN,player_addr],
    },
  });

  return winCount[0];
};


// JSX component example that uses this function
const UserWinDisplay = ({ player_addr }) => {
  const [win, setWin] = useState(null);
  const [loading, setLoading] = useState(true);
  
 useEffect(() => {
    const fetchWin = async () => {
      try {
        const win = await getWinCount({ player_addr });
        setWin(win);
        console.log("Wins",win)
      } catch (error) {
        console.error("Error fetching Wins:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWin();
  }, [player_addr,win]);
  
  if (loading) {
    return <div>Loading Wins...</div>;
  }
  
  return (
    <div className="mint-balance-container">
      <h3>Your Wins</h3>
      <p className="balance-amount">{win}</p>
    </div>
  );
};

export default UserWinDisplay;