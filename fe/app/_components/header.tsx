import { ConnectButton } from "./connect-button";
import { ToggleThemeButton } from "./toggle-theme-button";
import { TypographyH2 } from "./typography/h2";

export const Header = () => {
	return (
		<header
			className={`sticky z-50 top-0
				flex justify-between items-center
				h-28 sm:h-32 md:h-32 
				px-4 sm:px-16
			`}
		>
			<TypographyH2>
				Bet
				<span className="text-blue-500">2</span>
				Gether
			</TypographyH2>

			<div className="flex ms-auto items-center gap-x-8">
				<span className="max-[480px]:hidden">
					<ConnectButton />
				</span>
				<ToggleThemeButton />
			</div>

			<span className="min-[480px]:hidden absolute -bottom-4">
				<ConnectButton />
			</span>
		</header>
	);
};
