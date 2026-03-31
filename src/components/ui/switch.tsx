import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  thumbIcon?: React.ReactNode; // optional icon inside thumb
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, checked, thumbIcon, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        "w-[54px] h-[29px] rounded-full relative flex-shrink-0 border cursor-pointer transition-all duration-300",
        checked
          ? "bg-gradient-to-br from-[#0d1433] to-[#091026] border-[rgba(77,155,255,0.25)]"
          : "bg-[rgba(240,242,248,0.70)] border-[rgba(255,255,255,0.75)]",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "absolute top-[3.5px] left-[3.5px] w-5 h-5 rounded-full flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.18)] transition-all duration-[380ms]",
          checked ? "translate-x-[25px] bg-gradient-to-br from-[#c0d4ff] to-[#93b5ff]" : "translate-x-0 bg-gradient-to-br from-white to-[#dde8ff]"
        )}
      >
        {thumbIcon && thumbIcon}
      </SwitchPrimitives.Thumb>
    </SwitchPrimitives.Root>
  )
);

Switch.displayName = SwitchPrimitives.Root.displayName;
export { Switch };