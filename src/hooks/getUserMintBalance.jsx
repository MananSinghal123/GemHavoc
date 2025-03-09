import { AccountAddress } from "@aptos-labs/ts-sdk";
import { aptosClient } from "../utils/aptosClient";
import { MODULE_ADDRESS_TOKEN } from "../constants";

export const getUserMintBalance = async ({ fa_address, user_address }) => {
  const userMintedAmount = await aptosClient().view({
    payload: {
      function: `${AccountAddress.from(MODULE_ADDRESS_TOKEN)}::launchpad::get_mint_balance`,
      functionArguments: [fa_address, user_address],
    },
  });

  return Number(userMintedAmount[0]);
};

// JSX component example that uses this function
const UserMintBalanceDisplay = ({ fa_address, user_address }) => {
  const [balance, setBalance] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const fetchBalance = async () => {
      try {
        const amount = await getUserMintBalance({ fa_address, user_address });
        setBalance(amount);
      } catch (error) {
        console.error("Error fetching mint balance:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBalance();
  }, [fa_address, user_address]);
  
  if (loading) {
    return <div>Loading balance...</div>;
  }
  
  return (
    <div className="mint-balance-container">
      <h3>Your Mint Balance</h3>
      <p className="balance-amount">{balance}</p>
    </div>
  );
};

export default UserMintBalanceDisplay;