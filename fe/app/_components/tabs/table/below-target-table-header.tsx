"use client";

import { ThumbsDownIcon } from "lucide-react";
import type { FC } from "react";

import { TargetSideTableHeader } from "./target-side-table-header";

export const BelowTargetTableHeader: FC = () => {
	return (
		<TargetSideTableHeader
			label="Total Bets - Below Target"
			tooltipContentLabel="Total (ETH) Bets Below Target for each game"
		>
			<ThumbsDownIcon color="var(--destructive)" size={12} />
		</TargetSideTableHeader>
	);
};
