import type { Table as TanstackTable } from "@tanstack/react-table";
import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	ButtonGroup,
	ButtonGroupSeparator,
} from "@/components/ui/button-group";

type Props<TData> = {
	table: TanstackTable<TData>;
};

export function BaseTableFooter<TData>({ table }: Props<TData>) {
	const canPreviousPage = table.getCanPreviousPage();
	const canNextPage = table.getCanNextPage();
	return (
		<div className="mt-2 flex flex-col justify-center items-center gap-2 w-full">
			<ButtonGroup>
				<Button
					variant={"outline"}
					onClick={() => table.firstPage()}
					disabled={!canPreviousPage}
					className={canPreviousPage ? "cursor-pointer" : ""}
				>
					<ChevronsLeftIcon />
				</Button>
				<ButtonGroupSeparator />
				<Button
					variant={"outline"}
					onClick={() => table.previousPage()}
					disabled={!canPreviousPage}
					className={canPreviousPage ? "cursor-pointer" : ""}
				>
					<ChevronLeftIcon />
				</Button>
				<ButtonGroupSeparator />
				<Button
					variant={"outline"}
					onClick={() => table.nextPage()}
					disabled={!canNextPage}
					className={canNextPage ? "cursor-pointer" : ""}
				>
					<ChevronRightIcon />
				</Button>
				<ButtonGroupSeparator />
				<Button
					variant={"outline"}
					onClick={() => table.lastPage()}
					disabled={!canNextPage}
					className={canNextPage ? "cursor-pointer" : ""}
				>
					<ChevronsRightIcon />
				</Button>
			</ButtonGroup>

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
