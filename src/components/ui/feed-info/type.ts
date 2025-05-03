import { TFeedMetadata } from '@utils-types';

export type FeedInfoUIProps = {
  feed: TFeedMetadata;
  readyOrders: number[];
  pendingOrders: number[];
};

export type HalfColumnProps = {
  orders: number[];
  title: string;
  textColor?: string;
};

export type TColumnProps = {
  title: string;
  content: number;
};
