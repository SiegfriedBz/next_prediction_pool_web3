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
					<div className="text-semibold flex items-center gap-x-2">
					Target (USD)
					<CircleQuestionMarkIcon
						size={14}
					/>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>Target Price (USD) for each game</p>
			</TooltipContent>
		</Tooltip>
	);
};
