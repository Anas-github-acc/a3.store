import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import style from "./a3.button.module.css";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "style.default",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const A3Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(style["default-base"],
          buttonVariants({ variant, size }),
          className
        )}
        ref={ref}
        {...props}
        data-framer-name="Primary"
        data-highlight="true"
        tabIndex={0}
        style={{
          borderRadius: 12,
          opacity: 1,
          ...(props.style || {}),
        }}
      >
        <div
          className={cn(style["default-back-shadow"], style["default-back-shadow-pos"])}
          data-framer-name="Blob"
          style={{
            background: "radial-gradient(50% 50%, rgb(255, 255, 255) 52.8846%, rgb(140, 54, 2) 100%)",
            filter: "blur(3px)",
            borderRadius: "100%",
            opacity: 1,
          }}
        ></div>
        <div
          className="framer-1cqnp6c"
          data-framer-name="Blur"
          style={{
            // backgroundColor: "var(--token-d036317c-cd8d-4b85-8162-192e6730b357, rgb(218, 78, 36))",
            filter: "blur(10px)",
            borderRadius: "100%",
            opacity: 0.6,
          }}
        ></div>
        <div
          className="framer-vc05ce"
          data-framer-name="Gradient"
          style={{
            background:
              "linear-gradient(163deg, rgb(255, 137, 24) 28.000000000000004%, var(--token-9ac59eff-1022-40a8-ae94-1c27de6ff71e, rgb(162, 41, 4)) 54%, var(--token-7bddd129-833e-4592-8d35-b38628f5587c, rgb(0, 0, 0)) 68%, var(--token-75161833-e0e8-4cc7-a671-fa8c224dd0e8, rgb(0, 152, 243)) 100%)",
            borderRadius: 12,
            opacity: 1,
          }}
        ></div>
        <div
          className={cn(style["default-button"])}
          data-framer-name="Fill"
        ></div>
        <div className={cn(style["default-content-wrapper"])} data-framer-name="Text">
          <div
            className={cn(style["default-content"])}
            data-framer-name="Text 1"
            data-framer-component-type="RichTextContainer"
            style={{
              // @ts-ignore
              "--framer-paragraph-spacing": "0px",
              transform: "none",
              opacity: 1,
            }}
          >
            <p
              className="framer-text framer-styles-preset-amoww1"
              data-styles-preset="RzAhCiscr"
            >
              Get Started - Free
            </p>
          </div>
          <div
            className="framer-119r11v"
            data-framer-name="Text 2"
            data-framer-component-type="RichTextContainer"
            style={{
              // @ts-ignore
              "--framer-paragraph-spacing": "0px",
              opacity: 0,
              transform: "none",
            }}
          >
            <p
              className="framer-text framer-styles-preset-amoww1"
              data-styles-preset="RzAhCiscr"
            >
              Get Started - Free
            </p>
          </div>
        </div>
      </Comp>
    );
  },
);
A3Button.displayName = "A3Button";

export { A3Button, buttonVariants };

