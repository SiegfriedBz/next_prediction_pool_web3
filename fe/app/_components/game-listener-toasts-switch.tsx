"use client";

import { RadioIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { usePPoolTokenEventsToasts } from "../_hooks/events/toasts/use-ppool-token-events-toasts";
import { usePPoolEventsToasts } from "../_hooks/events/toasts/use-ppool-events-toasts";

export const GameListenerToastsSwitch = () => {
	const [isListening, setIsListening] = useState<boolean>(false);

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

			{isListening && <EventListenersToasts />}
		</>
	);
};

const EventListenersToasts = () => {
	// PPool Contract event listener - toasts
	usePPoolEventsToasts({ key: "RoundCreated" })
	usePPoolEventsToasts({ key: "NewBet" })

	// PPoolToken Contract event listener - toasts
	usePPoolTokenEventsToasts({ key: "NewNFTMinted" })

	return null;
};
