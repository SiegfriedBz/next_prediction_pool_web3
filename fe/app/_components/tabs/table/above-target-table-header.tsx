"use client";

import { ThumbsUpIcon } from "lucide-react";
import type { FC } from "react";
import { TargetSideTableHeader } from "./target-side-table-header";

export const AboveTargetTableHeader: FC = () => {
	return (
		<TargetSideTableHeader
			label="Total Bets - Above Target"
			tooltipContentLabel="Total (ETH) Bets Above Target for each game"
		>
			<ThumbsUpIcon color="var(--chart-2)" size={12} />
		</TargetSideTableHeader>
	);
};
