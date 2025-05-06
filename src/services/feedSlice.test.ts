import feedReducer, { fetchFeed, initialState } from './feedSlice';
import { getFeedsApi, TFeedsResponse } from '../utils/burger-api';
import { TOrdersData } from '../utils/types';

// мокаем API
jest.mock('../utils/burger-api');

describe('feedSlice', () => {
  // тестовые данные для заказов
  const mockOrdersData: TOrdersData = {
    orders: [
      {
        _id: '1',
        ingredients: ['1', '2', '3'],
        status: 'done',
        name: 'Тестовый бургер',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        number: 12345
      },
      {
        _id: '2',
        ingredients: ['4', '5', '6'],
        status: 'pending',
        name: 'Второй бургер',
        createdAt: '2024-01-01T13:00:00.000Z',
        updatedAt: '2024-01-01T13:00:00.000Z',
        number: 12346
      }
    ],
    total: 100,
    totalToday: 10
  };

  // тестовые данные для ответа API
  const mockFeedsResponse: TFeedsResponse = {
    success: true,
    ...mockOrdersData
  };

  describe('reducer', () => {
    it('должен возвращать начальное состояние', () => {
      expect(feedReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('должен обрабатывать fetchFeed.pending', () => {
      const actual = feedReducer(
        initialState,
        fetchFeed.pending('', undefined)
      );
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBe(null);
      expect(actual.ordersData).toEqual(initialState.ordersData);
    });

    it('должен обрабатывать fetchFeed.fulfilled', () => {
      const actual = feedReducer(
        initialState,
        fetchFeed.fulfilled(mockFeedsResponse, '', undefined)
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.ordersData).toEqual(mockFeedsResponse);
      expect(actual.error).toBe(null);
    });

    it('должен обрабатывать fetchFeed.rejected', () => {
      const actual = feedReducer(
        initialState,
        fetchFeed.rejected(
          new Error('Ошибка получения фида'),
          '',
          undefined,
          'Ошибка получения фида'
        )
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBe('Ошибка получения фида');
      expect(actual.ordersData).toEqual(initialState.ordersData);
    });
  });

  describe('async actions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('должен вызывать getFeedsApi и возвращать данные при успешном запросе', async () => {
      (getFeedsApi as jest.Mock).mockResolvedValue(mockFeedsResponse);

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;

      const thunk = fetchFeed();
      const result = await thunk(dispatch, getState, extra);

      expect(getFeedsApi).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toEqual(mockFeedsResponse);
      expect(result.type).toBe('feed/fetch/fulfilled');
    });

    it('должен обрабатывать ошибки при неудачном запросе', async () => {
      (getFeedsApi as jest.Mock).mockRejectedValue(
        new Error('Ошибка получения фида')
      );

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;

      const thunk = fetchFeed();
      const result = await thunk(dispatch, getState, extra);

      expect(getFeedsApi).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toBe('Не удалось загрузить список всех заказов');
      expect(result.type).toBe('feed/fetch/rejected');
    });
  });
});
