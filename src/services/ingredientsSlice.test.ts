import ingredientsReducer, {
  fetchIngredients,
  initialState
} from './ingredientsSlice';
import { getIngredientsApi } from '../utils/burger-api';
import { TIngredient } from '../utils/types';

// мокаем API
jest.mock('../utils/burger-api');

describe('ingredientsSlice', () => {
  // данные для тестов
  const mockIngredients: TIngredient[] = [
    {
      _id: '1',
      name: 'Булка',
      type: 'bun',
      proteins: 80,
      fat: 24,
      carbohydrates: 53,
      calories: 420,
      price: 1255,
      image: 'image-url',
      image_mobile: 'image-mobile-url',
      image_large: 'image-large-url'
    },
    {
      _id: '2',
      name: 'Соус',
      type: 'sauce',
      proteins: 30,
      fat: 20,
      carbohydrates: 40,
      calories: 300,
      price: 90,
      image: 'image-url',
      image_mobile: 'image-mobile-url',
      image_large: 'image-large-url'
    }
  ];

  describe('reducer', () => {
    it('должен возвращать начальное состояние', () => {
      expect(ingredientsReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    it('должен обрабатывать fetchIngredients.pending', () => {
      const actual = ingredientsReducer(
        initialState,
        fetchIngredients.pending('', undefined, { rejectWithValue: jest.fn() })
      );
      expect(actual.isLoading).toBe(true);
      expect(actual.error).toBe(null);
    });

    it('должен обрабатывать fetchIngredients.fulfilled', () => {
      const actual = ingredientsReducer(
        initialState,
        fetchIngredients.fulfilled(mockIngredients, '', undefined, {
          rejectWithValue: jest.fn()
        })
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.ingredients).toEqual(mockIngredients);
      expect(actual.error).toBe(null);
    });

    it('должен обрабатывать fetchIngredients.rejected', () => {
      const errorMessage = 'Ошибка получения ингредиентов';
      const actual = ingredientsReducer(
        initialState,
        fetchIngredients.rejected(
          new Error(errorMessage),
          '',
          undefined,
          errorMessage
        )
      );
      expect(actual.isLoading).toBe(false);
      expect(actual.error).toBe(errorMessage);
      expect(actual.ingredients).toEqual([]);
    });
  });

  describe('async actions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('должен вызывать getIngredientsApi и возвращать данные при успешном запросе', async () => {
      (getIngredientsApi as jest.Mock).mockResolvedValue(mockIngredients);

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;
      const arg = undefined;

      const thunk = fetchIngredients();
      const result = await thunk(dispatch, getState, extra);

      expect(getIngredientsApi).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toEqual(mockIngredients);
      expect(result.type).toBe('ingredients/fetchIngredients/fulfilled');
    });

    it('должен обрабатывать ошибки при неудачном запросе', async () => {
      const errorMessage = 'Ошибка получения ингредиентов';
      (getIngredientsApi as jest.Mock).mockRejectedValue(
        new Error(errorMessage)
      );

      const dispatch = jest.fn();
      const getState = jest.fn();
      const extra = undefined;
      const arg = undefined;

      const thunk = fetchIngredients();
      const result = await thunk(dispatch, getState, extra);

      expect(getIngredientsApi).toHaveBeenCalled();
      expect(dispatch).toHaveBeenCalledTimes(2);
      expect(result.payload).toBe('Не удалось загрузить ингредиенты');
      expect(result.type).toBe('ingredients/fetchIngredients/rejected');
    });
  });
});
