import React, { useState, useEffect } from 'react';

export default function CookiesBanner() {
  const [isCookieBannerVisible, setIsCookieBannerVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='));
    if (!consent) {
      setIsCookieBannerVisible(true);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = "cookie_consent=accepted; path=/; max-age=" + (60 * 60 * 24 * 365) + "; SameSite=Lax";
    setIsCookieBannerVisible(false);
  };

  const handleReject = () => {
    document.cookie = "cookie_consent=rejected; path=/; max-age=" + (60 * 60 * 24 * 30) + "; SameSite=Lax";
    setIsCookieBannerVisible(false);
  };

  if (!isCookieBannerVisible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 px-6 pb-24 md:pb-6 z-20">
      <div className="pointer-events-auto mx-auto max-w-xl rounded-xl bg-trax-black/50 p-6 shadow-lg">
        <p className="text-sm leading-6 text-trax-white">
          We use cookies to enhance your browsing experience, provide personalized content, and analyze site traffic. By
          clicking "Accept all," you consent to our use of cookies. For more details, see our{' '}
          <a href="http://stagingapp.trax.so/page/?id=cookies-policy" className="font-semibold">
            cookies policy
          </a>
          .
        </p>
        <div className="mt-4 flex items-center gap-x-5">
          <button
            type="button"
            className="rounded-md bg-trax-white font-heading px-3 py-2 text-sm font-semibold text-trax-black shadow-sm hover:bg-trax-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trax-gray-900"
            onClick={handleAccept}
          >
            Accept all
          </button>
          <button
            type="button"
            className="text-sm font-semibold font-heading leading-6 text-trax-white"
            onClick={handleReject}
          >
            Reject all
          </button>
        </div>
      </div>
    </div>
  );
}
