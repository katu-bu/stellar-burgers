import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { FC, useEffect } from 'react';
import { RootState, useDispatch, useSelector } from '../../services/store';
import { fetchFeed } from '../../services/feedSlice';

export const Feed: FC = () => {
  const isLoading = useSelector((state: RootState) => state.feed.isLoading);
  const ordersData = useSelector((state: RootState) => state.feed.ordersData);
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
