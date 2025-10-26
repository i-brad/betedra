import Ball from "@/components/vectors/Ball";
import { TicketProps, useTicketsStore } from "@/store/useTicketStore";
import React, { useState } from "react";

interface TicketComponentProps {
  cost?: string;
  showTotal?: boolean;
  ticket: TicketProps;
  duplicateWith: number[];
  disabled?: boolean;
}

const Ticket = ({
  cost,
  ticket,
  showTotal,
  disabled,
}: TicketComponentProps) => {
  const [numbers, setNumbers] = useState<string[]>(
    ticket.numbers || Array(6).fill("")
  );
  const { updateTicket } = useTicketsStore();

  const handleUpdate = (newNumbers: string[]) => {
    setNumbers(newNumbers);
    updateTicket(ticket.id, newNumbers);
  };

  const onPasteHandler = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteContent = e.clipboardData.getData("Text").trim();

    if (/^\d+$/.test(pasteContent) && pasteContent.length <= 6) {
      const filled = pasteContent.split("").slice(0, 6);
      const filler = Array(6 - filled.length).fill("");
      const newNumbers = [...filled, ...filler];
      handleUpdate(newNumbers);

      // focus last filled
      const inputs = (
        e.currentTarget.parentNode as HTMLElement
      ).querySelectorAll<HTMLInputElement>("input");
      const lastIndex = filled.length - 1;
      if (inputs[lastIndex]) inputs[lastIndex].focus();
    }
  };

  const onChangeHandler = (
    event: React.KeyboardEvent<HTMLInputElement>,
    digitId: number
  ) => {
    const { key } = event;
    const inputs = (
      event.currentTarget.parentNode as HTMLElement
    ).querySelectorAll<HTMLInputElement>("input");

    if (["e", "E", ".", ",", "-", "Unidentified"].includes(key)) {
      event.preventDefault();
      return;
    }

    // number input
    if (/^\d$/.test(key)) {
      event.preventDefault();
      const newNumbers = [...numbers];
      newNumbers[digitId] = key;
      handleUpdate(newNumbers);

      if (digitId + 1 < 6 && inputs[digitId + 1]) {
        inputs[digitId + 1].focus();
      }
      return;
    }

    // backspace
    if (key === "Backspace") {
      event.preventDefault();
      const newNumbers = [...numbers];

      if (numbers[digitId]) {
        newNumbers[digitId] = "";
        handleUpdate(newNumbers);
      } else if (digitId > 0 && inputs[digitId - 1]) {
        newNumbers[digitId - 1] = "";
        handleUpdate(newNumbers);
        inputs[digitId - 1].focus();
      }
      return;
    }

    // delete
    if (key === "Delete") {
      event.preventDefault();
      const newNumbers = [...numbers];

      if (numbers[digitId]) {
        newNumbers[digitId] = "";
        handleUpdate(newNumbers);
      } else if (digitId + 1 < 6 && inputs[digitId + 1]) {
        newNumbers[digitId + 1] = "";
        handleUpdate(newNumbers);
        inputs[digitId + 1].focus();
      }
      return;
    }

    // arrows
    if (key === "ArrowLeft" && digitId > 0 && inputs[digitId - 1]) {
      event.preventDefault();
      inputs[digitId - 1].focus();
    }

    if (key === "ArrowRight" && digitId + 1 < 6 && inputs[digitId + 1]) {
      event.preventDefault();
      inputs[digitId + 1].focus();
    }
  };

  return (
    <div>
      <span className="flex items-center mb-1.5 justify-between text-sm text-blue-gray-900">
        <span>Ticket #{ticket.id}</span>
        {showTotal ? (
          <span className="text-blue-gray-500 text-xs">
            Total cost: <span className="text-blue-gray-900">{cost} HBAR</span>
          </span>
        ) : null}
      </span>
      {/* <Numbers value={ticket.numbers.join("")} /> */}
      <div className="grid grid-cols-6 gap-[0.35rem]">
        {ticket.numbers.map((num, index) => {
          const randomNumber = Math.floor(Math.random() * 21) - 10;
          return (
            <span
              key={index}
              className="flex items-center justify-center text-sm lg:text-[1.39875rem] size-[2.448125rem] rounded-full relative"
            >
              <Ball className="absolute top-0 left-0 size-full" />
              <input
                type="number"
                value={num}
                maxLength={1}
                style={{
                  rotate: `${randomNumber}deg`,
                }}
                disabled={disabled}
                placeholder="_"
                inputMode="numeric"
                onChange={(e) => e.preventDefault()}
                onPaste={onPasteHandler}
                onKeyDown={(event) => onChangeHandler(event, index)}
                className="size-[2.448125rem] from-blue-500 via-dodger-blue text-sm lg:text-[1.39875rem] to-purple-500 bg-gradient-to-b bg-clip-text text-transparent font-bold text-center"
              />
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default Ticket;
