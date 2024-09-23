import { Carousel } from 'antd';
import { chunk } from 'lodash';
import { PureComponent } from 'react';
import { ICountry, IPerformer } from 'src/interfaces';
import PerformerCard from './card';
import styles from './performer.module.scss';

interface IProps {
  performers: IPerformer[];
  countries: ICountry[];
}

export class HomePerformers extends PureComponent<IProps> {
  render() {
    const { performers, countries } = this.props;
    const chunkPerformers = chunk(performers, 5);
    return (
      <div className={styles.componentsPerformerVerificationFormModule}>
        <div className="sug-content">
          <Carousel swipeToSlide arrows dots={false}>
            {chunkPerformers.length > 0 && chunkPerformers.map((arr: any, index) => (
            // eslint-disable-next-line react/no-array-index-key
              <div key={`newaa_${index}`}>
                {arr.length > 0 && arr.map((p) => <PerformerCard countries={countries} performer={p} key={p._id} />)}
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    );
  }
}
