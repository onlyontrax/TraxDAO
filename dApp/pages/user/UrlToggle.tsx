import { Switch, Select } from 'antd';
import Router from 'next/router';
import Link from 'next/link';
import {useEffect, useState} from 'react'

const {Option} = Select;

export default function UrlToggle (props) {

  const [page, setPage] = useState('/user/library');

  const {targetUrl, checked} = props

  


  useEffect(()=>{
    if(window.location.pathname === '/user/library/'){
      setPage('/user/library')
    }else{
      setPage('/user/purchased')
    }


  }, [])

  return (
    <>
    {/* <div className="tab-bar-studio">

<Link href="/user/library" className="tab-btn-studio-wrapper">
  <h1 className={`${window.location.pathname === '/user/library/' ? 'selected-studio-btn' : ''}`}>Saved</h1>
  <div className={`${window.location.pathname === '/user/library/' ? 'active' : ''} tab-btn-studio`} />
</Link>

<Link href="/user/purchased" className="tab-btn-studio-wrapper">
  <h1 className={`${window.location.pathname === '/user/purchased/' ? 'selected-studio-btn' : ''}`}>Purchased</h1>
  <div className={`${window.location.pathname === '/user/purchased/' ? 'active' : ''} tab-btn-studio`} />
</Link>
</div> */}

      <div className='url-toggle-wrapper flex justify-end mr-4'>
        
          <Select
            value={page}
            onChange={(e) => Router.push(e)}
            className='rounded-xl text-trax-lime-200'
          >
            <Option value="/user/library" key="saved" className="payment-type-option-content">
              <span>Bookmarked</span>
            </Option>
            <Option value="/user/purchased" key="purchased" className="payment-type-option-content">
              <span>Purchased</span>
            </Option>
          </Select>
        
      </div>
    </>
  )
}