"use client";

import { CircleQuestionMarkIcon } from "lucide-react";
import type { FC, PropsWithChildren } from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
	label: string;
	tooltipContentLabel: string;
};

export const TargetSideTableHeader: FC<PropsWithChildren<Props>> = (props) => {
	const { label, tooltipContentLabel, children: icon } = props;

	return (
		<Tooltip>
			<TooltipTrigger>
				<div className="flex items-center gap-x-2 text-semibold relative">
					{icon}
					<span>{label}</span>
					<CircleQuestionMarkIcon
						size={8}
						className="absolute -top-2 -right-2"
					/>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltipContentLabel}</p>
			</TooltipContent>
		</Tooltip>
	);
};
