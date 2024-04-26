import { flatten } from 'lodash';
import { put } from 'redux-saga/effects';
import { createSagas } from '@lib/redux';
import { ticketService } from '@services/index';
import { IReduxAction } from 'src/interfaces';
import {
  listTickets, listTicketsFail, listTicketsSuccess, moreTicketFail, moreTicketSuccess, moreTicket
} from './actions';

const ticketSagas = [
  {
    on: listTickets,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield ticketService.userSearch(data.payload);
        yield put(listTicketsSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(listTicketsFail(error));
      }
    }
  },
  {
    on: moreTicket,
    * worker(data: IReduxAction<any>) {
      try {
        const resp = yield ticketService.userSearch(data.payload);
        yield put(moreTicketSuccess(resp.data));
      } catch (e) {
        const error = yield Promise.resolve(e);
        yield put(moreTicketFail(error));
      }
    }
  }
];

export default flatten([createSagas(ticketSagas)]);
