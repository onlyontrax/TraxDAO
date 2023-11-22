/* eslint-disable react/destructuring-assignment */
import Image from 'next/image';
import { PureComponent } from 'react';
import { IGallery } from 'src/interfaces';

interface IProps {
  gallery?: IGallery;
  style?: Record<string, string>;
}

export class CoverGallery extends PureComponent<IProps> {
  static defaultProps: Partial<IProps>;

  render() {
    const { gallery, style } = this.props;
    const url = gallery?.coverPhoto?.thumbnails ? gallery?.coverPhoto?.thumbnails[0]
      : '/static/no-image.jpg';
    return (
      <Image
        alt="Cover"
        src={url}
        layout="fixed"
        width={50}
        height={50}
        style={style || { borderRadius: '3px' }}
      />
    );
  }
}

CoverGallery.defaultProps = {
  gallery: {} as IGallery,
  style: {}
} as Partial<IProps>;
