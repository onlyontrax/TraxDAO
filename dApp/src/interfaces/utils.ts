export interface ISearch {
  q?: string;
  limit?: number;
  offset?: number;
}

export interface ICountry {
  name: string;
  code: string;
  flag: string;
}

export interface ILangguges {
  name: string;
  code: string;
}

export interface IPhoneCodes {
  name: string;
  code: string;
  dialCode: string;
}

export interface IMusic {
  genreOne: { value: string; text: string }[];
  genreTwo: { value: string; text: string }[];
  genreThree: { value: string; text: string }[];
  genreFour: { value: string; text: string }[];
  genreFive: { value: string; text: string }[];
  genders: { value: string; text: string }[];
}
