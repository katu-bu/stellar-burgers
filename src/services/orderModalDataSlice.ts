import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getOrderByNumberApi } from '../utils/burger-api';
import { TOrder } from '../utils/types';

// Интерфейс состояния слайса
export interface OrderModalState {
  orderData?: TOrder;
  isLoading: boolean;
  error: string | null;
}

// Изначальное состояние
const initialState: OrderModalState = {
  isLoading: false,
  error: null
};

// Async Thunk для загрузки заказа
export const fetchOrder = createAsyncThunk(
  'order/fetch',
  async ({ number }: { number: string }, { rejectWithValue }) => {
    try {
      const data = await getOrderByNumberApi(number);
      return data;
    } catch (error) {
      return rejectWithValue('Не удалось загрузить заказ');
    }
  }
);

// Создание слайса
const orderModalSlice = createSlice({
  name: 'OrderModal',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orderData = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const orderModalReducer = orderModalSlice.reducer;
export default orderModalReducer;
