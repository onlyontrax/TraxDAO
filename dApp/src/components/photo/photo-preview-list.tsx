import { Image } from 'antd';
import { IPhotos } from 'src/interfaces';
import styles from './index.module.scss';

interface IProps {
  photos: IPhotos[];
  isBlur: boolean;
}

function PhotoPreviewList({
  photos, isBlur
}: IProps) {
  return (
    <div className={styles.componentsPhotoPhotoPreviewListModule}>
      <div className={!isBlur ? 'list-photos' : 'list-photos blur'}>

        <Image.PreviewGroup>
          {photos.map((item) => (
            <Image
              alt="Photo"
              key={item._id}
              className="photo-card"
              src={isBlur ? (item?.photo?.thumbnails && item?.photo?.thumbnails[0]) || '/static/no-image.jpg' : item?.photo?.url}
              preview={isBlur ? false : {
                src: item?.photo?.url
              }}
            />
          ))}
        </Image.PreviewGroup>
      </div>
    </div>
  );
}
export default PhotoPreviewList;
