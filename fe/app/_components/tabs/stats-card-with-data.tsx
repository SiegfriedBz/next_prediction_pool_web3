import { DicesIcon } from "lucide-react";
import type { ComponentProps, FC } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { TypographyH3 } from "../typography/h3";
import { TypographyH5 } from "../typography/h5";

type Props = ComponentProps<typeof Card> & {
	count: number | null;
	label: string;
	className?: string;
};

export const StatsCardWithData: FC<Props> = (props) => {
	const { count, label, className, ...rest } = props;

	return (
		<Card
			{...rest}
			className={cn("max-[480px]:py-4 max-sm:py-2 py-4", className)}
		>
			<CardContent className="flex items-center justify-between gap-2 sm:gap-4">
				<div>
					<CardTitle>
						{count != null ? (
							<TypographyH3 className="text-blue-500">{count}</TypographyH3>
						) : (
							<Skeleton className="h-6 w-8 bg-blue-500 mb-1" />
						)}
					</CardTitle>
					<TypographyH5>{label}</TypographyH5>
				</div>
				<DicesIcon size={32} />
			</CardContent>
		</Card>
	);
};
