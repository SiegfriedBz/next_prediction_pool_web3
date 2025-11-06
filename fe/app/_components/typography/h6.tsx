import type { ComponentProps, FC, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<"h6">;

export const TypographyH6: FC<PropsWithChildren<Props>> = (props) => {
  const { className, children, ...rest } = props;

  return (
<<<<<<< HEAD
    <h6
=======
    <h5
>>>>>>> 9841a6a (feat(ui): remove motion + make Hero server component + add footer)
      {...rest}
      className={cn("text-sm font-light tracking-tight", className)}
    >
      {children}
<<<<<<< HEAD
    </h6>
=======
    </h5>
>>>>>>> 9841a6a (feat(ui): remove motion + make Hero server component + add footer)
  );
};
