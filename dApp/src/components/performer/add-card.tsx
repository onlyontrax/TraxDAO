import React, { useEffect, useState } from 'react';
import TraxButton from '@components/common/TraxButton';
import NewCardPage from '../../../pages/user/cards/add-card';
import { PlusOutlined, CreditCardOutlined, MoreOutlined } from '@ant-design/icons';
import { userService, cryptoService, paymentService } from '@services/index';
import { ISettings, IUIConfig, IUser } from 'src/interfaces';
import { connect } from 'react-redux';
import { updateBalance } from '@redux/user/actions';
import { useRouter } from 'next/router';
import { useDispatch } from 'react-redux';

import { CreditCardIcon } from '@heroicons/react/24/outline';

import { updateCurrentUserAvatar, updatePassword, updateUser } from 'src/redux/user/actions';

import {
    Button, Col, Form, Input, Row, Select, Modal, Tabs, Switch, message, Image, Spin
  } from 'antd';
import { Trash2 } from 'lucide-react';


interface UserAccountFormIProps {
    settings: ISettings;
    user: IUser;
    updateBalance?: Function;
    initialAmount?: number;
    paymentOption?: string;
    onFinish?(cards:any, selectedCard: boolean): void;
  }

const AddCard = ({ settings, paymentOption, onFinish, initialAmount, user, updateBalance: handleUpdateBalance }: UserAccountFormIProps) => {
  const [isCardModalVisible, setIsCardModalVisible] = useState(false);
  const [amount, setAmount] = useState(initialAmount);
  const [loadingCards, setLoadingCards] = useState(false);
  const [selected, setSelected] = useState(false);
  const [cards, setCards] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const router = useRouter();

  useEffect(()=>{
    paymentOption === 'card' ? setSelected(true) : setSelected(false);
    // getCards(false)
  }, [paymentOption])

  useEffect(()=>{
    getCards(false)
  }, [])

  const getCards = async (isFinish: boolean) => {
    try {
      setLoadingCards(true);
      const resp = await paymentService.getStripeCards();
      let ddd;

      let cards = resp.data.data.map((d) => {
        if (d.card) return { ...d.card, id: d.id };
        if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
        ddd = d
        return d;
      });
      setCards(cards)

      isFinish && (
        onFinish(cards, true),
        setSelected(true)
      )
    } catch (error) {
      message.error('An error occurred while fetching cards. Please try again.');
    } finally {
      setLoadingCards(false);
    }
  };


  const applyCoupon = async () => {
    if (!couponCode) return;

    try {
      const resp = await paymentService.applyCoupon(couponCode);
      setCoupon(resp.data);
      message.success('Coupon is applied');
    } catch (error) {

      const e = await error;
      message.error(e?.message || 'Error occured, please try again later');
    };
  };



  const handleCardModalClose = () => {
    setIsCardModalVisible(false);
    getCards(true);

  };

  const handleRemoveCard = async (e: React.MouseEvent, cardId) => {
    e.stopPropagation(); // Prevent event bubbling
    if (!window.confirm('Are you sure you want to remove this payment card?')) return;
    try {
      await paymentService.removeStripeCard(cardId);
      getCards(false);
      message.success('Card removed successfully');
    } catch (error) {
      message.error('Error occurred while removing the card. Please try again.');
    }
  };

  const selectCard = (e: React.MouseEvent, selected: boolean) => {
    e.stopPropagation();
    setSelected(selected)
    onFinish(cards, selected)
  }

  const getCardBrandDisplay = (brand) => {
    const brandImages = {
      Visa: '/static/visa_logo.png',
      Mastercard: '/static/mastercard_logo.png',
      AmericanExpress: '/static/amex_logo.png',
      Maestro: '/static/maestro_logo.png',
    };

    const cleanBrand = brand?.replace(/\s+/g, '') || '';

    return brandImages[cleanBrand]
      ? <img src={brandImages[cleanBrand]} width={60} height={60} alt={`${cleanBrand} logo`} />
      : <CreditCardIcon className="w-12 h-12 text-trax-white text-2xl mr-4" />;
  };


  return (
    <div className="account-form-settings mb-0 p-0 flex flex-col">
      {loadingCards ? (
        <div className="text-center">
           <Image src="/static/trax_loading_optimize.gif" alt="Loading..." className='w-28 m-auto'/>
        </div>
      ) : (
        <div className="">
          {cards.map((card) => (
            <div key={card.id} onClick={(e)=> selectCard(e, !selected)} className={`cursor-pointer  bg-custom-gray rounded-lg py-1 px-2 flex flex-row items-center justify-between ${selected && 'border-custom-green border'}`}>
              <div className="flex items-center gap-2">
                {getCardBrandDisplay(card.brand)}
                <div>
                  <p className="text-trax-white font-light text-base">{`**** **** **** ${card.last4}`}</p>
                  <p className="text-trax-white font-light text-small">{card.exp_month}/{card.exp_year.toString().slice(-2)}</p>
                </div>
              </div>
              <Button
                icon={<Trash2 className='w-5 h-5'/>}
                className="text-trax-white bg-trax-transparent border-none hover:bg-trax-gray-700 rounded-lg"
                onClick={(e) => handleRemoveCard(e, card.id)}
              />
            </div>
          ))}
        </div>
      )}
      {cards.length === 0 && (
        <NewCardPage settings={settings} onSuccess={handleCardModalClose} isPPV={true}/>
      )}
    </div>
  );
};
const mapStates = (state) => ({
});
const mapDispatch = { updateBalance };

export default connect(mapStates, mapDispatch)(AddCard);