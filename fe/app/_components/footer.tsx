import { HeartIcon } from "lucide-react";
import Link from "next/link";
import type { FC } from "react";
import { TypographyH6 } from "./typography/h6";

const ADMIN_LINK = process.env.ADMIN_LINK ?? "https://github.com/SiegfriedBz";

export const Footer: FC = () => {
  return (
    <footer className="flex py-8 sm:pb-12 gap-2 sm:gap-4 flex-wrap items-center justify-center">
      <TypographyH6>© {new Date().getFullYear()}</TypographyH6>
      
      <Link href={"/"} scroll>
        <TypographyH6 className="font-semibold"> 
            Bet
            <span className="text-primary font-extrabold">2</span>
            Gether
        </TypographyH6>
      </Link>

      <a href={ADMIN_LINK} className="group">
        <span className="inline-flex items-center gap-1">
          <TypographyH6>Made with</TypographyH6>
          <HeartIcon className="text-red-400 size-4" />
          <TypographyH6>by</TypographyH6>
          <TypographyH6 className="-mb-0.5 font-semibold border-transparent border-b group-hover:border-primary transition duration-300">Siegfried</TypographyH6>
        </span>
      </a>
    </footer>
  );
};
