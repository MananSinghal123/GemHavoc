import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useRef, useState } from "react";

// Update these import paths based on your project structure
import { ChatMessageBubble } from "./ChatMessageBubble";
import { IntermediateStep } from "./IntermediateStep";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useGetAllListedNfts } from "../hooks/useGetAllListedNfts";
import { useGameEngine } from "../hooks/useGameEngine";

export function ChatWindow(props) {
	const messageContainerRef = useRef(null);
	const { endpoint, emptyStateComponent, placeholder, titleText = "Ship's Oracle", showIntermediateStepsToggle, emoji = "🏴‍☠️" } = props;
	const [showChatWindow, setShowChatWindow] = useState(false);
	const [showIntermediateSteps, setShowIntermediateSteps] = useState(false);
	const [intermediateStepsLoading, setIntermediateStepsLoading] = useState(false);
	const [chatEndpointIsLoading, setChatEndpointIsLoading] = useState(false);
	const [input, setInput] = useState("");
	const [messages, setMessages] = useState([]);
	const [sourcesForMessages, setSourcesForMessages] = useState({});
    const nftsListed=useGetAllListedNfts();
	const {account}=useWallet()
	const intemediateStepsToggle = showIntermediateStepsToggle && (
		<div className="flex items-center gap-2 text-[#e6c78b] px-2 py-1 rounded-md bg-[#240d08]/50 border border-[#5e2814]/50">
			<input
				type="checkbox"
				id="show_intermediate_steps"
				name="show_intermediate_steps"
				className="accent-[#cd7f32]"
				checked={showIntermediateSteps}
				onChange={(e) => setShowIntermediateSteps(e.target.checked)}
			></input>
			<label htmlFor="show_intermediate_steps" className="text-sm"> Show sailing logs</label>
		</div>
	);

    const [metadataList, setMetadataList] = useState([]);
	const { 
        round, 
        phase, 
        players, 
        playerTurn,
        punchesReceived, 
        gems 
    } = useGameEngine();

  useEffect(() => {
    console.log(metadataList)
    if (!nftsListed || nftsListed.length === 0) return;
  
    const fetchAllMetadata = async () => {
    const results = [];
    
    for (const nft of nftsListed) {
      try {
        // If no URI, skip this NFT
        if (!nft?.data?.uri) continue;
        
        // If URI is already an object with image
        if (typeof nft.data.uri === "object" && nft.data.uri.image) {
          results.push(nft.data.uri);
          continue;
        }
        const price=nft.price;
        
        // Fetch metadata from URI
        const response = await fetch(nft.data.uri);
        const data = await response.json();
        console.log(data)
        results.push({price,...data});
      } catch (err) {
        console.error("Error fetching NFT metadata:", err);
      }
    }
    
    setMetadataList(results);
  };
     fetchAllMetadata();
  }, [nftsListed]);

	const handleInputChange = (e) => {
		setInput(e.target.value);
	};

	// Function to handle text streaming
	const processStream = async (reader, assistantMessageId) => {
		const decoder = new TextDecoder();
		let done = false;
		let accumulatedContent = "";

		while (!done) {
			const { value, done: doneReading } = await reader.read();
			done = doneReading;
			if (value) {
				const textChunk = decoder.decode(value, { stream: !done });
				accumulatedContent += textChunk;

				// Update the assistant message with new content
				setMessages(currentMessages => 
					currentMessages.map(message => 
						message.id === assistantMessageId 
							? { ...message, content: accumulatedContent } 
							: message
					)
				);
			}
		}
	};


	   // Get the current player's game data
	   const getCurrentPlayerGameData = () => {
        // If players array is empty or undefined, return empty data
        if (!players || players.length === 0) {
            return {
                currentRound: round || 0,
                playerPunches: punchesReceived || 0,
                playerGems: 0,
                totalGems: gems || 0,
                gamePhase: phase || "unknown"
            };
        }

        // Get current player (you might need to identify the current player differently)
        const currentPlayer = players[playerTurn];
        
        return {
            currentRound: round || 0,
            playerPunches: currentPlayer ? (currentPlayer.getState("punchesReceived") || 0) : 0,
            playerGems: currentPlayer ? (currentPlayer.getState("gems") || 0) : 0,
            totalGems: gems || 0,
            gamePhase: phase || "unknown"
        };
    };


	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;

		// Prevent multiple submissions while loading
		if (chatEndpointIsLoading || intermediateStepsLoading) {
			return;
		}

		// Add user message
		const userMessage = { id: messages.length.toString(), role: "user", content: input };
		const updatedMessages = [...messages, userMessage];
		setMessages(updatedMessages);
		setInput("");

		if (messageContainerRef.current) {
			messageContainerRef.current.classList.add("grow");
		}

		// Wait a bit if this is the first message (for animation purposes)
		if (!messages.length) {
			await new Promise((resolve) => setTimeout(resolve, 300));
		}

		const gameData = getCurrentPlayerGameData();
        const accountAddress=account.address.toStringLong();

		if (!showIntermediateSteps) {
			// Standard streaming mode
			setChatEndpointIsLoading(true);
			
			try {
				// Add an empty assistant message that will be filled gradually
				const assistantMessageId = updatedMessages.length.toString();
				setMessages([...updatedMessages, { id: assistantMessageId, role: "assistant", content: "" }]);
				
				const response = await fetch(endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						messages: updatedMessages,
                        metadataList:metadataList,
						gameData: gameData,
						accountAddress:accountAddress
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "An error occurred");
				}

				// Process the stream
				const reader = response.body.getReader();
				await processStream(reader, assistantMessageId);
			} catch (error) {
				console.error("Error in chat request:", error);
				toast(error.message || "Arrr! The message couldn't reach the oracle", {
					theme: "dark",
				});
			} finally {
				setChatEndpointIsLoading(false);
			}
		} else {
			// Intermediate steps mode
			setIntermediateStepsLoading(true);
			
			try {
				const response = await fetch(endpoint, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						messages: updatedMessages,
						show_intermediate_steps: true,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "An error occurred");
				}

				const json = await response.json();
				
				if (json.messages) {
					const responseMessages = json.messages;
					const toolCallMessages = responseMessages.filter((responseMessage) => {
						return (
							(responseMessage.role === "assistant" && !!responseMessage.tool_calls?.length) ||
							responseMessage.role === "tool"
						);
					});
					
					// Process and display intermediate steps
					const intermediateStepMessages = [];
					for (let i = 0; i < toolCallMessages.length; i += 2) {
						const aiMessage = toolCallMessages[i];
						const toolMessage = toolCallMessages[i + 1];
						intermediateStepMessages.push({
							id: (updatedMessages.length + i / 2).toString(),
							role: "system",
							content: JSON.stringify({
								action: aiMessage.tool_calls?.[0],
								observation: toolMessage.content,
							}),
						});
					}
					
					// Display intermediate steps with slight delays for visual effect
					const newMessages = [...updatedMessages];
					for (const message of intermediateStepMessages) {
						newMessages.push(message);
						setMessages([...newMessages]);
						await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
					}
					
					// Add final assistant response
					setMessages([
						...newMessages,
						{
							id: newMessages.length.toString(),
							content: responseMessages[responseMessages.length - 1].content,
							role: "assistant",
						},
					]);
				}
			} catch (error) {
				console.error("Error in intermediate steps request:", error);
				toast(error.message || "Blimey! The oracle's vision be clouded", {
					theme: "dark",
				});
			} finally {
				setIntermediateStepsLoading(false);
			}
		}
	};

	// Chat toggle button
	const toggleChatWindow = () => {
		setShowChatWindow(!showChatWindow);
	};

	return (
		<div className="fixed bottom-4 right-4 z-50 text-xs">
			{/* Chat toggle button */}
			{!showChatWindow && (
				<button 
					onClick={toggleChatWindow}
					className="bg-gradient-to-r from-[#3d1d15] to-[#2d1610] border-2 border-[#cd7f32] rounded-full p-3 shadow-lg hover:scale-105 transition-transform"
				>
					<div className="relative">
						<span className="text-3xl">🦜</span>
						{messages.length > 0 && (
							<span className="absolute -top-1 -right-1 bg-[#cd7f32] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
								{messages.length}
							</span>
						)}
					</div>
				</button>
			)}

			{/* Chat window */}
			{showChatWindow && (
				<div className="flex flex-col h-[500px] w-80 bg-gradient-to-b from-[#1a0f0b] to-[#240d08] text-white rounded-lg overflow-hidden border-2 border-[#8b4513] shadow-2xl">
					{/* Chat header */}
					<div className="bg-gradient-to-r from-[#3d1d15] to-[#2d1610] border-b border-[#8b4513] p-3 flex items-center justify-between">
						<h2 className="text-xl font-bold text-[#ffd700] flex items-center gap-2">
							<span>{emoji}</span> {titleText}
						</h2>
						<button 
							onClick={toggleChatWindow}
							className="text-[#e6c78b] hover:text-[#ffd700] transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					{/* Chat messages */}
					<div className="flex flex-col-reverse grow mb-1 overflow-auto custom-scrollbar px-3 transition-[flex-grow] ease-in-out" ref={messageContainerRef}>
						{messages.length === 0 
							? emptyStateComponent || (
								<div className="flex flex-col items-center justify-center h-full p-4">
									<div className="text-4xl mb-2">🦜</div>
									<p className="text-[#ffd700] text-center font-bold mb-1">Ahoy, Cap'n!</p>
									<p className="text-[#e6c78b] text-center text-sm">Ask the ship's oracle for guidance on your voyage!</p>
								</div>
							)
							: [...messages].reverse().map((m, i) => {
								const sourceKey = (messages.length - 1 - i).toString();
								return m.role === "system" ? (
									<IntermediateStep key={m.id} message={m}></IntermediateStep>
								) : (
									<ChatMessageBubble
										key={m.id}
										message={m}
										aiEmoji={emoji}
										sources={sourcesForMessages[sourceKey]}
									></ChatMessageBubble>
								);
							})
						}
					</div>

					{/* Chat controls - FIXED SECTION */}
					<div className="px-3 pb-3 w-full">
  <div className="mb-2">{intemediateStepsToggle}</div>
  <form onSubmit={handleSubmit} className="flex items-center w-full">
    <div className="flex w-full">
      <input
        className="grow p-2 rounded-l-md bg-[#240d08] border border-[#5e2814] text-[#e6c78b] placeholder-[#8b4513] focus:border-[#cd7f32] focus:outline-none focus:ring-1 focus:ring-[#cd7f32] min-w-0"
        value={input}
        placeholder={placeholder ?? "What do ye seek, sailor?"}
        onChange={handleInputChange}
      />
      <button 
        type="submit" 
        className="min-w-10 h-10 flex-shrink-0 flex justify-center items-center bg-[#8b4513] hover:bg-[#cd7f32] rounded-r-md px-2 text-white transition-colors border-y border-r border-[#5e2814]"
        disabled={chatEndpointIsLoading || intermediateStepsLoading}
      >
        <div role="status" className={`${chatEndpointIsLoading || intermediateStepsLoading ? "" : "hidden"}`}>
          <svg
            aria-hidden="true"
            className="w-5 h-5 text-white animate-spin fill-[#8b4513]"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-5 w-5 ${chatEndpointIsLoading || intermediateStepsLoading ? "hidden" : ""}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  </form>
</div>
				</div>
			)}
			<ToastContainer />
		</div>
	);
}