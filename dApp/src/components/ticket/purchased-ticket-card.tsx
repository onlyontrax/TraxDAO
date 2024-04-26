import { PureComponent } from 'react';
import { ITicket } from 'src/interfaces';
import { Tooltip, Modal } from 'antd';
import Link from 'next/link';
import styles from './ticket.module.scss';

interface IProps {
  ticket: ITicket;
}
interface IStates {
  openTicketModal: boolean;
}

export class PurchasedTicketCard extends PureComponent<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      openTicketModal: false
    };
  }


  async downloadImage(imageUrl: string): Promise<void> {
    try {
      // Fetch the image as a binary blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
  
      // Create a Blob URL
      const blobUrl = URL.createObjectURL(blob);
  
      // Create a link element and trigger a click to download the image
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'image.jpg'; // You can customize the filename here
      link.click();
  
      // Clean up by revoking the Blob URL
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  }


  render() {
    const { ticket } = this.props;
    const { openTicketModal } = this.state;
    const image = ticket?.image || '/static/no-image.jpg';
    const link = ticket?.downloadLink || `/event-store?id=${ticket.slug || ticket._id}`;
    const linkAs = ticket?.downloadLink || `/event-store?id=${ticket.slug || ticket._id}`;

    return (
      (
        <div className={styles.componentsticketModule}>
          {/* <Link
            href={link}
            as={linkAs}
          > */}
            <div className='ticket-card-container'>
                <div className='ticket-card-top-wrapper'>

                  <div className='tick-order-info-wrapper'>
                    <div >
                      <p>Order number</p>
                      {/* @ts-ignore */}
                      <span>{ticket.orderNumber}</span>
                    </div>
                    <div >
                      <p>Event date</p>
                      {/* @ts-ignore */}
                      <span>{ticket._doc.date}</span>
                    </div>
                    <div>
                      <p>Ticket tier</p>
                      {/* @ts-ignore */}
                      <span>{ticket.purchasedTier}</span>
                    </div>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'row', gap: '1rem'}}>
                    <div className='tick-order-link-wrapper'>
                      <Link  
                      // @ts-ignore
                        href={`/event-store?id=${ticket._doc.slug || ticket._doc._id}`}
                        // @ts-ignore
                        as={`/event-store?id=${ticket._doc.slug || ticket._doc._id}`}
                      >
                        <span>View Event</span>
                      </Link> 
                    </div>
                    <div className='view-ticket-wrapper' onClick={()=> this.setState({openTicketModal: true})}>
                      <div className='view-ticket'>
                        <span>View Ticket</span>
                      </div> 
                    </div>
                  </div>

                </div>
                <div className='ticket-card-bottom-wrapper'>
                    <div className="tick-prd-card" style={{ backgroundImage: `url(${image})` }}>
                      <div className="tick-prd-card-overlay"/>
                    </div>

                    <div className="tick-prd-info">
                            {/* @ts-ignore */}
                        <div className='tick-prd-name-wrapper'>
                          {/* @ts-ignore */}
                          <span className='tick-prd-name'>{ticket._doc.name}</span>
                          {/* @ts-ignore */}
                          <span className='tick-prd-price'>${(ticket.price).toFixed(2)}</span>
                        </div>
                        <div className='tick-prd-description'>
                          {/* @ts-ignore */}
                          <span>{ticket._doc.description}</span>
                        </div>

                            
                    </div>
                </div>
                <Modal
                  key="purchase-product"
                  width={500}
                  title={null}
                  open={openTicketModal}
                  onOk={() => this.setState({ openTicketModal: false })}
                  footer={null}
                  onCancel={() => this.setState({ openTicketModal: false })}
                  destroyOnClose
                  centered
                >
                  <div className='view-ticket-modal-container'>
                    <div className='view-ticket-header'>
                      {/* @ts-ignore */}
                      {ticket._doc.name} E-ticket
                    </div>
                    <span></span>
                    <div className='view-ticket-info-wrapper'>
                      <div className='tick-order-info-wrapper'>
                        <div>
                          <p>Order number:</p>
                          {/* @ts-ignore */}
                          <span>{ticket.orderNumber}</span>
                        </div>
                        <div>
                          <p>Event date:</p>
                          {/* @ts-ignore */}
                          <span>{ticket._doc.date}</span>
                        </div>
                        <div>
                          <p>Doors open: </p>
                          {/* @ts-ignore */}
                          <span>{ticket._doc.start}</span>
                        </div>
                        <div>
                          <p>Ticket tier:</p>
                          {/* @ts-ignore */}
                          <span>{ticket.purchasedTier}</span>
                        </div>
                      </div>
                      
                    </div>
                    <div className='view-ticket-image-wrapper'>
                      <img src={ticket.downloadLink} alt="" />
                    </div>
                    {/* @ts-ignore */}
                    <div className='view-ticket-wrapper' onClick={()=> this.downloadImage(ticket.downloadLink)}>
                      <div className='view-ticket'>
                        <span>Download ticket</span>
                      </div> 
                    </div>
                  </div>
                </Modal>
            </div>
          {/* </Link> */}

          
        </div>
      )
    );
  }
}
