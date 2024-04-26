import { createAsyncAction } from '@lib/redux';

export const {
  listTickets,
  listTicketsSuccess,
  listTicketsFail
} = createAsyncAction('listTickets', 'LIST_TICKET');

export const {
  moreTicket, moreTicketSuccess, moreTicketFail
} = createAsyncAction('moreTicket', 'MORE_TICKET');
