import React, {useState} from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faSoundcloud, faXTwitter, faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Avatar, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';
import { CheckBadgeIcon } from "@heroicons/react/24/solid";
import { MultiStepLoader as Loader } from "@components/ui/multi-step-loader";
import { IconSquareRoundedX } from "@tabler/icons-react";


const loadingStates = [
  {
    text: "Connecting wallet",
  },
  {
    text: "Processing request",
  },
  {
    text: "Initiating transfer",
  },
  {
    text: "Processing transfer",
  },
  {
    text: "Transfer complete",
  }
];

const PaymentProgress = ({stage, confetti}): JSX.Element => {

  const [loading, setLoading] = useState(true);

  return (
    <div className="w-full h-[60vh] flex items-center justify-center">
      {/* Core Loader Modal */}

      <Loader stage={stage} loadingStates={loadingStates} loading={loading} duration={2000}  confetti={confetti} />

      {loading && (
        <button
          className="fixed top-20 right-4 text-trax-white z-[120]"
          onClick={() => setLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </div>

    // <div className="confirm-purchase-form" style={{height: '540px'}}>
    //         <div className="left-col">
    //           <Avatar src={performer?.avatar || "/static/no-avatar.png"} />
    //           <div className="p-name" style={{fontWeight: '300'}}>
    //             Payment to {performer?.name || "N/A"}{" "}
    //             {performer?.verifiedAccount && (
    //               <CheckBadgeIcon style={{ height: "1.2rem", top: '4px', position: 'relative' }} className="primary-color" />
    //             )}
    //           </div>
    //           <span style={{color: 'white', fontSize: '14px', fontWeight: '300'}}>Please do not refresh the page!</span>
    //         </div>
    //         <div className="progress-stages-container">
    //           <div className="progress-stage-wrapper" style={{position: 'absolute', top: '13rem'}}>
    //               <div className={progress >= 25 ? "progress-stage-complete" : "progress-stage-current"}>
    //                 {progress >= 25 ? (
    //                 <FontAwesomeIcon className="progress-tick" icon={faCheck} />
    //                 ) : (
    //                   <>
    //                   {progress !== 0 ? (<span className="progress-stage-number">1</span>) : (
    //                     <>
    //                       <span className="progress-stage-number-current">1</span>
    //                       <Spin indicator={<LoadingOutlined className="tx-progress-spinner" spin />}/>
    //                     </>
    //                   )}
    //                   </>
    //                 )}

    //               </div>
    //               <div className="progress-stage-label-wrapper">
    //                 <span className="progress-stage-label" style={{color: progress >= 25 ? 'white' : '#856dd4'}}>Connecting to TRAX</span>
    //                 {progress >= 25 && (
    //                 <div className="progress-status-wrapper-complete">
    //                   <span>Completed</span>
    //                 </div>
    //                 )}
    //                 {progress < 25 && (
    //                 <div className="progress-status-wrapper-pending">
    //                   <span>In progress</span>
    //                 </div>
    //                 )}
    //               </div>
    //           </div>

    //           <div className={progress > 0 ? "progress-bridge-complete" : "progress-bridge-pending"} style={{position: 'absolute', top: '15rem'}}/>

    //           <div className="progress-stage-wrapper" style={{position: 'absolute', top: '18rem'}}>
    //             <div className={progress >= 50 ? "progress-stage-complete" : ( progress !== 25 ? "progress-stage-pending" : "progress-stage-current")}>
    //               {progress >= 50 ? (
    //                 <FontAwesomeIcon className="progress-tick" icon={faCheck} />
    //                 ) : (
    //                   <>
    //                   {progress !== 25 ? (<span className="progress-stage-number">2</span>) : (
    //                     <>
    //                       <span className="progress-stage-number-current">2</span>
    //                       <Spin indicator={<LoadingOutlined className="tx-progress-spinner" spin />}/>
    //                     </>
    //                   )}
    //                   </>
    //                 )}
    //             </div>
    //             <div className="progress-stage-label-wrapper">
    //               <span className="progress-stage-label" style={{color: progress >= 50 ? 'white' : '#856dd4'}}>Checking eligibility of transaction</span>
    //               {progress >= 50 && (
    //               <div className="progress-status-wrapper-complete">
    //                 <span>Completed</span>
    //               </div>
    //               )}
    //               {progress === 25 && (
    //               <div className="progress-status-wrapper-pending">
    //                 <span>In progress</span>
    //               </div>
    //               )}
    //             </div>
    //           </div>

    //           <div className={progress > 25 ? "progress-bridge-complete" : "progress-bridge-pending"} style={{position: 'absolute', top: '20rem'}}/>

    //           <div className="progress-stage-wrapper" style={{position: 'absolute', top: '23rem'}}>
    //             <div className={progress >= 75 ? "progress-stage-complete" : ( progress !== 50 ? "progress-stage-pending" : "progress-stage-current")}>
    //                 {progress >= 75 ? (
    //                 <FontAwesomeIcon className="progress-tick" icon={faCheck} />
    //                 ) : (
    //                   <>
    //                   {progress !== 50 ? (<span className="progress-stage-number">3</span>) : (
    //                     <>
    //                       <span className="progress-stage-number-current">3</span>
    //                       <Spin indicator={<LoadingOutlined className="tx-progress-spinner" spin />}/>
    //                     </>
    //                   )}
    //                   </>
    //                 )}
    //             </div>
    //             <div className="progress-stage-label-wrapper">
    //               <span className="progress-stage-label" style={{color: progress >= 75 ? 'white' : '#856dd4'}}>Transferring funds to canister</span>
    //               {progress >= 75 && (
    //               <div className="progress-status-wrapper-complete">
    //                 <span>Completed</span>
    //               </div>
    //               )}
    //               {progress === 50 && (
    //               <div className="progress-status-wrapper-pending">
    //                 <span>In progress</span>
    //               </div>
    //               )}
    //             </div>
    //           </div>

    //           <div className={progress > 50 ? "progress-bridge-complete" : "progress-bridge-pending"} style={{position: 'absolute', top: '25rem'}}/>

    //           <div className="progress-stage-wrapper" style={{position: 'absolute', top: '28rem'}}>
    //             <div className={progress === 100 ? "progress-stage-complete" : ( progress !== 75 ? "progress-stage-pending" : "progress-stage-current")}>

    //                 {progress === 100 ? (
    //                 <FontAwesomeIcon className="progress-tick" icon={faCheck} />
    //                 ) : (
    //                   <>
    //                   {progress !== 75 ? (<span className="progress-stage-number">4</span>) : (
    //                     <>
    //                       <span className="progress-stage-number-current">4</span>
    //                       <Spin indicator={<LoadingOutlined className="tx-progress-spinner" spin />}/>
    //                     </>
    //                   )}
    //                   </>
    //                 )}
    //             </div>
    //             <div className="progress-stage-label-wrapper">
    //               <span className="progress-stage-label" style={{color: progress === 100 ? 'white' : '#856dd4'}}>{`Transferring funds to ${performer?.name}`}</span>
    //               {progress === 100 && (
    //               <div className="progress-status-wrapper-complete">
    //                 <span>Completed</span>
    //               </div>
    //               )}
    //               {progress === 75 && (
    //               <div className="progress-status-wrapper-pending">
    //                 <span>In progress</span>
    //               </div>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //       </div>
  )
}

PaymentProgress.propTypes = {}

export default PaymentProgress;