import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi } from '../utils/burger-api';
import { TOrdersData } from '../utils/types';

// Интерфейс состояния слайса
export interface FeedState {
  ordersData: TOrdersData;
  isLoading: boolean;
  error: string | null;
}

// Изначальное состояние
export const initialState: FeedState = {
  ordersData: { orders: [], total: 0, totalToday: 0 },
  isLoading: false,
  error: null
};

// Async Thunk для загрузки фида
export const fetchFeed = createAsyncThunk(
  'feed/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getFeedsApi();
      return data;
    } catch (error) {
      return rejectWithValue('Не удалось загрузить список всех заказов');
    }
  }
);

// Создание слайса
const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ordersData = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const feedReducer = feedSlice.reducer;
export default feedReducer;
