import { CircleSlash2Icon } from "lucide-react";
import type { FC } from "react";

type Props = {
	rawCreator: string | undefined;
	address: `0x${string}` | undefined;
};

export const CreatorTableCell: FC<Props> = (props) => {
	const { rawCreator, address } = props;

	if (!rawCreator) {
		return <CircleSlash2Icon size={12} />;
	}

	const currentUserIsCreator = rawCreator === address;
	const shortRawCreator = `${rawCreator.slice(0, 5)}...${rawCreator.slice(37, 42)}`;

	const creator = currentUserIsCreator ? "You" : shortRawCreator;

	return <div className="font-medium">{creator}</div>;
};
