import React, { useState, useEffect } from 'react';
import { Modal, Spin, message, Button } from 'antd';
import { CreditCardOutlined, MoreOutlined } from '@ant-design/icons';
import { userService, paymentService } from '@services/index';
import { IUser, ISettings } from 'src/interfaces';
import TraxButton from '@components/common/TraxButton';
import NewCardPage from 'pages/user/cards/add-card';
import { useDispatch } from 'react-redux';

interface IBillingSettingsProps {
  user: IUser;
  settings: ISettings;
  onFinish?: (values: any) => void;
}

interface ICard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
  card?: any;
  three_d_secure?: any;
}

const BillingSettings: React.FC<IBillingSettingsProps> = ({
  user,
  settings,
  onFinish
}) => {
  const [isCardModalVisible, setIsCardModalVisible] = useState(false);
  const [cards, setCards] = useState<ICard[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    getCards();
  }, []);

  const getCards = async () => {
    try {
      setLoadingCards(true);
      const resp = await paymentService.getStripeCards();
      setCards(resp.data.data.map((d: any) => {
        if (d.card) return { ...d.card, id: d.id };
        if (d.three_d_secure) return { ...d.three_d_secure, id: d.id };
        return d;
      }));
    } catch (error) {
      message.error('An error occurred while fetching cards. Please try again.');
    } finally {
      setLoadingCards(false);
    }
  };

  const handleAddCard = () => {
    setIsCardModalVisible(true);
  };

  const handleCardModalClose = () => {
    setIsCardModalVisible(false);
    getCards();
  };

  const handleRemoveCard = async (cardId: string) => {
    if (!window.confirm('Are you sure you want to remove this payment card?')) return;
    try {
      await paymentService.removeStripeCard(cardId);
      await userService.reloadCurrentUser(dispatch);
      await getCards();
      message.success('Card removed successfully');
    } catch (error) {
      message.error('Error occurred while removing the card. Please try again.');
    }
  };

  return (
    <div className="account-form-settings">
      <div className="mb-4">
        <h1 className="profile-page-heading">Payment methods</h1>
        <span className="text-trax-gray-300 text-base">
          Your saved payment methods are encrypted and stored securely by Stripe.
        </span>
      </div>

      {loadingCards ? (
        <div className="flex justify-center items-center py-8">
          <Spin />
        </div>
      ) : (
        <div className="flex flex-col space-y-4 mb-6">
          {cards.map((card) => (
            <div key={card.id} className="bg-custom-gray rounded-lg py-2 px-4 flex items-center justify-between">
              <div className="flex items-center">
                <CreditCardOutlined className="text-trax-white text-2xl mr-4" />
                <div>
                  <p className="text-trax-white font-bold text-lg">
                    {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} ... {card.last4}
                  </p>
                  <p className="text-trax-white text-base">
                    Expiry: {card.exp_month}/{card.exp_year.toString().slice(-2)}
                  </p>
                </div>
              </div>
              <Button
                icon={<MoreOutlined />}
                className="text-trax-white bg-trax-transparent border-none hover:bg-trax-gray-700 rotate-90"
                onClick={() => handleRemoveCard(card.id)}
              />
            </div>
          ))}
        </div>
      )}

      <TraxButton
        htmlType="button"
        styleType="primary"
        buttonSize="full"
        buttonText="Add card"
        onClick={handleAddCard}
      />

      <Modal
        open={isCardModalVisible}
        onCancel={handleCardModalClose}
        footer={null}
        width={600}
        destroyOnClose
      >
        <NewCardPage settings={settings} onSuccess={handleCardModalClose} isPPV={false}/>
      </Modal>
    </div>
  );
};

export default BillingSettings;
