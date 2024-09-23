import { ICountry } from './utils';

export interface IUIConfig {
  theme: string;
  siteName: string;
  logo: string;
  menus: any[];
  favicon: string;
  loginPlaceholderImage?: string;
  footerContent: string;
  countries?: ICountry[];
  userBenefit: string;
  artistBenefit: string;
}
