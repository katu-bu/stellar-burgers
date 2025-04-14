import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { useDispatch, useSelector } from '../../services/store';
import { fetchFeed } from '../../services/feedSlice';

export const Feed: FC = () => {
  const isLoading = useSelector((state) => state.feed.isLoading);
  const ordersData = useSelector((state) => state.feed.ordersData);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchFeed());
  }, []);

  if (isLoading) {
    return <Preloader />;
  }

  return (
    <FeedUI
      ordersData={ordersData}
      handleGetFeeds={() => {
        dispatch(fetchFeed());
      }}
    />
  );
};
