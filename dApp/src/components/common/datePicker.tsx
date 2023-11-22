import generatePicker from 'antd/lib/date-picker/generatePicker';
import type { Moment } from 'moment';
import momentGenerateConfig from 'rc-picker/lib/generate/moment';

export const DatePicker = generatePicker<Moment>(momentGenerateConfig);
