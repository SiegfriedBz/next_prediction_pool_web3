"use client";

import { RadioIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEvents } from "../_hooks/use-events";

export const GameListenerSwitch = () => {
	const [isListening, setIsListening] = useState(false);

	const onChange = () => {
		setIsListening((prev) => {
			const newVal = !prev;
			if (newVal) {
				toast(
					<div className="flex items-center gap-2">
						<RadioIcon className="w-5 h-5 text-primary" />
						<span>Game Event listeners started</span>
					</div>,
				);
			} else {
				toast(
					<div className="flex items-center gap-2">
						<RadioIcon className="w-5 h-5 text-destructive" />
						<span>Game Event listeners stopped</span>
					</div>,
				);
			}
			return newVal;
		});
	};

	return (
		<>
			<div className="flex items-center space-x-2 max-sm:text-sm">
				<Switch
					id={"isListening-mode"}
					checked={isListening}
					onCheckedChange={onChange}
					className="data-[state=checked]:bg-primary"
				/>
				<Label htmlFor="isListening-mode">Listen for Game events</Label>
			</div>

			{isListening && <EventListeners />}
		</>
	);
};

const EventListeners = () => {
	useEvents({ key: "RoundCreated" });
	useEvents({ key: "NewBet" });
	useEvents({ key: "NewNFTMinted" });

	return null;
};
