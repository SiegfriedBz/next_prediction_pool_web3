"use client";

import { useAllRoundsData } from "@/app/_hooks/use-all-rounds-data";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./data-table";
import { useColumns } from "./use-columns";

export const GamesTable = () => {
	// fetch total number of "rounds" (i.e. Games) + all rounds data
	const { totalRounds, allRoundsData } = useAllRoundsData();

	const columns = useColumns();

	return (
		<div className="container mx-auto space-y-4">
			<div className="flex gap-2 items-center">
				<Badge>{totalRounds}</Badge> Games
			</div>

			<DataTable columns={columns} data={allRoundsData} />
		</div>
	);
};
