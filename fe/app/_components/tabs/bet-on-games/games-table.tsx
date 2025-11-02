"use client";

import type { FC } from "react";
import { useActiveRoundsWithPlayerBetsContext } from "@/app/_hooks/use-active-rounds-with-player-bets-context";
import { DataTable } from "./data-table";
import { useColumns } from "./use-columns";

export const GamesTable: FC = () => {
	const { rounds } = useActiveRoundsWithPlayerBetsContext();

	// get tanstack-table columns
	const columns = useColumns();

	return (
		<div className="container mx-auto">
			<DataTable columns={columns} data={rounds} />
		</div>
	);
};
