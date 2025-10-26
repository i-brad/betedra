import Ball from "@/components/vectors/Ball";
import { cn } from "@/utils";
import React from "react";

interface Props {
  className?: string;
  value?: string;
}

const Numbers = ({ className, value }: Props) => {
  if (!value) return;

  return (
    <div className={cn("grid grid-cols-6 gap-[0.35rem]", className)}>
      {value
        ?.split("")
        ?.reverse()
        .map((number, index) => {
          if (index === 6) return;
          const randomNumber = Math.floor(Math.random() * 21) - 10;
          return (
            <span
              key={index}
              className="flex items-center justify-center text-sm lg:text-[1.39875rem] size-[2.448125rem] rounded-full relative"
            >
              <Ball className="absolute top-0 left-0 size-full" />
              <span
                style={{
                  rotate: `${randomNumber}deg`,
                }}
                className="from-blue-500 via-dodger-blue to-purple-500 bg-gradient-to-b bg-clip-text text-transparent font-bold text-center"
              >
                {number}
              </span>
            </span>
          );
        })}
    </div>
  );
};

export default Numbers;
