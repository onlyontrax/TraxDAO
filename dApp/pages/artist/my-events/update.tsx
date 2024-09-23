import { connect } from 'react-redux';
import { PureComponent } from 'react';
import Head from 'next/head';
import { message, Spin, Layout } from 'antd';
import { ShopOutlined } from '@ant-design/icons';
import PageHeading from '@components/common/page-heading';
import { ticketService } from '@services/ticket.service';
import { ITicket, IUIConfig } from 'src/interfaces';
import { FormTicket } from '@components/ticket/form-ticket';
import Router from 'next/router';
import { getResponseError } from '@lib/utils';

interface IProps {
  ui: IUIConfig;
}

interface IFiles {
  fieldname: string;
  file: File;
}

class TicketUpdate extends PureComponent<IProps> {
  static authenticate = true;

  static onlyPerformer = true;

  state = {
    id: '',
    submiting: false,
    fetching: true,
    ticket: {} as ITicket,
    uploadPercentage: 0
  };

  _files: {
    image: File;
    digitalFile: File;
  } = {
    image: null,
    digitalFile: null
  };

  async componentDidMount() {
    // const { id } = this.state;
    // if (!id) {
      const data = await this.getData();
      this.setState({ ticket: data.ticket });
    // } else {
    //   try {
    //     // console.log(id)
    //     // const resp = await ticketService.findById(id);
    //     // this.setState({ ticket: resp.data });
    //   } catch (e) {
    //     const err = await Promise.resolve(e);
    //     message.error(getResponseError(err) || 'Ticket not found!');
    //     Router.back();
    //   } finally {
    //     this.setState({ fetching: false });
    //   }
    // }
  }

  async getData() {
    try {
      const url = new URL(window.location.href);
      const id = url.searchParams.get('id');
      this.setState({id});
      const resp = await ticketService.findById(id);

      return {
        ticket: resp?.data
      };
    } catch (e) {
      message.error('Ticket not found!');
      return {
        ticket: null
      };
    }finally{
      this.setState({ fetching: false });
    }
  }

  onUploading(resp: any) {
    if (this._files.image || this._files.digitalFile) {
      this.setState({ uploadPercentage: resp.percentage });
    }
  }

  beforeUpload(file: File, field: string) {
    this._files[field] = file;
  }

  async submit(data: any) {
    try {
      const { id } = this.state;
      const files = Object.keys(this._files).reduce((tmpFiles, key) => {
        if (this._files[key]) {
          tmpFiles.push({
            fieldname: key,
            file: this._files[key] || null
          });
        }
        return tmpFiles;
      }, [] as IFiles[]) as [IFiles];

      data.tiers = JSON.stringify([...[], ...data.tiers]);

      this.setState({ submiting: true });

      const submitData = {
        ...data
      };
      await ticketService.update(
        id,
        files,
        submitData,
        this.onUploading.bind(this)
      );
      message.success('Changes saved.');
      this.setState({ submiting: false }, () => Router.push('/artist/studio'));
    } catch (e) {
      // TODO - check and show error here
      message.error(
        getResponseError(e) || 'Something went wrong, please try again!'
      );
      this.setState({ submiting: false });
    }
  }

  render() {
    const {
      ticket, submiting, fetching, uploadPercentage
    } = this.state;
    const { ui } = this.props;
    return (
      <Layout>
        <Head>
          <title>{`${ui?.siteName} | Edit Ticket`}</title>
        </Head>
        <div className="main-container">
          {/* <PageHeading title="Edit Ticket" icon={<ShopOutlined />} /> */}
          {!fetching && ticket && (
            <FormTicket
              ticket={ticket}
              submit={this.submit.bind(this)}
              uploading={submiting}
              beforeUpload={this.beforeUpload.bind(this)}
              uploadPercentage={uploadPercentage}
            />
          )}
          {fetching && <div className="text-center"><Spin /></div>}
        </div>
      </Layout>
    );
  }
}

const mapStates = (state: any) => ({
  ui: state.ui
});
export default connect(mapStates)(TicketUpdate);
