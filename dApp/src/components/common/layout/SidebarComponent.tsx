'use client'

import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from '@components/common/catalyst/dropdown'
import { Navbar, NavbarItem, NavbarSection, NavbarSpacer } from '@components/common/catalyst/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@components/common/catalyst/sidebar'
import { SidebarLayout } from '@components/common/catalyst/sidebar-layout'
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserCircleIcon,
} from '@heroicons/react/16/solid'
import {
  Cog6ToothIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
  UserIcon,
} from '@heroicons/react/20/solid'
import { usePathname } from 'next/navigation'
import Link from 'next/link';
import { Image, Avatar } from 'antd';
import { IUser } from '@interfaces/user'
import NavMenu from './nav-menu';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AdjustmentsHorizontalIcon, WalletIcon } from '@heroicons/react/24/solid'
import { Clapperboard, CircleDollarSign, ChartColumn, Settings, User, CircleHelp, BadgeInfo, UserPen, Users } from 'lucide-react';

function AccountDropdownMenu({ anchor }: { anchor: 'top start' | 'bottom end' }) {
  const [state, setState] = useState({
    openSignUpModal: false,
    openLogInModal: false,
    openEmailSignUpModal: false,
    openNavMenuModal: false,
  });

  const myRef = useRef(null);

  const handleOpenModal = useCallback((isOpen, modal) => {
    if (modal === 'email') {
      setState((prevState) => ({
        ...prevState,
        openSignUpModal: isOpen,
        openLogInModal: isOpen,
        openEmailSignUpModal: true,
      }));
    } else if (modal === 'exit') {
      setState((prevState) => ({
        ...prevState,
        openSignUpModal: isOpen,
        openLogInModal: isOpen,
        openEmailSignUpModal: isOpen,
      }));
    } else {
      setState((prevState) => ({
        ...prevState,
        openSignUpModal: isOpen,
        openEmailSignUpModal: isOpen,
        openLogInModal: true,
      }));
    }
  }, []);

  const handleCloseMenu = useCallback((val) => {
    setState((prevState) => ({
      ...prevState,
      openNavMenuModal: val,
    }));
  }, []);

  useEffect(() => {
    if (!myRef.current) {
      myRef.current = {}; 
    }
  }, []);
  
  return (
    <DropdownMenu className="min-w-500" anchor={anchor}>
      <NavMenu ref={myRef} onFinish={handleOpenModal} onClose={handleCloseMenu}/>
    </DropdownMenu>
  )
}

export function SidebarComponent({
  children,
  user
}: {
  children: React.ReactNode,
  user: IUser
}) {
  let pathname = usePathname();

  //console.log(pathname)

  return (
    <SidebarLayout
      navbar={
        <>
        </>
      }
      user={user}
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Link href={'/'} className='my-auto relative  flex cursor-pointer z-[10]'>
              <Image alt="logo" preview={false} width="120px" className='' src="/static/trax_primary_logotype.svg" />
            </Link>
          </SidebarHeader>

          <SidebarBody className="sidebar-body">
            <SidebarSection>
              <SidebarItem href={`/artist/profile/?id=${user?.username || user?._id}`} current={pathname.startsWith(`/artist/profile/`)}>
                <User data-slot="icon"/>
                <SidebarLabel>My page</SidebarLabel>
              </SidebarItem>
              {/* <SidebarItem href={`/artist/profile-editor`} current={pathname.startsWith('/artist/profile-editor')}>
                <UserPen data-slot="icon"/>
                <SidebarLabel>Profile editor</SidebarLabel>
              </SidebarItem> */}
              <SidebarItem href="/artist/studio" current={pathname.startsWith('/artist/studio')}>
                <Clapperboard data-slot="icon"/>
                <SidebarLabel>Studio</SidebarLabel>
              </SidebarItem>
              <SidebarItem 
              href="/account/earnings" 
              current={pathname === '/account/earnings' || pathname.startsWith('/account/earnings/')}
              >
                <CircleDollarSign data-slot="icon"/>
                <SidebarLabel>Earnings</SidebarLabel>
              </SidebarItem>
              <SidebarItem 
              href="/account/referals" 
              current={pathname === '/account/referals' || pathname.startsWith('/account/referals/')}
              >
                <Users data-slot="icon"/>
                <SidebarLabel>Referals</SidebarLabel>
              </SidebarItem>
              <SidebarItem href={`/artist/analytics`} current={pathname.startsWith(`/artist/analytics`)}>
                <ChartColumn data-slot="icon"/>
                <SidebarLabel>Analytics</SidebarLabel>
              </SidebarItem>
              <SidebarItem 
              href={`/account`} 
              current={pathname === '/account' || (pathname.startsWith(`/account/`) && !pathname.startsWith('/account/earnings/') && !pathname.startsWith('/account/referals/'))}
              >
                <Settings data-slot="icon"/>
                <SidebarLabel>Settings</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSpacer />

            <SidebarSection>
              <SidebarItem href="https://info.trax.so/">
                <CircleHelp data-slot="icon" />
                <SidebarLabel>Support</SidebarLabel>
              </SidebarItem>
              <SidebarItem href="https://info.trax.so/updates">
                <BadgeInfo data-slot="icon"/>
                <SidebarLabel>Updates</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>

          <SidebarFooter className="max-lg:hidden">
            <Dropdown>
              <DropdownButton>
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar className='z-[40]' style={{minWidth: '45px', minHeight: '45px'}} src={user?.avatar || '/static/no-avatar.png'} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm/5 font-regular text-trax-zinc-950 dark:text-trax-white">{user?.name}</span>
                    <span className="block truncate text-xs/5 font-light text-trax-zinc-500 dark:text-trax-zinc-400">
                      @{user?.username}
                    </span>
                  </span>
                </span>
                <ChevronUpIcon />
              </DropdownButton>
              <AccountDropdownMenu anchor="top start" />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      {children}
    </SidebarLayout>
  )
}
