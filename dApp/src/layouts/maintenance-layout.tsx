import Image from 'next/image';

function MaintenaceLayout() {
  return (
    <>
      <style jsx>
        {`
          * {
            text-align: center;
          }
          figure {
            font-size: 12px;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 64em;
          }
          /* III. Responsiveness */
          @media screen and (min-width: 720px) {
            figure {
              font-size: 13px;
            }
          }
          @media screen and (min-width: 1440px) {
            figure {
              font-size: 14px;
            }
          }
        `}
      </style>
      <figure>
        <div>
          <h1>Site Under Maintenance</h1>
          <p>We are currently performing updates. Please check back later.</p>
        </div>
      </figure>
    </>
  );
}

export default MaintenaceLayout;
