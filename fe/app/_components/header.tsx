import { ConnectButton } from "./connect-button";
import { ToggleThemeButton } from "./toggle-theme-button";
import { TypographyH2 } from "./typography/h2";

export const Header = () => {
	return (
		<header className="flex justify-between items-center h-28 sm:h-32 md:h-32 px-4 sm:px-16">
			<TypographyH2>Bet2Gether</TypographyH2>
			<div className="flex ms-auto items-center gap-x-8">
				<ConnectButton />
				<ToggleThemeButton />
			</div>
		</header>
	);
};
