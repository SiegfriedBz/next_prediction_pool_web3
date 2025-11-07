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
				<div className="flex items-center gap-x-2 text-semibold">
					{icon}
					<span>{label}</span>
					<CircleQuestionMarkIcon
						size={14}
					/>
				</div>
			</TooltipTrigger>
			<TooltipContent>
				<p>{tooltipContentLabel}</p>
			</TooltipContent>
		</Tooltip>
	);
};
