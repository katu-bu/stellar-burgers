import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './ingredientsSlice';
import userReducer from './userSlice';
import constructorItemsReducer from './constructorItemsSlice';
import feedReducer from './feedSlice';
import orderModalReducer from './orderModalDataSlice';
import orderSuccessModalReducer from './orderSuccessModalDataSlice';
import myOrdersReducer from './myOrdersSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer,
  user: userReducer,
  constructorItems: constructorItemsReducer,
  feed: feedReducer,
  orderModal: orderModalReducer,
  orderSuccessModal: orderSuccessModalReducer,
  myOrders: myOrdersReducer
  // сюда добавляем новые редюсеры, если нужно
});

export default rootReducer;
