import { Transition } from '@headlessui/react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'
import { XMarkIcon } from '@heroicons/react/20/solid'

export default function FollowNotification({visible, closeNotification, artist}) {

  return (
    <>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-6 z-10 flex px-4 py-12 items-start"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition show={visible}>
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-trax-black shadow-lg ring-1 ring-custom-green ring-opacity-40 transition data-[closed]:data-[enter]:translate-y-2 data-[enter]:transform data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-100 data-[enter]:ease-out data-[leave]:ease-in data-[closed]:data-[enter]:sm:translate-x-2 data-[closed]:data-[enter]:sm:translate-y-0">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon aria-hidden="true" className="h-6 w-6 text-custom-green" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-semibold text-trax-white">You are now following {artist}!</p>
                    <p className="mt-1 text-sm font-light text-trax-white">By following {artist}, you consent for us to share your email address and name with them.</p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => closeNotification()}
                      className="inline-flex rounded-md text-trax-white hover:bg-trax-white hover:text-trax-black transition focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </>
  )
}
