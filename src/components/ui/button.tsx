import { cva, type VariantProps } from "class-variance-authority";
import { useRender } from "@base-ui/react/use-render";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "bg-card text-foreground border border-border hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
      },
      size: {
        // Cibles tactiles généreuses par défaut.
        default: "h-12 px-5 text-base [&_svg]:size-5",
        sm: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-14 px-6 text-lg [&_svg]:size-6",
        icon: "h-12 w-12 [&_svg]:size-5",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      block: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Remplace l'élément rendu (ex. un <Link>), façon base-ui. */
  render?: useRender.RenderProp;
}

export function Button({
  className,
  variant,
  size,
  block,
  render,
  type,
  ...props
}: ButtonProps) {
  return useRender({
    render: render ?? <button type={type ?? "button"} />,
    props: {
      className: cn(buttonVariants({ variant, size, block, className })),
      ...props,
    },
  });
}

export { buttonVariants };
