import myOrdersReducer, { fetchMyOrders, initialState } from './myOrdersSlice';
import { getOrdersApi, TFeedsResponse } from '@api';
import { TOrdersData } from '../utils/types';

// мокаем API
jest.mock('@api');

describe('myOrdersSlice', () => {
  // данные для тестов
  const mockOrdersData: TOrdersData = {
    orders: [
      {
        _id: '1',
        ingredients: ['1', '2', '3'],
        status: 'done',
        name: 'Мой первый заказ',
        createdAt: '2024-01-01T12:00:00.000Z',
        updatedAt: '2024-01-01T12:00:00.000Z',
        number: 12345
      },
      {
        _id: '2',
        ingredients: ['4', '5', '6'],
        status: 'pending',
        name: 'Мой второй заказ',
        createdAt: '2024-01-01T13:00:00.000Z',
        updatedAt: '2024-01-01T13:00:00.000Z',
        number: 12346
      }
    ],
    total: 50,
    totalToday: 5
  };

  // Mock-ответ API с полем success
  const mockApiResponse: TFeedsResponse = {
    success: true,
    ...mockOrdersData
  };

  describe('reducer', () => {
    it('должен возвращать начальное состояние', () => {
      expect(myOrdersReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('должен обрабатывать fetchMyOrders.pending', () => {
      const actual = myOrdersReducer(
        initialState,
        fetchMyOrders.pending('', undefined)
      );
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBe(null);
      expect(actual.ordersData).toEqual(initialState.ordersData);
    });

    it('должен обрабатывать fetchMyOrders.fulfilled', () => {
      // В редьюсере ожидаем полный ответ API (TFeedsResponse)
      const actual = myOrdersReducer(
        initialState,
        fetchMyOrders.fulfilled(mockApiResponse, '', undefined)
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.ordersData).toEqual(mockApiResponse);
      expect(actual.error).toBe(null);
    });

    it('должен обрабатывать fetchMyOrders.rejected', () => {
      const errorMessage = 'Ошибка получения заказов';
      const actual = myOrdersReducer(
        initialState,
        fetchMyOrders.rejected(
          new Error(errorMessage),
          '',
          undefined,
          errorMessage
        )
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBe(errorMessage);
      expect(actual.ordersData).toEqual(initialState.ordersData);
    });
  });

  describe('async actions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('должен вызывать getOrdersApi и возвращать данные при успешном запросе', async () => {
      (getOrdersApi as jest.Mock).mockResolvedValue(mockApiResponse);

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;

      const thunk = fetchMyOrders();
      const result = await thunk(dispatch, getState, extra);

      expect(getOrdersApi).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toEqual(mockApiResponse);
      expect(result.type).toBe('myOrders/fetch/fulfilled');
    });

    it('должен обрабатывать ошибки при неудачном запросе', async () => {
      const errorMessage = 'Ошибка получения заказов';
      (getOrdersApi as jest.Mock).mockRejectedValue(new Error(errorMessage));

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;

      const thunk = fetchMyOrders();
      const result = await thunk(dispatch, getState, extra);

      expect(getOrdersApi).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toBe('Не удалось загрузить мои заказы');
      expect(result.type).toBe('myOrders/fetch/rejected');
    });
  });
});
