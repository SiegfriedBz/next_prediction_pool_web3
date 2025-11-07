"use client";

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import type { FC } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
	targetPrice?: string;
	checked: boolean;
	onChange: (checked: boolean) => void;
};

export const SideCheckBox: FC<Props> = (props) => {
	const { targetPrice, checked, onChange } = props;

	return (
		<div className="flex sm:items-center gap-4 max-sm:flex-col-reverse max-sm:gap-2">
			<Badge
				variant={checked ? "outline" : "secondary"}
				onClick={() => onChange(false)}
				className="cursor-pointer font-bold h-[2.35rem] max-sm:w-full w-32 flex items-center gap-x-2"
			>
				<TrendingDownIcon
					size={32}
					className={checked ? "text-secondary": ""}
				/>
				<span>Below Target</span>
				
			</Badge>

			{targetPrice ? (
				<Input
					className="max-sm:w-full w-60 text-center"
					readOnly
					value={targetPrice}
				/>
			) : (
				<Skeleton className="h-[2.35rem] max-sm:w-full w-60 rounded-lg border-border bg-primary/10" />
			)}

			<Badge
				variant={checked ? "default" : "outline"}
				onClick={() => onChange(true)}
				className="cursor-pointer font-bold h-[2.35rem] max-sm:w-full w-32 flex items-center gap-x-2"
			>
				<TrendingUpIcon
					size={32}
					className={checked ? "" : "text-primary"}
				/>
				<span>Above Target</span>
			</Badge>
		</div>
	);
};
