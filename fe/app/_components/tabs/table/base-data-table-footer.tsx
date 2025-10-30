import type { Table as TanstackTable } from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props<TData> = {
	table: TanstackTable<TData>;
};

export function BaseTableFooter<TData>({ table }: Props<TData>) {
	return (
		<div className="mt-2 flex flex-col justify-center items-center gap-2 w-full">
			<div className="flex justify-center items-center gap-2 w-full">
				<Button
					variant="ghost"
					onClick={() => table.firstPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronsLeftIcon />
				</Button>

				<Button
					variant="ghost"
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
				>
					<ChevronLeftIcon />
				</Button>

				<Button
					variant="ghost"
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronRightIcon />
				</Button>

				<Button
					variant="ghost"
					onClick={() => table.lastPage()}
					disabled={!table.getCanNextPage()}
				>
					<ChevronsRightIcon />
				</Button>
			</div>

			<div className="flex justify-center items-center gap-2 w-full">
				<span className="flex items-center gap-1 text-sm text-muted-foreground">
					<span>Page</span>
					<span>
						{table.getState().pagination.pageIndex + 1} of{" "}
						{table.getPageCount().toLocaleString()}
					</span>
				</span>

				<select
					value={table.getState().pagination.pageSize}
					onChange={(e) => {
						table.setPageSize(Number(e.target.value));
					}}
					className="text-sm"
				>
					{[10, 20, 30, 40, 50].map((pageSize) => (
						<option key={pageSize} value={pageSize}>
							Show {pageSize} rows
						</option>
					))}
				</select>
			</div>
		</div>
	);
}
