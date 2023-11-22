import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useState } from 'react';
import { IGallery } from 'src/interfaces';
import styles from './gallery.module.scss';

interface GalleryCardIProps {
  gallery: IGallery;
}

function GalleryCard({ gallery }: GalleryCardIProps) {
  const [isHovered, setHover] = useState(false);
  const canView = (gallery.isSale === 'subscription' && gallery.isSubscribed) || (gallery.isSale === 'pay' && gallery.isBought) || gallery.isSale === 'free';
  const thumbUrl = (!canView
    ? gallery?.coverPhoto?.thumbnails && gallery?.coverPhoto?.thumbnails[0]
    : gallery?.coverPhoto?.url) || '/static/no-image.jpg';
  return (
    <div className={styles.componentsGalleryGalleryCardsModule}>
      <Link
        href={`/gallery?id=${gallery?.slug || gallery?._id}`}
        as={`/gallery?id=${gallery?.slug || gallery?._id}`}
        legacyBehavior
      >
        <div
          className="gallery-card"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {gallery?.isSale === 'pay' && gallery?.price > 0 && (
          <span className="gallery-price">
            <div className="label-price">
              $
              {(gallery?.price || 0).toFixed(2)}
            </div>
          </span>
          )}
          <div className="gallery-thumb">
            <div
              className="card-bg"
              style={{
                backgroundImage: `url(${thumbUrl})`
              }}
            />
            <div className="lock-middle">
              {canView || isHovered ? <UnlockOutlined /> : <LockOutlined />}
            </div>
          </div>
          <div className="gallery-info-wrapper">
            <div className="gallery-info">
              {gallery.title}
            </div>
            <div className="album-info">
              {gallery.createdAt.toString().substring(0, 4)}
              <div className="album-dot" />
              Album
            </div>
          </div>

        </div>
      </Link>
    </div>
  );
}
export default GalleryCard;
