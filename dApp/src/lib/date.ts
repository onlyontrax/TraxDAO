import moment from 'moment';

export function formatDate(date: Date, format = 'DD/MM/YY HH:mm') {
  return moment(date).format(format);
}

export function formatDateNoTime(date: Date, format = 'DD/MM/YYYY') {
  return moment(date).format(format);
}

export function formatDateFromnow(date: Date) {
  return moment(date).fromNow();
}

export function dobToAge(date: Date) {
  return moment().diff(moment(date), 'years') > 0 && `${moment().diff(moment(date), 'years')}+`;
}

export function nowIsBefore(date: Date) {
  return moment().isBefore(date);
}
