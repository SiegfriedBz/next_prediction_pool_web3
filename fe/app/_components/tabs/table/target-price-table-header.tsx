"use client";

import { CircleQuestionMarkIcon } from "lucide-react";
import type { FC } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export const TargetPriceTableHeader: FC = () => {
	return (
		<Tooltip>
			<TooltipTrigger>
				<div className="text-semibold relative">
					Target (USD)
					<CircleQuestionMarkIcon
						size={8}
						className="absolute -top-2 -right-2"
					/>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>Target Price (USD) for each game</p>
			</TooltipContent>
		</Tooltip>
	);
};
