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
  TimePicker
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { IProduct } from 'src/interfaces';
import { FileAddOutlined, CameraOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import {BsCheckCircleFill} from 'react-icons/bs';
import moment from 'moment';
interface IProps {
  product?: IProduct;
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
    previewImageProduct: null,
    isDigitalProduct: false,
    digitalFileAdded: false,
    shippingOption: 'standard',
    shippingFees: { standard: 0 },
    stage: 0,
    tiers: [],
    tierName: "",
    tierTotalSupply: "",
    tierPrice: "",
    eventDate: moment(),
  };

  formRef: any;

  componentDidMount() {
    if (!this.formRef) this.formRef = createRef();
    const { product } = this.props;
    if (product) {
      const shippingFees = {};
      for (const fee of product.shippingFees) {
        shippingFees[fee.type] = fee.fee;
      }
      this.setState({
        isDigitalProduct: product.type === 'digital',
        previewImageProduct: product?.image || '/static/no-image.jpg',
        digitalFileAdded: !!product.digitalFileUrl,
        shippingOption: 'standard',
        shippingFees
      });
    }
  }

  setFormVal(field: string, val: any) {
    const instance = this.formRef.current as FormInstance;
    instance.setFieldsValue({
      [field]: val
    });
    if (field === 'type') {
      this.setState({ isDigitalProduct: val === 'digital' });
    }
  }

  onFeeChange(val: number) {
    const { shippingOption, shippingFees } = this.state;
    const update = {};
    update[shippingOption] = val;
    this.setState({
      shippingFees: {
        ...shippingFees,
        ...update
      }
    });
  }

  beforeUploadThumb(file) {
    const { beforeUpload } = this.props;
    const reader = new FileReader();
    reader.addEventListener('load', () => this.setState({ previewImageProduct: reader.result }));
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

  encodeToBody(fees) {
    const result = {};
    for (let i = 0; i < Object.keys(fees).length; i += 1) {
      result[`shippingFees[${i}][type]`] = Object.keys(fees)[i];
      result[`shippingFees[${i}][fee]`] = fees[Object.keys(fees)[i]];
    }
    return result;
  }

  getCurrentDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const year = currentDate.getFullYear();
  
    return `${year}-${month}-${day}`;
  }

  addItem = () => {
    const { tierName, tierTotalSupply, tierPrice, tiers } = this.state;
    if(tierName && tierTotalSupply && tierPrice){
      let newTier = {
        name: tierName,
        totalSupply: tierTotalSupply,
        price: tierPrice
      }
  
      this.setState({
        tiers: [...tiers, newTier], 
        tierName: '', 
        tierTotalSupply: '', 
        tierPrice: ''
      });
    }else{
      message.info("You must fill in all fields!");
    }
  };

  onChangeStartTime = (time: Dayjs, timeString: string) => {
  };

  onChangeFinishTime = (time: Dayjs, timeString: string) => {
  };

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      product, submit, uploading, uploadPercentage
    } = this.props;
    const {
      previewImageProduct, isDigitalProduct, digitalFileAdded, stage, tiers
    } = this.state;
    const haveProduct = !!product;
    const { shippingFees, shippingOption } = this.state;
    return (
      <div className='create-product-container'>
        <div className='create-product-preview-wrapper'>
          <div className='create-product-preview' style={{backgroundImage: previewImageProduct ? `url('${previewImageProduct}')`: ""}}>
            <div className='create-product-blur'>
            {!previewImageProduct && (
                <div className='preview-msg'>
                    <span >Preview</span>
                </div>
            )}
            </div>

            {previewImageProduct && (
              <img 
                src={previewImageProduct}
                alt="file"
                className='create-product-img'
              />
            )}
          </div>
        </div>
        <div className='create-product-form-wrapper'>
          <Form
            {...layout}
            onFinish={(data) => submit.bind(this)({ ...data, ...this.encodeToBody(shippingFees) })}
            onFinishFailed={() => message.error('Please complete the required fields')}
            name="form-upload"
            ref={this.formRef}
            validateMessages={validateMessages}
            initialValues={
              product || ({
                name: '',
                price: 1,
                description: '',
                status: 'active',
                performerId: '',
                stock: 1,
                type: 'Ticket'
              })
            }
            className="product-form"
            scrollToFirstError
            style={{ width: '100%'}}
          >
            <Row>
            {stage === 0 && (
              <>
              <Col md={24} xs={24}>
                <div className='form-access-wrapper' style={{width: '100%'}}>
                  <span className='form-access'>Type of product<span className="required-badge-upload">Required</span></span>
                  <Form.Item
                    name="type"
                    rules={[{ required: true, message: 'Please select type!' }]}
                  >
                    <Select style={{background: '#161616', borderRadius: '20px', border: '1px solid #303030'}} onChange={(val) => this.setFormVal('type', val)}>
                      <Select.Option key="digital" value="ticket">
                        Ticket
                      </Select.Option>
                      <Select.Option key="physical" value="nft-ticket" disabled={true}>
                        NFT Ticket
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
              </Col>
              <Col md={24} xs={24}>
                <div className='form-title'>
                <div className='form-access-wrapper' style={{width: '100%'}}>
                <span className='form-access'>Name of event<span className="required-badge-upload">Required</span></span>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input name of product!' }]}
                >
                  <Input />
                </Form.Item>
                </div>
                </div>
              </Col>
              <Col md={24} xs={24}>
                
                <div className='form-access-wrapper' style={{width: '100%'}}>
                <span  className='form-access'>Add a photo<span className="required-badge-upload">Required</span></span>
                <div  className='form-upload-wrapper'>
                  
                <Form.Item
                  label=""
                  className="upload-bl"
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
                    {previewImageProduct ? (
                      <BsCheckCircleFill />
                    ) : (
                        <CameraOutlined />
                    )}
                    
                  </Upload>
                </Form.Item>
                </div></div>
              </Col>
              <Col md={24} xs={24}>
                <div className='form-access-wrapper' style={{width: '100%'}}>
                <span  className='form-access'>Ticket file<span className="required-badge-upload">Required</span></span>
                <div  className='form-upload-wrapper'>
                  <Form.Item >
                    <Upload
                      listType="picture-card"
                      className="upload-bl"
                      multiple={false}
                      showUploadList={false}
                      disabled={uploading}
                      beforeUpload={this.beforeUploadDigitalFile.bind(this)}
                      customRequest={() => false}
                    >
                      {digitalFileAdded ? <BsCheckCircleFill /> : <FileAddOutlined />}
                      
                    </Upload>
                    {product?.digitalFileUrl && <div className="ant-form-item-explain" style={{ textAlign: 'left' }}><a download target="_blank" href={product?.digitalFileUrl} rel="noreferrer">Click to download</a></div>}
                  </Form.Item>
                  </div>
                  </div>
              </Col>
              <div className='create-prod-btn-wrapper'>
              <div className="submit-content-wrapper">
                <Button
                  className="submit-content-green"
                  onClick={()=> this.setState({stage: 1})}
                >
                  Continue
                </Button>
              </div>
              </div>
              </>
              )}
              {stage === 1 && (
                <>
              <Col span={24}>
                <div className='form-title'>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <span className='form-access'>Description<span className="optional-badge">Optional</span></span>
                  <Form.Item name="description">
                    <Input.TextArea  rows={3} />
                  </Form.Item>
                  </div>
                </div>
              </Col>

              <Col span={24}>
                <div className='form-title'>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <span className='form-access'>Location<span className="required-badge-upload">Required</span></span>
                  <Form.Item name="location">
                    <Input />
                  </Form.Item>
                  </div>
                </div>
              </Col>

              <Col span={24}>
                  <Form.Item
                    name="date"
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[
                      {
                        required: true,
                        message: 'Select the date of the event'
                      }
                    ]}
                  >
                    <div className='form-access-wrapper' style={{ marginTop: '0.5rem' }}>
                  <span className='form-access'>Date of event</span>
                  <Form.Item>
                    <DatePicker
                      style={{ width: '100%', background: '#141414' }}
                      disabledDate={(currentDate) => currentDate && currentDate < moment().endOf('day')}
                      placeholder={this.getCurrentDate()}
                      onChange={(val) => this.setState({ scheduledAt: val })}
                      className='upload-date-picker'
                    />
                  </Form.Item>
                  </div>
                  </Form.Item>
              </Col>

              <div style={{display: 'flex', flexDirection: 'row'}}>
                <Col span={24}>
                  <div className='form-title'>
                    <div className='form-access-wrapper' style={{width: '100%'}}>
                    <span className='form-access'>Start time<span className="required-badge-upload">Required</span></span>
                    <Form.Item name="start-time">
                      <TimePicker className='time-picker-ticker' onChange={this.onChangeStartTime.bind(this)} defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />
                    </Form.Item>
                    </div>
                  </div>
                </Col>

                <Col span={24}>
                  <div className='form-title'>
                    <div className='form-access-wrapper' style={{width: '100%'}}>
                    <span className='form-access'>End time<span className="required-badge-upload">Required</span></span>
                    <Form.Item name="end-time">
                      <TimePicker className='time-picker-ticker' onChange={this.onChangeFinishTime.bind(this)} defaultValue={dayjs('00:00:00', 'HH:mm:ss')} />
                    </Form.Item>
                    </div>
                  </div>
                </Col>
              </div>
              <Col span={24}>
                <div className='form-title'>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <span className='form-access'>Tiers<span className="required-badge-upload">Required</span></span>
                    <Form.Item name="time">
                    {tiers.length > 0 && (
                        <div className='added-tiers-wrapper'>
                          {tiers.map((item, index) => (
                            <div className='tiers-tier' key={index}>
                              <span className='t-name'>{item.name}</span>
                              <span className='t-totalSupply'>{item.totalSupply}</span>
                              <span className='t-price'>${item.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className='tier-form-wrapper'>
                        <input
                          className='tier-name'
                          type="text"
                          name="name"
                          placeholder="Tier name"
                          value={this.state.tierName}
                          onChange={(e) => this.setState({tierName: e.target.value})}
                        />
                        <input
                          className='tier-supply'
                          type="number"
                          name="totalSupply"
                          placeholder="Total supply"
                          value={this.state.tierTotalSupply}
                          onChange={(e) => this.setState({tierTotalSupply: e.target.value})}
                        />
                        <input
                          className='tier-price'
                          type="number"
                          name="price"
                          placeholder="Price"
                          value={this.state.tierPrice}
                          onChange={(e) => this.setState({tierPrice: e.target.value})}
                        />
                      </div>
                      <Button className='add-tier-btn' onClick={this.addItem}>Add tier</Button>
                    </Form.Item>
                  </div>
                </div>
              </Col>
              <Col md={!isDigitalProduct ? 24 : 12} xs={!isDigitalProduct ? 24 : 12}>
              <div className='form-access-wrapper' style={{width: '100%'}}>
                <span className='form-access'>Access<span className="required-badge-upload">Required</span></span>
                <Form.Item
                  name="status"
                  rules={[{ required: true, message: 'Please select status!' }]}
                >
                  <Select style={{background: '#161616', borderRadius: '20px', border: '1px solid #303030', width: '100%'}}>
                    <Select.Option key="active" value="active">
                      Active
                    </Select.Option>
                    <Select.Option key="inactive" value="inactive">
                      Inactive
                    </Select.Option>
                  </Select>
                </Form.Item>
                </div>
              </Col>
                  </>
                  )}
            </Row>

            {uploadPercentage > 0 ? (
              <Progress percent={Math.round(uploadPercentage)} />
            ) : null}

            {stage === 1 && (
              <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 4 }} >
                <div className='create-prod-btn-wrapper'>
                  <div className="submit-content-wrapper">
                    <Button
                      className="submit-content-green"
                      onClick={()=> this.setState({stage: 0})}
                    >
                      Back
                    </Button>
                  </div>
                  <div className="submit-content-wrapper">
                    <Button
                      className="submit-content-green"
                      htmlType="submit"
                      loading={uploading}
                      disabled={uploading}
                    >
                      {haveProduct ? 'Update' : 'Upload'}
                    </Button>
                  </div>
                </div>
              </Form.Item>
            )}
          </Form>
        </div>
      </div>
    );
  }
}
