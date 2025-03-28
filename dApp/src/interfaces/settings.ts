import { IUser } from "./user";
import { ISettings } from "./setting";

export interface ISettingsProps {
  user: IUser;
  userType: 'fan' | 'artist';
  onFinish?: (values: any) => void;
  updating?: boolean;
  settings?: ISettings;
}

export interface ILayoutProps {
  currentUser: IUser;
  userType: 'fan' | 'artist';
  loading?: boolean;
  onFinish?: (values: any) => void;
  settings: ISettings;
}

export const FORM_LAYOUT = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

export const VALIDATE_MESSAGES = {
  required: 'This field is required!',
  types: {
    email: 'Not a valid email!',
    number: 'Not a valid number!'
  },
  number: {
    range: 'Must be between ${min} and ${max}'
  }
};
