/* eslint-disable no-restricted-syntax */
/* eslint-disable react/require-default-props */
import { PureComponent, createRef } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Upload,
  Button,
  message,
  Progress,
  Row,
  Col,
  DatePicker,
  TimePicker,
  Switch
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { ITicket } from 'src/interfaces';
import { FileAddOutlined, CameraOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import {BsCheckCircleFill} from 'react-icons/bs';
import moment from 'moment';
import Router from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBullhorn, faImage, faVideo, faSquarePollHorizontal, faTrash } from '@fortawesome/free-solid-svg-icons'
import Places from './places'

interface IProps {
  ticket?: ITicket;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

dayjs.extend(customParseFormat);

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormTicket extends PureComponent<IProps> {
  state = {
    previewImageTicket: null,
    digitalFileAdded: false,
    stage: 0,
    tiers: [],
    tierName: "",
    tierSupply: "",
    tierPrice: "",
    eventDate: '',
    startTime: '',
    endTime: '',
    active: true,
    locationLat: 0,
    locationLng: 0,
    address: '',

  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { ticket } = this.props;
    if (ticket) {
      // const shippingFees = {};
      // for (const fee of product.shippingFees) {
      //   shippingFees[fee.type] = fee.fee;
      // }
      const {ticket} = this.props;

      this.setState({
        locationLng: ticket.longitude,
        locationLat: ticket.latitude,
        address: ticket.address,
        startTime: ticket.start,
        endTime: ticket.end,
        eventDate: `${ticket.date}23:00:00 GMT`,
        // eventDate: new Date(ticket.date),
        tiers: ticket.tiers
      })



      this.setState({
        previewImageTicket: ticket?.image || '/static/no-image.jpg',
        digitalFileAdded: !!ticket.digitalFileUrl,
        shippingOption: 'standard'
      });
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
    if (field === 'type') {
      this.setState({ isDigitalticket: val === 'digital' });
    }
  }

  // onFeeChange(val: number) {
  //   const { shippingOption, shippingFees } = this.state;
  //   const update = {};
  //   update[shippingOption] = val;
  //   this.setState({
  //     shippingFees: {
  //       ...shippingFees,
  //       ...update
  //     }
  //   });
  // }

  beforeUploadThumb(file) {
    const { beforeUpload } = this.props;
    const reader = new FileReader();
    reader.addEventListener('load', () => this.setState({ previewImageTicket: reader.result }));
    reader.readAsDataURL(file);
    const isValid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_FILE as any || 100);
    if (!isValid) {
      message.error(`File is too large please provide an file ${process.env.NEXT_PUBLIC_MAX_SIZE_FILE || 100}MB or below`);
      return false;
    }
    beforeUpload && beforeUpload(file, 'image');
    return isValid;
  }

  beforeUploadDigitalFile(file) {
    const { beforeUpload } = this.props;
    const isValid = file.size / 1024 / 1024 < (process.env.NEXT_PUBLIC_MAX_SIZE_FILE as any || 100);
    if (!isValid) {
      message.error(`File is too large please provide an file ${process.env.NEXT_PUBLIC_MAX_SIZE_FILE || 100}MB or below`);
      return false;
    }
    this.setState({ digitalFileAdded: true });
    beforeUpload && beforeUpload(file, 'digitalFile');
    return isValid;
  }

  // encodeToBody(fees) {
  //   const result = {};
  //   for (let i = 0; i < Object.keys(fees).length; i += 1) {
  //     result[`shippingFees[${i}][type]`] = Object.keys(fees)[i];
  //     result[`shippingFees[${i}][fee]`] = fees[Object.keys(fees)[i]];
  //   }
  //   return result;
  // }

  getCurrentDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();

    return `${year}-${month}-${day}`;
  }

  addItem = () => {
    const { tierName, tierSupply, tierPrice, tiers } = this.state;
    if(tierName && tierSupply && (tierPrice >= '0')){

      let newTier = {
        name: tierName,
        supply: tierSupply,
        price: tierPrice
      }

      let isNameValid = true;
      tiers.map((tier)=>{
        if(tierName === tier.name){
          isNameValid = false;
          message.error('You cannot have two tiers named the same. Chose a different name.')
        }
      })

      if(isNameValid){
        this.setState({
          tiers: [...tiers, newTier],
          tierName: '',
          tierSupply: '',
          tierPrice: ''
        });
      }else{
        this.setState({tierName: ''});
      }
    }else{
      message.info("You must fill in all tier fields!");
    }
  };

  onChangeStartTime = (time: Dayjs, timeString: string) => {
    this.setState({startTime: timeString})
  };

  onChangeFinishTime = (time: Dayjs, timeString: string) => {
    this.setState({endTime: timeString})
  };

  onChangeDate = (Date) => {
    let date = Date.toString();
    this.setState({eventDate: date})
  };

  handleLocation = (val) => {
    if(val){
      this.setState({locationLat: val.lat})
      this.setState({locationLng: val.lng})

    }
  }

  handleAddress = (val) => {
    this.setState({address: val})
  }

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      ticket, submit, uploading, uploadPercentage
    } = this.props;
    const {
      previewImageTicket, digitalFileAdded, stage, tiers, active, locationLat, eventDate, locationLng, startTime, endTime, address
    } = this.state;
    const haveTicket = !!ticket;




    return (
      <div className='create-product-container'>
        <div className="content-progress-bar">
          <div style={{borderTopLeftRadius: 10, borderBottomLeftRadius: 10}} className={`${stage >= 0 ? 'active' : ''}`} />
          <div className={`${stage >= 0 ? 'active' : ''}`} />
          <div className={`${stage >= 1 ? 'active' : ''}`} />
          <div className={`${stage >= 2 ? 'active' : ''}`} />
          <div className={`${stage >= 3 ? 'active' : ''}`} />
          <div className={`${stage >= 4 ? 'active' : ''}`} />
          <div style={{borderTopRightRadius: 10, borderBottomRightRadius: 10}} className={`${stage >= 5 ? 'active' : ''}`} />
        </div>
        <div className='create-product-preview-wrapper'>
          <div className='create-product-preview' style={{backgroundImage: previewImageTicket ? `url('${previewImageTicket}')`: ""}}>
            <div className='create-product-blur'>
              {!previewImageTicket && (
                  <div className='preview-msg'>
                      <span >Preview</span>
                  </div>
              )}
            </div>

            {previewImageTicket && (
              <img
                src={previewImageTicket}
                alt="file"
                className='create-product-img'
              />
            )}
          </div>
        </div>
        <div className='create-product-form-wrapper'>
          <Form
            {...layout}
            onFinish={(values) => {
              const data = values;
              // submit.bind(this)({ ...data, ...this.encodeToBody(shippingFees) })
              data.latitude = locationLat
              data.longitude = locationLng
              data.tiers = tiers
              data.start = startTime
              data.end = endTime
              data.date = eventDate.slice(0, -12)
              data.address = address

              submit(data);
            }}
            onFinishFailed={() => message.error('Please complete the required fields')}
            name="form-upload"
            ref={this.formRef}
            validateMessages={validateMessages}
            initialValues={
              ticket || ({
                name: '',
                price: 1,
                description: '',
                active: true,
                performerId: '',
                stock: 1,
                type: 'ticket'
              })
            }
            className="product-form"
            scrollToFirstError
            style={{ width: '100%'}}
          >
            <Row>
            <div className={stage === 0 ? 'display-contents' : 'no-display'}>
            <div className='form-top-wrapper' style={{width: '100%'}}>
                    <div style={{width: '10%'}}>
                      <Button
                        className="new-post-delete-btn"
                        onClick={() => Router.back()}
                        style={{ backgroundColor: 'transparent', border: 'none' }}
                        disabled={uploading}
                      >
                        <FontAwesomeIcon icon={faXmark} />
                      </Button>
                    </div>
                  <h1 className='upload-header'>Create event</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10 }}
                      onClick={()=> this.setState({stage: 1})}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
                <div className='form-middle-wrapper' style={{width: '100%', borderBottom: 'none', minHeight: '42rem'}}>
                <div className='form-access-wrapper' style={{width: '100%'}}>
                  <p className="create-post-subheading">Select ticket type</p>
                  <Form.Item
                    name="type"
                    rules={[{ required: true, message: 'Please select type!' }]}
                  >
                    <Select className='track-type-form' onChange={(val) => this.setFormVal('type', val)}>
                      <Select.Option key="digital" value="ticket">
                        Ticket
                      </Select.Option>
                      <Select.Option key="physical" value="nft-ticket" disabled={true}>
                        NFT Ticket
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className='form-access-wrapper' style={{width: '100%'}}>
                  <p className="create-post-subheading">Event name</p>
                  <Form.Item
                    name="name"
                    rules={[{ required: true, message: 'Please input name of the event!' }]}
                  >
                    <Input style={{
                      width: '100%',
                      border: '1px solid #303030',
                      background: '#161616',
                      borderRadius: '7px',
                      height: '40px',
                      textAlign: 'left'
                    }}/>
                  </Form.Item>
                </div>
                <div className='upload-track-text-wrapper'>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <p className="create-post-subheading">Event description</p>
                  <Form.Item name="description">
                    <Input.TextArea  style={{ width: '100%', marginLeft: '0.1rem' }} rows={3} />
                  </Form.Item>
                  </div>
                </div>
              </div>


              </div>

              <div className={stage === 1 ? 'display-contents' : 'no-display'}>
                <div className='form-top-wrapper' style={{width: '100%'}}>
                    <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 0 })}
                    >
                      {/* <PlusIcon />
                      {' '} */}
                      Back
                    </Button>
                  </div>
                  <h1 className='upload-header'>Create event</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10 }}
                      onClick={()=> this.setState({stage: 2})}
                    >
                      Continue
                    </Button>
                  </div>
                </div>

                <div className='form-middle-wrapper' style={{width: '100%', borderBottom: 'none', minHeight: '42rem', display: 'flex', justifyContent: 'center'}}>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                    <div  className='form-upload-wrapper'>
                      <Form.Item
                        className="upload-bl-track-form"
                        style={{padding: '10px 25px', margin: '10px 20px', borderRadius: '9px !important'}}
                      >
                        <Upload
                          accept="image/*"
                          listType="picture-card"
                          className="avatar-uploader"
                          multiple={false}
                          showUploadList={false}
                          disabled={uploading}
                          beforeUpload={this.beforeUploadThumb.bind(this)}
                          customRequest={() => false}
                        >
                          <div>
                            <img src="/static/add-photo.png" className='upload-photos-img' width={70} style={{width: '70px'}}/>
                            <span className='span-upload-msg'>Upload a cover photo</span>
                            <br />
                            <span className='span-upload-sub-msg'>File should be less than 1GB</span>
                            {previewImageTicket &&
                              <div className='uploaded-tag' >
                                <BsCheckCircleFill/>
                                <span>Uploaded</span>
                              </div>
                            }
                          </div>
                        </Upload>
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>



              <div className={stage === 2 ? 'display-contents' : 'no-display'}>
                <div className='form-top-wrapper' style={{width: '100%'}}>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 1 })}
                    >
                      Back
                    </Button>
                  </div>
                  <h1 className='upload-header'>Create event</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      // htmlType="submit"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 3 })}
                    >
                      Continue
                    </Button>
                  </div>
                </div>

                <div className='form-middle-wrapper' style={{width: '100%', borderBottom: 'none', minHeight: '42rem'}}>
                  <Places location={this.handleLocation} address={this.handleAddress} ticket={ticket}/>

                  <div className='form-access-wrapper' style={{ marginTop: '0.5rem' }}>
                      <p className="create-post-subheading">Event date</p>

                  <Form.Item

                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        message: 'Select the date of the event'
                      }
                    ]}
                  >


                        <DatePicker
                          style={{ width: '100%', background: '#141414' }}
                          disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                          placeholder={this.getCurrentDate()}
                          onChange={(val) => this.onChangeDate(val)}
                          className='upload-date-picker'
                          defaultValue={ticket && dayjs(ticket.date)}


                        />

                  </Form.Item>
                  </div>
                  <div style={{display: 'flex', flexDirection: 'row', padding: '5px'}}>
                    <div className='form-access-wrapper' style={{width: '100%'}}>
                    <p className="create-post-subheading">Add a start time</p>
                      <Form.Item >
                        <TimePicker className='time-picker-ticker' onChange={this.onChangeStartTime.bind(this)} format='HH:mm' defaultValue={ticket ? dayjs(ticket.start, 'HH:mm') : dayjs('00:00:00', 'HH:mm')} />
                      </Form.Item>
                    </div>

                    <div className='form-access-wrapper' style={{width: '100%'}}>
                    <p className="create-post-subheading">Add an end time </p>
                      <Form.Item>
                        <TimePicker className='time-picker-ticker' onChange={this.onChangeFinishTime.bind(this)} format='HH:mm' defaultValue={ticket ? dayjs(ticket.end, 'HH:mm') : dayjs('00:00:00', 'HH:mm')} />
                      </Form.Item>
                    </div>
                  </div>
                </div>
              </div>


                <div className={stage === 3 ? 'display-contents' : 'no-display'}>
                  <div className='form-top-wrapper' style={{width: '100%'}}>
                    <div className="new-post-create-btn-wrapper">
                      <Button
                        className="new-post-create-btn"
                        loading={uploading}
                        disabled={uploading}
                        style={{ marginRight: 10, marginTop: 3 }}
                        onClick={() => this.setState({ stage: 2 })}
                      >
                        {/* <PlusIcon />
                        {' '} */}
                        Back
                      </Button>
                    </div>
                    <h1 className='upload-header'>Create event</h1>
                    <div className="new-post-create-btn-wrapper">
                      <Button
                        className="new-post-create-btn"
                        // htmlType="submit"
                        loading={uploading}
                        disabled={uploading}
                        style={{ marginRight: 10, marginTop: 3 }}
                        onClick={() => this.setState({ stage: 4 })}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                  <div className='form-middle-wrapper' style={{width: '100%', borderBottom: 'none', minHeight: '42rem'}}>
                  <div className='form-access-wrapper' style={{width: '100%', padding: '5px'}}>
                  <p className="create-post-subheading">Tiers</p>
                  <p className="create-post-info">Add tiered ticket releases for this event </p>
                    <Form.Item name="time">
                    {tiers.length > 0 && (
                        <div className='added-tiers-container'>
                          {tiers.map((item, index) => (
                            <div className='added-tiers-wrapper'>
                              <div className='tiers-tier' key={index}>
                                <span className='t-name'>{item.name}</span>
                                <span className='t-totalSupply'>{item.supply}</span>
                                <span className='t-price'>${item.price}</span>
                              </div>

                              <div className='remove-tier-icon-wrapper'>
                                <FontAwesomeIcon
                                  icon={faTrash}
                                  className='remove-tier-icon'
                                  onClick={()=> this.setState({ tiers: tiers.filter(function(tier){
                                      return tier.name !== item.name
                                    })
                                  })}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className='tier-form-wrapper'>
                        <input
                          className='tier-name'
                          type="text"
                          name="name"
                          placeholder="Tier name (e.g. First release)"
                          value={this.state.tierName}
                          onChange={(e) => this.setState({tierName: e.target.value})}
                        />

                        <InputNumber type="number" placeholder='0' min={1} onChange={(e) => this.setState({tierSupply: e})} className='input-supply-tier'/>
                        <InputNumber type="number" prefix="$" placeholder='0.00' onChange={(e) => this.setState({tierPrice: e})} className='input-price-tier'/>

                      </div>
                      <Button className='add-tier-btn' onClick={this.addItem}>Add tier</Button>
                    </Form.Item>
                  </div>
                </div>
                </div>

                <div className={stage === 4 ? 'display-contents' : 'no-display'}>
              <div className='form-top-wrapper' style={{width: '100%'}}>
              <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 3 })}
                    >
                      {/* <PlusIcon />
                      {' '} */}
                      Back
                    </Button>
                  </div>
                  <h1 className='upload-header'>Create event</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      htmlType="submit"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10 }}
                      // onClick={()=> this.setState({stage: 3})}
                    >
                      Upload
                    </Button>
                  </div>
                </div>
                <div className='form-middle-wrapper' style={{width: '100%', borderBottom: 'none', minHeight: '42rem', display: 'flex', justifyContent:'center'}}>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <div  className='form-upload-wrapper'>
                    <Form.Item
                      className="upload-bl-track-form"
                      style={{padding: '10px 25px', margin: '10px 20px', borderRadius: '9px !important'}}
                    >
                      <Upload
                        listType="picture-card"
                        className="avatar-uploader"
                        multiple={false}
                        showUploadList={false}
                        disabled={uploading}
                        beforeUpload={this.beforeUploadDigitalFile.bind(this)}
                        customRequest={() => false}
                      >
                        <div>
                          <img src="/static/add-file.png" className='upload-photos-img' width={70} style={{width: '84px'}}/>
                          <span className='span-upload-msg'>Upload a ticket file</span>
                          <br />
                          <span className='span-upload-sub-msg'>This file will be sent to attendees to show at the door</span>
                          <br />
                          {digitalFileAdded &&
                            <div className='uploaded-tag' >
                              <BsCheckCircleFill/>
                              <span>Uploaded</span>
                            </div>
                          }
                        </div>
                      </Upload>

                    </Form.Item>
                    </div>
                  </div>

                  {/* <div className='form-option-wrapper' style={{ marginTop: '0.5rem', marginBottom: '1rem', padding: '6px'}}>
                    <div>
                      <p className="create-post-subheading">Active</p>
                      <p className="create-post-info">Set whether this post is visible or not</p>
                    </div>
                    <Form.Item
                      name="active"
                      rules={[{ required: true, message: 'Please select status!' }]}
                    >
                      <Switch
                          checkedChildren=""
                          unCheckedChildren=""
                          checked={active}
                          style={{marginTop: '1rem'}}
                          onChange={(val) => this.setState({active: val})}
                          className={`${active ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                        />
                    </Form.Item>
                  </div> */}

                </div>
              </div>
            </Row>

            {uploadPercentage > 0 ? (
              <Progress percent={Math.round(uploadPercentage)} />
            ) : null}
          </Form>
        </div>
      </div>
    );
  }
}
