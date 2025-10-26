import generateTicketNumbers from "@/state/lottery/generateTicketNumbers";
import { parseRetrievedNumber } from "@/state/lottery/helpers";
import { LotteryTicket } from "@/state/lottery/types";
import { create } from "zustand";

export interface TicketProps {
  id: number;
  numbers: string[];
  duplicateWith: number[];
  isComplete: boolean;
}

export interface TicketsState {
  tickets: TicketProps[];
  allComplete: boolean;
  updateTicket: (ticketId: number, newNumbers: string[]) => void;
  reset: (amount: number, userCurrentTickets: LotteryTicket[]) => void;
  randomize: (amount: number, userCurrentTickets: LotteryTicket[]) => void;
  getTicketsForPurchase: () => number[];
}

const getInitialState = ({
  amount,
  userCurrentTickets,
}: {
  amount: number;
  userCurrentTickets: LotteryTicket[];
}): { tickets: TicketProps[]; allComplete: boolean } => {
  const randomTickets = generateTicketNumbers(amount, userCurrentTickets);
  const randomTicketsAsStringArray = randomTickets.map((ticket) =>
    parseRetrievedNumber(ticket.toString()).split("")
  );

  const tickets = Array.from({ length: amount }, (_, i) => i + 1).map(
    (index) => ({
      id: index,
      numbers: randomTicketsAsStringArray[index - 1],
      duplicateWith: [],
      isComplete: true,
    })
  );

  return {
    tickets,
    allComplete: true,
  };
};

export const useTicketsStore = create<TicketsState>((set, get) => ({
  tickets: [],
  allComplete: false,

  updateTicket: (ticketId, newNumbers) => {
    const { tickets } = get();
    const updatedTickets = [...tickets];

    const newDuplicates = tickets.filter(
      (ticket) =>
        ticket.id !== ticketId &&
        ticket.isComplete &&
        ticket.numbers.join("") === newNumbers.join("")
    );

    // remove old duplicate refs
    const prevDuplicates = updatedTickets[ticketId - 1].duplicateWith;
    prevDuplicates.forEach((prevTicketId) => {
      if (!newDuplicates.map(({ id }) => id).includes(prevTicketId)) {
        const dupsToUpdate = [
          ...updatedTickets[prevTicketId - 1].duplicateWith,
        ];
        const indexToRemove = dupsToUpdate.findIndex((id) => id === ticketId);
        if (indexToRemove !== -1) dupsToUpdate.splice(indexToRemove, 1);
        updatedTickets[prevTicketId - 1] = {
          ...updatedTickets[prevTicketId - 1],
          duplicateWith: dupsToUpdate,
        };
      }
    });

    // update duplicateWith if found
    if (newDuplicates.length !== 0) {
      newDuplicates.forEach((duplicate) => {
        updatedTickets[duplicate.id - 1] = {
          ...duplicate,
          duplicateWith: [...duplicate.duplicateWith, ticketId],
        };
      });
    }

    const updatedTicket: TicketProps = {
      id: ticketId,
      numbers: newNumbers,
      duplicateWith: newDuplicates.map((ticket) => ticket.id),
      isComplete: newNumbers.join("").length === 6,
    };
    updatedTickets[ticketId - 1] = updatedTicket;

    const allComplete = updatedTickets.every((ticket) => ticket.isComplete);

    set({ tickets: updatedTickets, allComplete });
  },

  reset: (amount, userCurrentTickets) => {
    const initialState = getInitialState({ amount, userCurrentTickets });
    set(initialState);
  },

  randomize: (amount, userCurrentTickets) => {
    const initialState = getInitialState({ amount, userCurrentTickets });
    set(initialState);
  },

  getTicketsForPurchase: () => {
    const { tickets } = get();
    return tickets.map((ticket) => {
      const reversedTicket = [...ticket.numbers]
        .map((num) => parseInt(num, 10))
        .reverse();
      reversedTicket.unshift(1);
      const ticketAsNumber = parseInt(reversedTicket.join(""), 10);
      return ticketAsNumber;
    });
  },
}));
