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
  Switch
} from 'antd';
import Router from 'next/router';
import { IProduct } from 'src/interfaces';
import { FileAddOutlined, CameraOutlined } from '@ant-design/icons';
import { FormInstance } from 'antd/lib/form';
import {BsCheckCircleFill} from 'react-icons/bs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faBullhorn, faImage, faVideo, faSquarePollHorizontal } from '@fortawesome/free-solid-svg-icons'
interface IProps {
  product?: IProduct;
  submit?: Function;
  beforeUpload?: Function;
  uploading?: boolean;
  uploadPercentage?: number;
}

const layout = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
};

const validateMessages = {
  required: 'This field is required!'
};

export class FormProduct extends PureComponent<IProps> {
  state = {
    previewImageProduct: null,
    isDigitalProduct: false,
    digitalFileAdded: false,
    shippingOption: 'standard',
    shippingFees: { standard: 0 },
    stage: 0,
    active: true
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

  render() {
    if (!this.formRef) this.formRef = createRef();
    const {
      product, submit, uploading, uploadPercentage
    } = this.props;
    const {
      previewImageProduct, isDigitalProduct, active, digitalFileAdded, stage
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
            onFinish={(data) => { 
              submit.bind(this)({ ...data, ...this.encodeToBody(shippingFees) })} }
            onFinishFailed={() => message.error('Please complete the required fields')}
            name="form-upload"
            ref={this.formRef}
            validateMessages={validateMessages}
            initialValues={
              product || ({
                name: '',
                price: '',
                description: '',
                active: true,
                performerId: '',
                stock: 1,
                type: 'physical'
              })
            }
            className="product-form"
            scrollToFirstError
            style={{ width: '100%'}}
          >
            <Row>
              <div className={stage === 1 ? 'no-display' : 'display-contents'}>
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
                  <h1 className='upload-header'>List new product</h1>
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
                <div className='form-middle-wrapper' style={{width: '100%'}}>
                <div className='form-access-wrapper' style={{width: '100%'}}>
                  <p className="create-post-subheading">Type of product</p>
                  <Form.Item
                    name="type"
                    rules={[{ required: true, message: 'Please select type!' }]}
                  >
                    <Select className='track-type-form' onChange={(val) => this.setFormVal('type', val)}>
                      <Select.Option key="physical" value="physical">
                        Physical
                      </Select.Option>
                      <Select.Option key="digital" value="digital">
                        Digital
                      </Select.Option>
                    </Select>
                  </Form.Item>
                </div>
                <div className='form-access-wrapper' style={{width: '100%'}}>
                <p className="create-post-subheading">Product name</p>
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input name of product!' }]}
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
              </div>
              <div className='form-middle-wrapper' style={{width: '100%', borderBottom: 'none'}}>
                
                <div className='form-access-wrapper' style={{width: '100%'}}>
                <div  className='form-upload-wrapper'>
                <Form.Item
                  label=""
                  className="upload-bl"
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
                    <div >
                      <img src="/static/add-photo.png" className='upload-photos-img' width={70} style={{width: '70px'}}/> 
                      <span className='span-upload-msg'>Upload a photo</span>
                      <br />
                        <span className='span-upload-sub-msg'> File should be 1GB or less</span>
                        </div>
                  </Upload>
                </Form.Item>
                </div></div>
                {isDigitalProduct && (
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <div  className='form-upload-wrapper'>
                    <Form.Item
                    className="upload-bl"
                    style={{padding: '10px 25px', margin: '10px 20px', borderRadius: '9px !important'}}>
                      <Upload
                        listType="picture-card"
                        className="avatar-uploader"
                        multiple={false}
                        showUploadList={false}
                        disabled={uploading}
                        beforeUpload={this.beforeUploadDigitalFile.bind(this)}
                        customRequest={() => false}
                      >
                        <div >
                      <img src="/static/add-file.png" className='upload-photos-img' width={70} style={{width: '84px'}}/> 
                      <span className='span-upload-msg'>Upload a digital</span>
                      <br />
                        <span className='span-upload-sub-msg'> File should be 1GB or less</span>
                        <br />
                        {digitalFileAdded && 
                          <div style={{fontSize: 17, marginTop:7, color: '#c8fd01'}}>
                          <BsCheckCircleFill style={{fontSize: 17, marginTop:7, color: '#c8fd01'}}/>
                          <span>Uploaded</span>
                          </div>}
                        </div>
                      </Upload>
                      {product?.digitalFileUrl && <div className="ant-form-item-explain" style={{ textAlign: 'left' }}><a download target="_blank" href={product?.digitalFileUrl} rel="noreferrer">Click to download</a></div>}
                    </Form.Item>
                    </div>
                    </div>
                )}
              </div>
              </div>
                <div className={stage === 0 ? 'no-display' : 'display-contents'}>
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
                  <h1 className='upload-header'>List new product</h1>
                  <div className="new-post-create-btn-wrapper">
                    <Button
                      className="new-post-create-btn"
                      htmlType="submit"
                      loading={uploading}
                      disabled={uploading}
                      style={{ marginRight: 10, marginTop: 3 }}
                      onClick={() => this.setState({ stage: 2 })}
                    >
                      {haveProduct ? 'Update' : 'Upload'}
                    </Button>
                  </div>
                </div>
                <div className='form-middle-wrapper' style={{width: '100%'}}>
              <div className='upload-track-text-wrapper'>
                  <div className='form-access-wrapper' style={{width: '100%'}}>
                  <p className="create-post-subheading">Product information</p>
                  <Form.Item name="description">
                    <Input.TextArea style={{ width: '100%', marginLeft: '0.1rem' }} rows={3} />
                  </Form.Item>
                  </div>
                  </div>
                <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
                <p className="create-post-subheading">Price</p>
                    <Form.Item
                      name="price"
                      rules={[{ required: true, message: 'Price is required!' }]}
                    >
                      <InputNumber type="number" prefix="$" placeholder='0.00' className='input-create-track'/>
                    </Form.Item>
                  </div>
              <div className='form-access-wrapper' style={{width: '100%', marginTop: '0.5rem'}}>
              <p className="create-post-subheading">Stock</p>
                <Form.Item name="stock" rules={[{ required: true, message: 'Stock is required!' }]}>
                  <InputNumber style={{
                    width: '100%',
                    border: '1px solid #303030',
                    borderRadius: '7px',
                    height: '40px',
                    textAlign: 'left'}}
                     min={1} />
                </Form.Item>
                </div>
                </div>
                <div className='form-middle-wrapper' style={{width: '100%', borderBottom: 'none'}}>
              <div className='form-option-wrapper' style={{ marginTop: '0.5rem', marginBottom: '1rem'}}>
                <div>
                <p className="create-post-subheading">Active</p>
                      <p className="create-post-info">
                       Set whether this post is visible or not
                      </p>
                </div>
                <Form.Item name="status">
                    <Switch
                      checkedChildren=""
                      unCheckedChildren=""
                      checked={active}
                      style={{marginTop: '1rem'}}
                      onChange={(val) => this.setState({active: val})}
                      className={`${active ? 'switch-toggle-on' : 'switch-toggle-off'}`}
                    />
                </Form.Item>
                </div>
              <div style={{display: 'flex', justifyContent: 'space-between'}}>

              {!isDigitalProduct && (
                [
                  <div style={{width: '50%'}}>
                    <div className='form-access-wrapper' style={{width: '100%', marginBottom: '1rem'}}>
                    <p className="create-post-subheading">Shipping</p>
                      <p className="create-post-info">
                       Select your preferred shipping option
                      </p>
                    <Form.Item
                    >
                      <Select className='track-type-form' value={shippingOption} onChange={(val) => this.setState({ shippingOption: val })}>
                        <Select.Option key="standard" value="standard">
                          Standard
                        </Select.Option>
                        <Select.Option key="fast" value="fast">
                          Fast Track
                        </Select.Option>
                        <Select.Option key="international" value="international">
                          International
                        </Select.Option>
                        <Select.Option key="domestic" value="domestic">
                          Domestic
                        </Select.Option>
                      </Select>
                    </Form.Item>
                    </div>
                  </div>,
                  <div style={{width: '50%'}}>
                  <div className='form-access-wrapper' style={{width: '100%', marginBottom: '1rem'}}>
                  <p className="create-post-subheading">Fee</p>
                      <p className="create-post-info">
                       Input the shipping price
                      </p>
                    <Form.Item
                    >
                      <InputNumber style={{
                    border: '1px solid #303030',
                    borderRadius: '7px',
                    height: '40px',
                    textAlign: 'left'}} value={shippingFees[shippingOption]} onChange={(val) => this.onFeeChange(val)} min={1} />
                    </Form.Item>
                    </div>
                  </div>
                  ])}
                  </div>
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
