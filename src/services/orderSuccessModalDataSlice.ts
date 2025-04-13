import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { orderBurgerApi } from '../utils/burger-api';
import { TOrderWithName } from '../utils/types';

// Интерфейс состояния слайса
export interface OrderSuccessModalState {
  orderResponse?: TOrderWithName;
  isLoading: boolean;
  error: string | null;
}

// Изначальное состояние
const initialState: OrderSuccessModalState = {
  isLoading: false,
  error: null
};

// Async Thunk для загрузки подтверждения заказа
export const submitOrder = createAsyncThunk(
  'order/submit',
  async (
    { ingredientIds }: { ingredientIds: string[] },
    { rejectWithValue }
  ) => {
    try {
      const data = await orderBurgerApi(ingredientIds);
      return data;
    } catch (error) {
      return rejectWithValue('Не удалось отправить заказ');
    }
  }
);

// Создание слайса
const orderSuccessModalSlice = createSlice({
  name: 'OrderSuccessModal',
  initialState,
  reducers: {
    resetSuccessModal: (state: OrderSuccessModalState) => {
      state.isLoading = false;
      delete state.orderResponse;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.isLoading = true;
        delete state.orderResponse;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        if (state.isLoading) {
          state.isLoading = false;
          state.orderResponse = action.payload;
        }
      })
      .addCase(submitOrder.rejected, (state, action) => {
        if (state.isLoading) {
          state.isLoading = false;
          state.error = action.payload as string;
        }
      });
  }
});

export const { resetSuccessModal } = orderSuccessModalSlice.actions;

export const orderSuccessModalReducer = orderSuccessModalSlice.reducer;
export default orderSuccessModalReducer;
