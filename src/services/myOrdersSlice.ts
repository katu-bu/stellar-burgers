import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { TOrdersData } from '../utils/types';
import { getOrdersApi } from '@api';

// Интерфейс состояния слайса
export interface MyOrdersState {
  ordersData: TOrdersData;
  isLoading: boolean;
  error: string | null;
}

// Изначальное состояние
const initialState: MyOrdersState = {
  ordersData: { orders: [], total: 0, totalToday: 0 },
  isLoading: false,
  error: null
};

// Async Thunk для загрузки моих заказов
export const fetchMyOrders = createAsyncThunk(
  'myOrders/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getOrdersApi();
      return data;
    } catch (error) {
      return rejectWithValue('Не удалось загрузить мои заказы');
    }
  }
);

// Создание слайса
const myOrders = createSlice({
  name: 'myOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ordersData = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const myOrdersReducer = myOrders.reducer;
export default myOrdersReducer;
