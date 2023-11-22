/* eslint-disable no-nested-ternary */
import { EditOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import { ShippingAddressForm } from '@components/product/shipping-address-form';
import {
  Button, Descriptions, Divider, Layout, Modal, Select, Spin, Tag, message
} from 'antd';
import Head from 'next/head';
import Router from 'next/router';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import {
  IAddress, ICountry, IOrder, IUIConfig
} from 'src/interfaces';
import { orderService, shippingAddressService, utilsService } from 'src/services';

const { Item } = Descriptions;

interface IProps {
  id: string;
  ui: IUIConfig;
  countries: ICountry[];
}

interface IStates {
  order: IOrder;
  loading: boolean;
  addresses: IAddress[];
  onEditAddress: boolean;
  submiting: boolean;
  openAddAddressModal: boolean;
  id: string;
  countries: any;
}

class OrderDetailPage extends PureComponent<IProps, IStates> {
  static authenticate = true;

  async getData() {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    try {
      const [countries] = await Promise.all([utilsService.countriesList()]);
      return {
        countries: countries?.data || [],
        id
      };
    } catch (e) {
      return {
        countries: []
      };
    }
  }

  constructor(props: IProps) {
    super(props);
    this.state = {
      loading: false,
      order: null,
      addresses: [],
      onEditAddress: false,
      submiting: false,
      openAddAddressModal: false,
      id: '',
      countries: null
    };
  }

  async componentDidMount() {
    const { countries } = this.state;
    if (countries === null) {
      const data = await this.getData();

      this.setState({ countries: data.countries, id: data.id }, () => this.updateDataDependencies());
    } else {
      this.updateDataDependencies();
    }
  }

  updateDataDependencies() {
    this.getOrderData();
    this.getAddresses();
  }

  getOrderData = async () => {
    try {
      const { id } = this.state;
      await this.setState({ loading: true });
      const order = await orderService.findById(id);
      await this.setState({
        order: order?.data,
        loading: false
      });
    } catch (e) {
      message.error('Can not find order!');
      Router.back();
    }
  };

  downloadFile = async () => {
    const { order } = this.state;
    try {
      const resp = await orderService.getDownloadLinkDigital(order.productId);
      window.open(resp?.data?.downloadLink, '_blank');
    } catch {
      message.error('Error occured, please try again later');
    }
  };

  getAddresses = async () => {
    const resp = await shippingAddressService.search({ limit: 10 });
    this.setState({ addresses: resp?.data?.data || [] });
  };

  onUpdateDeliveryAddress = async (deliveryAddressId: string) => {
    const { order } = this.state;
    try {
      const resp = await orderService.updateDeliveryAddress(order._id, { deliveryAddressId });
      this.setState({
        onEditAddress: false,
        order: {
          ...order,
          deliveryAddressId: resp.data.deliveryAddressId,
          deliveryAddress: resp.data.deliveryAddress
        }
      });
      message.success('Updated delivery address successfully!');
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later!');
      this.setState({ onEditAddress: false });
    }
  };

  addNewAddress = async (payload: any) => {
    const { addresses, countries } = this.state;
    try {
      this.setState({ submiting: true });
      const country = countries.find((c) => c.code === payload.country);
      const data = { ...payload, country: country.name };
      const resp = await shippingAddressService.create(data);
      this.setState({
        submiting: false,
        openAddAddressModal: false,
        addresses: [...[resp.data], ...addresses]
      });
    } catch (e) {
      const err = await e;
      message.error(err?.message || 'Error occured, please try again later!');
      this.setState({ submiting: false, openAddAddressModal: false });
    }
  };

  render() {
    const { ui } = this.props;
    const {
      order, loading, addresses, onEditAddress, submiting, openAddAddressModal, countries
    } = this.state;

    if (countries === null) {
      return <div style={{ margin: 30, textAlign: 'center' }}><Spin /></div>;
    }
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | #${order?.orderNumber || ''}`}</title>
        </Head>
        <div className="main-container" style={{ padding: '1rem' }}>
          {!loading && order && (
            <div className="main-container">
              <PageHeading title={`#${order?.orderNumber}`} icon={<ShoppingCartOutlined />} />
              <Descriptions>
                <Item key="seller" label="Artist">
                  {order?.performerInfo?.name || order?.performerInfo?.username || 'N/A'}
                </Item>
                <Item key="name" label="Product">
                  {order?.productInfo?.name || 'N/A'}
                </Item>
                <Item key="description" label="Description">
                  {order?.productInfo?.description || 'N/A'}
                </Item>
                <Item key="unitPrice" label="Unit price">
                  $
                  {(order?.unitPrice || 0).toFixed(2)}
                </Item>
                <Item key="quantiy" label="Quantity">
                  {order?.quantity || '0'}
                </Item>
                <Item key="totalPrice" label="Total Price">
                  $
                  {(order?.totalPrice || 0).toFixed(2)}
                </Item>
              </Descriptions>
              {order?.productInfo?.type === 'digital' ? (
                order?.deliveryStatus === 'delivered' ? (
                  <div style={{ marginBottom: '10px' }}>
                    Download Link:
                    {' '}
                    <a aria-hidden onClick={this.downloadFile.bind(this)}>
                      Click to download
                    </a>
                  </div>
                ) : (
                  <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
                    Delivery Status:
                    {' '}
                    <Tag color="green">{order?.deliveryStatus || 'N/A'}</Tag>
                  </div>
                )
              ) : (
                <div>
                  <Divider>Delivery information</Divider>
                  <div style={{ marginBottom: '10px' }}>
                    Delivery Address:
                    {' '}
                    {!onEditAddress ? (
                      order?.deliveryAddress
                    ) : (
                      <Select
                        style={{ minWidth: 250 }}
                        defaultValue={order?.deliveryAddressId}
                        onChange={(id) => this.onUpdateDeliveryAddress(id)}
                      >
                        {addresses.map((a: IAddress) => (
                          <Select.Option value={a._id} key={a._id}>
                            <div style={{ position: 'relative', paddingRight: 30 }}>
                              {a.name}
                              {' '}
                              -
                              {' '}
                              <small>{`${a.streetNumber} ${a.streetAddress}, ${a.city}, ${a.state} (${a.zipCode}), ${a.country}`}</small>
                            </div>
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                    &nbsp;&nbsp;
                    {order?.deliveryStatus === 'processing'
                      && (!onEditAddress ? (
                        <a aria-hidden onClick={() => this.setState({ onEditAddress: true })}>
                          <EditOutlined />
                          {' '}
                          Change
                        </a>
                      ) : (
                        addresses.length < 10 && (
                          <a aria-hidden onClick={() => this.setState({ openAddAddressModal: true })}>
                            <PlusOutlined />
                            {' '}
                            Add New Address
                          </a>
                        )
                      ))}
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    Phone Number:
                    {order?.phoneNumber || 'N/A'}
                  </div>
                  <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
                    Shipping Code:
                    {' '}
                    <Tag color="blue">{order?.shippingCode || 'N/A'}</Tag>
                  </div>
                  <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
                    Shipping Option:
                    {' '}
                    <Tag color="blue">{order?.shippingOption || 'N/A'}</Tag>
                  </div>
                  <div style={{ marginBottom: '10px', textTransform: 'capitalize' }}>
                    Delivery Status:
                    {' '}
                    <Tag color="green">{order?.deliveryStatus || 'N/A'}</Tag>
                  </div>
                </div>
              )}
              <div style={{ marginBottom: '10px' }}>
                <Button danger onClick={() => Router.back()}>
                  Back
                </Button>
              </div>
            </div>
          )}
          {loading && (
            <div className="text-center" style={{ margin: 30 }}>
              <Spin />
            </div>
          )}
        </div>

        <Modal
          key="add-new-address"
          width={660}
          title={null}
          open={openAddAddressModal}
          onOk={() => this.setState({ openAddAddressModal: false })}
          footer={null}
          onCancel={() => this.setState({ openAddAddressModal: false })}
          destroyOnClose
          centered
        >
          <ShippingAddressForm
            onCancel={() => this.setState({ openAddAddressModal: false })}
            submiting={submiting}
            onFinish={this.addNewAddress}
            countries={countries}
          />
        </Modal>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});

export default connect(mapStates)(OrderDetailPage);
