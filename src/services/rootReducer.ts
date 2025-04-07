import { combineReducers } from '@reduxjs/toolkit';
import ingredientsReducer from './ingredientsSlice';

const rootReducer = combineReducers({
  ingredients: ingredientsReducer
  // добавить др. редюсеры, если нужно
});

export default rootReducer;
