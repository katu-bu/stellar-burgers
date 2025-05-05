import orderSuccessModalReducer, {
  submitOrder,
  resetSuccessModal,
  OrderSuccessModalState,
  initialState
} from './orderSuccessModalDataSlice';
import { orderBurgerApi, TNewOrderResponse } from '../utils/burger-api';
import { TOrderWithName } from '../utils/types';

// мокаем API
jest.mock('../utils/burger-api');

describe('orderSuccessModalDataSlice', () => {
  // данные для тестов
  const mockOrderWithName: TOrderWithName = {
    name: 'Космический бургер',
    order: {
      _id: '1',
      ingredients: ['1', '2', '3'],
      status: 'done',
      name: 'Космический бургер',
      createdAt: '2024-01-01T12:00:00.000Z',
      updatedAt: '2024-01-01T12:00:00.000Z',
      number: 12345
    }
  };

  // ответ API с полем success
  const mockApiResponse: TNewOrderResponse = {
    success: true,
    ...mockOrderWithName
  };

  const ingredientIds = ['1', '2', '3'];

  describe('reducer', () => {
    it('должен возвращать начальное состояние', () => {
      expect(orderSuccessModalReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('должен обрабатывать submitOrder.pending', () => {
      const actual = orderSuccessModalReducer(
        initialState,
        submitOrder.pending('', { ingredientIds })
      );
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBe(null);
      expect(actual.orderResponse).toBeUndefined();
    });

    it('должен обрабатывать submitOrder.fulfilled', () => {
      const stateWithLoading = { ...initialState, isLoading: true };
      const actual = orderSuccessModalReducer(
        stateWithLoading,
        submitOrder.fulfilled(mockApiResponse, '', { ingredientIds })
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.orderResponse).toEqual(mockApiResponse);
      expect(actual.error).toBe(null);
    });

    it('должен обрабатывать submitOrder.rejected', () => {
      // TODO не уверена в сообщении, мб не удалось открыть модалку?
      const errorMessage = 'Ошибка оформления заказа';
      const stateWithLoading = { ...initialState, isLoading: true };
      const actual = orderSuccessModalReducer(
        stateWithLoading,
        submitOrder.rejected(
          new Error('Ошибка оформления заказа'),
          '',
          { ingredientIds },
          errorMessage
        )
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBe(errorMessage);
      expect(actual.orderResponse).toBeUndefined();
    });

    it('не должен обновлять состояние при fulfilled, если isLoading = false', () => {
      const actual = orderSuccessModalReducer(
        initialState,
        submitOrder.fulfilled(mockApiResponse, '', { ingredientIds })
      );
      expect(actual).toEqual(initialState);
    });

    it('не должен обновлять состояние при rejected, если isLoading = false', () => {
      const errorMessage = 'Ошибка оформления заказа';
      const actual = orderSuccessModalReducer(
        initialState,
        submitOrder.rejected(
          new Error('Ошибка оформления заказа'),
          '',
          { ingredientIds },
          errorMessage
        )
      );
      expect(actual).toEqual(initialState);
    });

    it('должен обрабатывать resetSuccessModal', () => {
      const stateWithData: OrderSuccessModalState = {
        isLoading: true,
        orderResponse: mockApiResponse,
        error: 'Какая-то ошибка'
      };
      const actual = orderSuccessModalReducer(
        stateWithData,
        resetSuccessModal()
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.orderResponse).toBeUndefined();
      expect(actual.error).toBe(null);
    });
  });

  describe('async actions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('должен вызывать orderBurgerApi и возвращать данные при успешном запросе', async () => {
      (orderBurgerApi as jest.Mock).mockResolvedValue(mockApiResponse);

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;
      const arg = { ingredientIds };

      const thunk = submitOrder(arg);
      const result = await thunk(dispatch, getState, extra);

      expect(orderBurgerApi).toHaveBeenCalledWith(ingredientIds);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toEqual(mockApiResponse);
      expect(result.type).toBe('order/submit/fulfilled');
    });

    it('должен обрабатывать ошибки при неудачном запросе', async () => {
      const errorMessage = 'Ошибка оформления заказа';
      (orderBurgerApi as jest.Mock).mockRejectedValue(
        new Error('Ошибка оформления заказа')
      );

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;
      const arg = { ingredientIds };

      const thunk = submitOrder(arg);
      const result = await thunk(dispatch, getState, extra);

      expect(orderBurgerApi).toHaveBeenCalledWith(ingredientIds);
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toBe('Не удалось отправить заказ');
      expect(result.type).toBe('order/submit/rejected');
    });
  });
});
