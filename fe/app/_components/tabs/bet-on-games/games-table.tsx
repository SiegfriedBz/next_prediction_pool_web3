"use client";

import { useRoundDataContext } from "@/app/_hooks/use-round-data-context";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "./data-table";
import { useColumns } from "./use-columns";

export const GamesTable = () => {
	const { allRoundsData } = useRoundDataContext();

	const columns = useColumns();

	return (
		<div className="container mx-auto space-y-4">
			<div className="flex gap-2 items-center">
				<Badge>{allRoundsData?.length}</Badge> Games
			</div>

			<DataTable columns={columns} data={allRoundsData} />
		</div>
	);
};
