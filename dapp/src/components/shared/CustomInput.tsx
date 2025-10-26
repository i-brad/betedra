import usePollOraclePrice from "@/hooks/usePollOraclePrice";
import { cn, currencyFormatter } from "@/utils";
import Image from "next/image";
import { useMemo } from "react";
import { Betedra, BetedraActive } from "../vectors/Betedra";

export const SelectPercentage = ({
  value,
  balance,
  percentageHandler,
  className,
}: {
  value: number;
  balance: number;
  percentageHandler: (value: number) => void;
  className?: string;
}) => {
  const percentages = [10, 25, 50, 75, 100];

  const currentPercentage = useMemo(() => {
    return (value / balance) * 100;
  }, [value, balance]);

  return (
    <div className={cn(className)}>
      <div className="relative mb-[0.48125rem]">
        <span className="block bg-blue-gray-200 w-full rounded-[1.5rem] h-[0.125rem]">
          <span
            style={{
              width: `${currentPercentage}%`,
            }}
            className="block bg-blue-500 h-full rounded-[1.5rem]"
          />
        </span>
        <div className="absolute top-1/2 -translate-y-1/2 flex items-center justify-between w-full">
          {percentages.map((percentage) => {
            if (currentPercentage >= percentage) {
              return <BetedraActive key={percentage} />;
            }
            return <Betedra key={percentage} />;
          })}
        </div>
      </div>
      <div className="flex items-center justify-between">
        {percentages.map((percentage) => (
          <button
            key={percentage}
            onClick={() => percentageHandler(percentage)}
            disabled={balance === 0}
            className="disabled:opacity-50 disabled:cursor-not-allowed text-blue-gray-500 transition-transform duration-75 text-xs grid place-items-center"
          >
            <span>{percentage}%</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export interface TokenProps {
  _id: string;
  logo_url: string;
  name: string;
  address: string;
  decimals: number;
}

export interface Props {
  label: string;
  name: string;
  labelClassName?: string;
  showPercentage?: boolean;
  disabled?: boolean;
  value: string;
  balance: string;
  handleInputChange: (value: string) => void;
  minimumAmount: number;
}

const CustomInput = ({
  label,
  showPercentage = true,
  labelClassName,
  name,
  disabled = false,
  value,
  balance,
  handleInputChange,
  minimumAmount,
}: Props) => {
  const { price } = usePollOraclePrice();
  const percentageHandler = (percentage: number) => {
    const result = Number(balance) * (percentage / 100);
    handleInputChange(result.toString());
  };

  return (
    <div>
      <span className="flex mb-1.5 items-start text-blue-gray-500 justify-between">
        <span className={cn("text-sm", labelClassName)}>{label}</span>
        <span className="text-sm text-blue-gray-900 flex items-center space-x-0.5">
          <Image src="/svgs/hbar.svg" alt="hbar" width={16} height={16} />
          <span>HBAR</span>
        </span>
      </span>

      <div className="flex items-center w-full border border-blue-gray-200 rounded-lg mb-1.5 p-2">
        <input
          name={name}
          placeholder={"0.00"}
          autoComplete="off"
          value={value}
          disabled={disabled}
          min={minimumAmount}
          onChange={(event) => {
            const target = event.target;
            const value = target.value.replace(/[^\d.]/g, "");
            handleInputChange(value);
          }}
          className="p-0 m-0 text-sm lg:text-base w-full disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-blue-gray-500 text-blue-gray-900 bg-transparent border-none outline-none"
        />
        <span className="text-xs text-gray-200">
          ~{currencyFormatter(Number(price) * Number(value), 2)}
        </span>
      </div>
      <div className="flex items-center justify-between mb-3.5 gap-1">
        <span className="flex items-center text-blue-gray-500 text-xs">
          <span>Available: </span>
          <span className="text-blue-gray-900">{balance}</span>
        </span>
        <span className="flex items-center justify-end text-blue-gray-500 text-xs">
          <span>Minimum: </span>
          <span className="text-blue-gray-900">5 HBAR</span>
        </span>
      </div>
      {/* percentage */}
      {showPercentage ? (
        <SelectPercentage
          value={Number(value)}
          percentageHandler={percentageHandler}
          balance={Number(balance)}
        />
      ) : null}
    </div>
  );
};

export default CustomInput;
