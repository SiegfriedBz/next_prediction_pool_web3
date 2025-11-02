import { DicesIcon } from "lucide-react";
import type { FC } from "react";

export const Logo: FC = () => {
	return (
		<div className="rounded-full ring-1 sm:ring-2 ring-blue-500 p-1.5 flex justify-center items-center">
			<DicesIcon className="text-blue-500 size-3.5 sm:size-4 md:size-5" />
		</div>
	);
};
