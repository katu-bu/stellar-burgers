import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { TOrder } from '@utils-types';
import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// const location = useLocation();
// const navigate = useNavigate();

// const handleOpenModal = () => {
//   navigate(`/feed/${number}`, {
//     state: {
//       backgroundLocation: location
//     }
//   });
// };

export const Feed: FC = () => {
  /** TODO: взять переменную из стора */
  const orders: TOrder[] = [];

  if (!orders.length) {
    return <Preloader />;
  }

  <FeedUI orders={orders} handleGetFeeds={() => {}} />;
};
