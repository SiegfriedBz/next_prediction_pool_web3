import type { FC } from "react";
import { ConnectButton } from "./connect-button";
import { Logo } from "./logo";
import { ToggleThemeButton } from "./toggle-theme-button";
import { TypographyH2 } from "./typography/h2";
import Link from "next/link";

export const Header: FC = () => {
	return (
		<header
			className={`sticky z-50 top-0
				flex justify-between items-center
				h-28 sm:h-32 md:h-32 
				px-4 sm:px-16
			`}
		>
			<Link href="/" className="flex items-center gap-x-2 sm:gap-x-3">
				<Logo />
				<TypographyH2 className="p-0 m-0">
					Bet
					<span className="text-primary font-extrabold">2</span>
					Gether
				</TypographyH2>
			</Link>

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
