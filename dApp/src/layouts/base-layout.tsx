import { PureComponent } from 'react';
import { blockService } from '@services/index';
import BlankLayout from './blank-layout';
import PrimaryLayout from './primary-layout';
import MaintenaceLayout from './maintenance-layout';
import GEOLayout from './geoBlocked-layout';
import PublicLayout from './public-layout';
import { IUser} from 'src/interfaces';
import { SidebarComponent } from '@components/common/layout/SidebarComponent';
import { connect } from 'react-redux';

interface DefaultProps {
  children: any;
  layout: string;
  maintenance: boolean;
  user: IUser;
}

const LayoutMap = {
  geoBlock: GEOLayout,
  maintenance: MaintenaceLayout,
  primary: PrimaryLayout,
  public: PublicLayout,
  blank: BlankLayout
};

class BaseLayout extends PureComponent<DefaultProps> {
  state = {
    geoBlocked: false
  }

  componentDidMount() {
    process.env.NODE_ENV === 'production' && document.addEventListener('contextmenu', (event) => event.preventDefault());
    this.clientCheckBlockByIp();
  }

  componentWillUnmount() {
    process.env.NODE_ENV === 'production' && document.removeEventListener('contextmenu', (event) => event.preventDefault());
  }

  async clientCheckBlockByIp() {
    const checkBlock = await blockService.checkCountryBlock();
    if (checkBlock?.data?.blocked) {
      this.setState({ geoBlocked: true });
    }
  }

  render() {
    const {
      children, layout, maintenance = false, user
    } = this.props;
    const { geoBlocked } = this.state;
    // eslint-disable-next-line no-nested-ternary
    const Container = maintenance ? LayoutMap.maintenance : geoBlocked ? LayoutMap.geoBlock : layout && LayoutMap[layout] ? LayoutMap[layout] : LayoutMap.primary;

    // Check if the layout is PrimaryLayout
    const isPrimaryLayout = Container === LayoutMap.primary;
    const activeSubaccount = user.account?.activeSubaccount || 'user';
    const isPerformer = activeSubaccount === 'performer';

    if (isPrimaryLayout && isPerformer) {
      return (
          <SidebarComponent user={user}>
            <Container>{children}</Container>
          </SidebarComponent>
      );
    }

    return <Container>{children}</Container>;
  }
}

const mapStateToProps = (state: any) => ({
  user: state.user.current
});

export default connect(mapStateToProps)(BaseLayout)
