import { flexRender, type Table as TanstackTable } from "@tanstack/react-table";
import {
	ChevronDownIcon,
	ChevronsUpDownIcon,
	ChevronUpIcon,
} from "lucide-react";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { BaseTableFooter } from "./base-data-table-footer";

type BaseTableProps<TData> = {
	table: TanstackTable<TData>;
};

export function BaseDataTable<TData>({ table }: BaseTableProps<TData>) {
	return (
		<div className="rounded-md border py-4">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									onClick={
										header.column.getCanSort()
											? header.column.getToggleSortingHandler()
											: undefined
									}
									className={
										header.column.getCanSort()
											? "cursor-pointer select-none"
											: ""
									}
								>
									<div className="flex items-center gap-1.5">
										{flexRender(
											header.column.columnDef.header,
											header.getContext(),
										)}
										{header.column.getCanSort() && (
											<>
												{header.column.getIsSorted() === "asc" && (
													<ChevronUpIcon size={12} />
												)}
												{header.column.getIsSorted() === "desc" && (
													<ChevronDownIcon size={12} />
												)}
												{header.column.getIsSorted() === false && (
													<ChevronsUpDownIcon
														size={12}
														className="text-muted-foreground"
													/>
												)}
											</>
										)}
									</div>
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>

				<TableBody>
					{table.getRowModel().rows.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() ? "selected" : undefined}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			<BaseTableFooter table={table} />
		</div>
	);
}
