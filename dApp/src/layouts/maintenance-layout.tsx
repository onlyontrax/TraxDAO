import Image from 'next/image';

function MaintenaceLayout() {
  return (
    <main role="main">
      <Image alt="" src="/static/under-construction.jpg" objectFit="cover" layout="fill" />
    </main>
  );
}

export default MaintenaceLayout;
