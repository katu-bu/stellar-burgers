import constructorItemsReducer, {
  addIngredient,
  deleteIngredient,
  moveIngredient,
  clearConstructor,
  initialState
} from './constructorItemsSlice';
import { TConstructorItems, TIngredient } from '../utils/types';

describe('constructorItemsSlice', () => {
  // данные для тестов
  const mockBun: TIngredient = {
    _id: '1',
    name: 'Булка R2-D3',
    type: 'bun',
    proteins: 44,
    fat: 26,
    carbohydrates: 85,
    calories: 643,
    price: 988,
    image: 'bun-image',
    image_mobile: 'bun-image-mobile',
    image_large: 'bun-image-large'
  };

  const mockSauce: TIngredient = {
    _id: '2',
    name: 'Соус Spicy-X',
    type: 'sauce',
    proteins: 30,
    fat: 20,
    carbohydrates: 40,
    calories: 300,
    price: 90,
    image: 'sauce-image',
    image_mobile: 'sauce-image-mobile',
    image_large: 'sauce-image-large'
  };

  const mockMain: TIngredient = {
    _id: '3',
    name: 'Мясо бессмертных моллюсков',
    type: 'main',
    proteins: 433,
    fat: 244,
    carbohydrates: 33,
    calories: 420,
    price: 1337,
    image: 'main-image',
    image_mobile: 'main-image-mobile',
    image_large: 'main-image-large'
  };

  describe('reducer', () => {
    it('должен возвращать начальное состояние', () => {
      expect(constructorItemsReducer(undefined, { type: 'unknown' })).toEqual(
        initialState
      );
    });

    describe('addIngredient', () => {
      it('должен добавлять булку в отдельное поле bun', () => {
        const actual = constructorItemsReducer(
          initialState,
          addIngredient(mockBun)
        );
        expect(actual.bun).toEqual(mockBun);
        expect(actual.ingredients).toHaveLength(0);
      });

      it('должен заменять существующую булку при добавлении новой', () => {
        const stateWithBun: TConstructorItems = {
          ...initialState,
          bun: mockBun
        };
        const newBun = { ...mockBun, _id: 'new-bun-id', name: 'Новая булка' };
        const actual = constructorItemsReducer(
          stateWithBun,
          addIngredient(newBun)
        );
        expect(actual.bun).toEqual(newBun);
      });

      it('должен добавлять ингредиенты (не булки) в массив ingredients с уникальным reactDisplayId', () => {
        // мокаем Math.random для предсказуемого теста
        const mockRandom = jest
          .spyOn(Math, 'random')
          .mockReturnValue(0.123456789);

        const actual = constructorItemsReducer(
          initialState,
          addIngredient(mockSauce)
        );
        expect(actual.ingredients).toHaveLength(1);
        expect(actual.ingredients[0]).toEqual({
          ...mockSauce,
          reactDisplayId: 0.123456789
        });
        expect(actual.bun).toBeUndefined();

        mockRandom.mockRestore();
      });

      it('должен добавлять несколько ингредиентов', () => {
        let state = constructorItemsReducer(
          initialState,
          addIngredient(mockSauce)
        );
        state = constructorItemsReducer(state, addIngredient(mockMain));

        expect(state.ingredients).toHaveLength(2);
        expect(state.ingredients[0]).toMatchObject(mockSauce);
        expect(state.ingredients[1]).toMatchObject(mockMain);
      });
    });

    describe('deleteIngredient', () => {
      it('должен удалять ингредиент по индексу', () => {
        const stateWithIngredients: TConstructorItems = {
          ingredients: [
            { ...mockSauce, reactDisplayId: 1 },
            { ...mockMain, reactDisplayId: 2 },
            { ...mockSauce, reactDisplayId: 3 }
          ]
        };

        const actual = constructorItemsReducer(
          stateWithIngredients,
          deleteIngredient({ index: 1 })
        );
        expect(actual.ingredients).toHaveLength(2);
        expect(actual.ingredients[0]).toMatchObject(mockSauce);
        expect(actual.ingredients[1]).toMatchObject(mockSauce);
      });

      it('должен корректно удалять первый элемент', () => {
        const stateWithIngredients: TConstructorItems = {
          ingredients: [
            { ...mockSauce, reactDisplayId: 1 },
            { ...mockMain, reactDisplayId: 2 }
          ]
        };

        const actual = constructorItemsReducer(
          stateWithIngredients,
          deleteIngredient({ index: 0 })
        );
        expect(actual.ingredients).toHaveLength(1);
        expect(actual.ingredients[0]).toMatchObject(mockMain);
      });

      it('должен корректно удалять последний элемент', () => {
        const stateWithIngredients: TConstructorItems = {
          ingredients: [
            { ...mockSauce, reactDisplayId: 1 },
            { ...mockMain, reactDisplayId: 2 }
          ]
        };

        const actual = constructorItemsReducer(
          stateWithIngredients,
          deleteIngredient({ index: 1 })
        );
        expect(actual.ingredients).toHaveLength(1);
        expect(actual.ingredients[0]).toMatchObject(mockSauce);
      });
    });

    describe('moveIngredient', () => {
      const stateWithIngredients: TConstructorItems = {
        ingredients: [
          { ...mockSauce, reactDisplayId: 1, name: 'Соус 1' },
          { ...mockMain, reactDisplayId: 2, name: 'Мясо 1' },
          { ...mockSauce, reactDisplayId: 3, name: 'Соус 2' }
        ]
      };

      it('должен перемещать ингредиент вверх', () => {
        const actual = constructorItemsReducer(
          stateWithIngredients,
          moveIngredient({ index: 1, up: true })
        );
        expect(actual.ingredients[0].name).toBe('Мясо 1');
        expect(actual.ingredients[1].name).toBe('Соус 1');
        expect(actual.ingredients[2].name).toBe('Соус 2');
      });

      it('должен перемещать ингредиент вниз', () => {
        const actual = constructorItemsReducer(
          stateWithIngredients,
          moveIngredient({ index: 1, up: false })
        );
        expect(actual.ingredients[0].name).toBe('Соус 1');
        expect(actual.ingredients[1].name).toBe('Соус 2');
        expect(actual.ingredients[2].name).toBe('Мясо 1');
      });

      it('должен корректно работать на границах массива (вверх)', () => {
        const actual = constructorItemsReducer(
          stateWithIngredients,
          moveIngredient({ index: 2, up: true })
        );
        expect(actual.ingredients[0].name).toBe('Соус 1');
        expect(actual.ingredients[1].name).toBe('Соус 2');
        expect(actual.ingredients[2].name).toBe('Мясо 1');
      });

      it('должен корректно работать на границах массива (вниз)', () => {
        const actual = constructorItemsReducer(
          stateWithIngredients,
          moveIngredient({ index: 0, up: false })
        );
        expect(actual.ingredients[0].name).toBe('Мясо 1');
        expect(actual.ingredients[1].name).toBe('Соус 1');
        expect(actual.ingredients[2].name).toBe('Соус 2');
      });
    });

    describe('clearConstructor', () => {
      it('должен очищать все ингредиенты и булку', () => {
        const stateWithData: TConstructorItems = {
          bun: mockBun,
          ingredients: [
            { ...mockSauce, reactDisplayId: 1 },
            { ...mockMain, reactDisplayId: 2 }
          ]
        };

        const actual = constructorItemsReducer(
          stateWithData,
          clearConstructor()
        );
        expect(actual.ingredients).toHaveLength(0);
        expect(actual.bun).toBeUndefined();
      });
    });
  });
});
