import orderModalReducer, {
  fetchOrder,
  OrderModalState
} from './orderModalDataSlice';
import { getOrderByNumberApi } from '../utils/burger-api';
import { TOrder } from '../utils/types';

// мокаем API
jest.mock('../utils/burger-api');

describe('orderModalDataSlice', () => {
  // изначальное состояние для каждого теста
  const initialState: OrderModalState = {
    isLoading: false,
    error: null
  };

  // данные для тестов
  const mockOrder: TOrder = {
    _id: '1',
    ingredients: ['1', '2', '3'],
    status: 'done',
    name: 'Тестовый бургер',
    createdAt: '2024-01-01T12:00:00.000Z',
    updatedAt: '2024-01-01T12:00:00.000Z',
    number: 12345
  };

  const orderNumber = '12345';

  describe('reducer', () => {
    it('должен возвращать начальное состояние', () => {
      expect(orderModalReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('должен обрабатывать fetchOrder.pending', () => {
      const actual = orderModalReducer(
        initialState,
        fetchOrder.pending('', { number: orderNumber })
      );
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBe(null);
      expect(actual.orderData).toBeUndefined();
    });

    it('должен обрабатывать fetchOrder.fulfilled', () => {
      const actual = orderModalReducer(
        initialState,
        fetchOrder.fulfilled(mockOrder, '', { number: orderNumber })
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.orderData).toEqual(mockOrder);
      expect(actual.error).toBe(null);
    });

    it('должен обрабатывать fetchOrder.rejected', () => {
      const errorMessage = 'Ошибка получения данных заказа';
      const actual = orderModalReducer(
        initialState,
        fetchOrder.rejected(
          new Error(errorMessage),
          '',
          { number: orderNumber },
          errorMessage
        )
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBe(errorMessage);
      expect(actual.orderData).toBeUndefined();
    });
  });

  describe('async actions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('должен вызывать getOrderByNumberApi и возвращать данные при успешном запросе', async () => {
      (getOrderByNumberApi as jest.Mock).mockResolvedValue(mockOrder);

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;
      const arg = { number: orderNumber };

      const thunk = fetchOrder(arg);
      const result = await thunk(dispatch, getState, extra);

      expect(getOrderByNumberApi).toHaveBeenCalledWith(orderNumber);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toEqual(mockOrder);
      expect(result.type).toBe('order/fetch/fulfilled');
    });

    it('должен обрабатывать ошибки при неудачном запросе', async () => {
      const errorMessage = 'Ошибка получения данных заказа';
      (getOrderByNumberApi as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;
      const arg = { number: orderNumber };

      const thunk = fetchOrder(arg);
      const result = await thunk(dispatch, getState, extra);

      expect(getOrderByNumberApi).toHaveBeenCalledWith(orderNumber);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toBe('Не удалось загрузить заказ');
      expect(result.type).toBe('order/fetch/rejected');
    });
  });
});
