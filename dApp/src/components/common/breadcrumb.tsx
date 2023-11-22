import { PureComponent } from 'react';
import { Breadcrumb } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import Link from 'next/link';

interface IBreadcrum {
  title: string;
  href?: string;
}

interface IProps {
  breadcrumbs: IBreadcrum[];
}

export class BreadcrumbComponent extends PureComponent<IProps> {
  render() {
    const { breadcrumbs } = this.props;
    return (
      <div style={{ margin: '15px 0' }}>

        <Breadcrumb>

          <Breadcrumb.Item href="/home">
            <HomeOutlined />
          </Breadcrumb.Item>
          {breadcrumbs
            && breadcrumbs.length > 0
            && breadcrumbs.map((b) => (

              <Breadcrumb.Item key={b.title}>
                {b.href ? (
                  <Link href={b.href}>
                    {b.title}
                  </Link>
                ) : (
                  b.title
                )}
              </Breadcrumb.Item>
            ))}
        </Breadcrumb>
      </div>
    );
  }
}
