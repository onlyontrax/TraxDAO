import Router from 'next/router';

interface Iprops {
  title: string;
  icon?: any
}

function PageHeading({ title, icon }: Iprops) {
  return (
    <div className="page-heading">
      <span aria-hidden onClick={() => Router.back()}>
        {icon
                                    || <p />}
        {' '}
        {title}
      </span>
    </div>
  );
}

PageHeading.defaultProps = {
  icon: null
};

export default PageHeading;
