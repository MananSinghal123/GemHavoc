export const PlayerBetsPanel = ({ players, playerBets, asset }) => {
    return (
      <div className="fixed z-10 bottom-24 right-4 bg-slate-800 bg-opacity-90 p-4 rounded-lg shadow-lg border-2 border-amber-700 max-w-sm w-full">
        <h3 className="text-amber-500 font-bold text-xl mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
          Player Bets
        </h3>
        
        <div className="bg-slate-700 rounded-md overflow-hidden">
          {players.length === 0 ? (
            <div className="p-4 text-center">
              <div className="animate-pulse text-gray-400 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Waiting for players to join...
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-slate-600">
              {players.map((player) => (
                <li key={player.id} className="p-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-amber-700 rounded-full flex items-center justify-center mr-3 text-white font-bold">
                      {(player?.state?.profile?.name || `P${player.id}`).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white">{player?.state?.profile?.name || `Player ${player.id}`}</span>
                  </div>
                  {playerBets[player.id]?.confirmed ? (
                    <div className="flex items-center bg-green-900 bg-opacity-50 py-1 px-3 rounded-full">
                      <span className="text-green-400 font-medium text-sm mr-1">
                        {playerBets[player.id].amount} {asset?.symbol}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  ) : (
                    <div className="flex items-center bg-yellow-900 bg-opacity-30 py-1 px-3 rounded-full">
                      <span className="text-yellow-400 text-sm">Waiting</span>
                      <span className="ml-1 flex space-x-1">
                        <span className="animate-bounce delay-75 text-yellow-400">.</span>
                        <span className="animate-bounce delay-150 text-yellow-400">.</span>
                        <span className="animate-bounce delay-300 text-yellow-400">.</span>
                      </span>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  };