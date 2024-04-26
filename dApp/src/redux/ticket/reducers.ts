import { merge } from 'lodash';
import { createReducers } from '@lib/redux';
import {
  listTickets, listTicketsFail, listTicketsSuccess, moreTicket, moreTicketFail, moreTicketSuccess
} from './actions';

const initialState = {
  tickets: {
    requesting: false,
    error: null,
    success: false,
    items: [],
    total: 0
  }
};

const ticketReducers = [
  {
    on: listTickets,
    reducer(state: any) {
      return {
        ...state,
        tickets: {
          ...state.tickets,
          requesting: true
        }
      };
    }
  },
  {
    on: listTicketsSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        tickets: {
          requesting: false,
          items: data.payload.data,
          total: data.payload.total,
          success: true
        }
      };
    }
  },
  {
    on: listTicketsFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        tickets: {
          ...state.tickets,
          requesting: false,
          error: data.payload
        }
      };
    }
  },
  {
    on: moreTicket,
    reducer(state: any) {
      return {
        ...state,
        tickets: {
          ...state.tickets,
          requesting: true,
          error: null,
          success: false
        }
      };
    }
  },
  {
    on: moreTicketSuccess,
    reducer(state: any, data: any) {
      return {
        ...state,
        tickets: {
          requesting: false,
          total: data.payload.total,
          items: [...state.tickets.items, ...data.payload.data],
          success: true
        }
      };
    }
  },
  {
    on: moreTicketFail,
    reducer(state: any, data: any) {
      return {
        ...state,
        tickets: {
          ...state.tickets,
          requesting: false,
          error: data.payload,
          success: false
        }
      };
    }
  }
];

export default merge({}, createReducers('ticket', [ticketReducers], initialState));
