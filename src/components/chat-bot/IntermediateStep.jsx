import { useState } from "react"

export function IntermediateStep(props) {
	const parsedInput = JSON.parse(props.message.content)
	const action = parsedInput.action
	const observation = parsedInput.observation
	const [expanded, setExpanded] = useState(false)
	return (
		<div
			className={`ml-auto bg-amber-800 rounded-lg border-2 border-yellow-600 px-4 py-2 max-w-[80%] mb-8 whitespace-pre-wrap flex flex-col cursor-pointer shadow-md`}
		>
			<div className={`text-right ${expanded ? "w-full" : ""}`} onClick={(e) => setExpanded(!expanded)}>
				<code className="mr-2 bg-slate-800 text-yellow-400 px-2 py-1 rounded-md border border-yellow-600 hover:text-yellow-200">
					⚓ <b>{action.name}</b>
				</code>
				<span className={expanded ? "hidden" : ""}>🏴‍☠️</span>
				<span className={expanded ? "" : "hidden"}>🦜</span>
			</div>
			<div
				className={`overflow-hidden max-h-[0px] transition-[max-height] ease-in-out ${expanded ? "max-h-[360px]" : ""}`}
			>
				<div
					className={`bg-slate-800 border border-yellow-600 rounded-md p-4 mt-1 max-w-0 ${expanded ? "max-w-full" : "transition-[max-width] delay-100"}`}
				>
					<code
						className={`opacity-0 max-h-[100px] overflow-auto transition ease-in-out delay-150 text-yellow-200 ${expanded ? "opacity-100" : ""}`}
					>
						Captain's Orders:
						<br></br>
						<br></br>
						{JSON.stringify(action.args)}
					</code>
				</div>
				<div
					className={`bg-slate-800 border border-yellow-600 rounded-md p-4 mt-1 max-w-0 ${expanded ? "max-w-full" : "transition-[max-width] delay-100"}`}
				>
					<code
						className={`opacity-0 max-h-[260px] overflow-auto transition ease-in-out delay-150 text-yellow-200 ${expanded ? "opacity-100" : ""}`}
					>
						{observation}
					</code>
				</div>
			</div>
		</div>
	)
}