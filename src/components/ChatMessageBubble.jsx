import { useMemo } from "react"
import markdownToHtml from "../utils/markdownToHtml"

export function ChatMessageBubble(props) {
	// Pirate theme colors and styles
	const userBubbleStyle = "bg-[#3d1d15] border border-[#8b4513] text-[#e6c78b]"
	const aiBubbleStyle = "bg-[#240d08] border border-[#5e2814] text-[#ffd700]"
	
	const colorClassName = props.message.role === "user" ? userBubbleStyle : aiBubbleStyle
	const alignmentClassName = props.message.role === "user" ? "ml-auto" : "mr-auto"
	const prefix = props.message.role === "user" ? "👤" : props.aiEmoji || "🏴‍☠️"

	const content = useMemo(() => {
		return markdownToHtml(props.message.content)
	}, [props.message.content])

	return (
		<div className={`${alignmentClassName} ${colorClassName} rounded-lg px-3 py-2 max-w-[90%] mb-3 flex shadow-md`}>
			<div className="mr-2 mt-1">{prefix}</div>
			<div className="whitespace-pre-wrap flex flex-col">
				<div 
					className="prose prose-sm max-w-none prose-headings:text-[#ffd700] prose-p:text-current prose-strong:text-[#ffd700] prose-code:bg-black/30 prose-code:text-[#e6c78b] prose-code:px-1 prose-code:py-0.5 prose-code:rounded" 
					dangerouslySetInnerHTML={{ __html: content }}
				></div>
				
				{props.sources && props.sources.length ? (
					<>
						<code className="mt-3 mr-auto bg-black/40 border border-[#8b4513]/50 px-2 py-1 rounded text-[#ffd700]">
							<h2 className="text-sm font-bold flex items-center gap-1 m-0">
								<span>📜</span> Ship's Log References:
							</h2>
						</code>
						<code className="mt-1 mr-2 bg-black/40 border border-[#8b4513]/50 px-2 py-1 rounded text-xs text-[#e6c78b]">
							{props.sources?.map((source, i) => (
								<div className="mt-2" key={"source:" + i}>
									{i + 1}. &quot;{source.pageContent}&quot;
									{source.metadata?.loc?.lines !== undefined ? (
										<div className="text-[#cd7f32] mt-1 italic">
											Chart markings {source.metadata?.loc?.lines?.from} to {source.metadata?.loc?.lines?.to}
										</div>
									) : (
										""
									)}
								</div>
							))}
						</code>
					</>
				) : (
					""
				)}
			</div>
		</div>
	)
}