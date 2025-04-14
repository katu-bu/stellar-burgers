import { ProfileOrdersUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchMyOrders } from '../../services/myOrdersSlice';
import { Preloader } from '@ui';

export const ProfileOrders: FC = () => {
  const isLoading = useSelector((state) => state.myOrders.isLoading);
  const orders = useSelector((state) => state.myOrders.ordersData.orders);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  if (isLoading) {
    return <Preloader />;
  }

  return <ProfileOrdersUI orders={orders} />;
};
