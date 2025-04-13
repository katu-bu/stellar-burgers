import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TConstructorItems, TIngredient } from '../utils/types';

// Изначальное состояние
const initialState: TConstructorItems = {
  ingredients: []
};

// Создание слайса
const constructorItemsSlice = createSlice({
  name: 'ingredients',
  initialState,
  reducers: {
    addIngredient: (
      state: TConstructorItems,
      action: PayloadAction<TIngredient>
    ) => {
      const ingredient = action.payload;
      if (ingredient.type == 'bun') {
        state.bun = ingredient;
      } else {
        state.ingredients.push({
          ...action.payload,
          // Нужно сгенерировать уникальный айди, который
          // не будет меняться для ингредиента в списке
          reactDisplayId: Math.random()
        });
      }
    },
    moveIngredient: (
      state: TConstructorItems,
      { payload: { index, up } }: PayloadAction<{ index: number; up: boolean }>
    ) => {
      const swappingWithIndex = up ? index - 1 : index + 1;
      const value = state.ingredients[swappingWithIndex];
      state.ingredients[swappingWithIndex] = state.ingredients[index];
      state.ingredients[index] = value;
    },
    deleteIngredient: (
      state: TConstructorItems,
      { payload: { index } }: PayloadAction<{ index: number }>
    ) => {
      state.ingredients = [
        ...state.ingredients.slice(0, index),
        ...state.ingredients.slice(index + 1)
      ];
    },
    clearConstructor: (state: TConstructorItems) => {
      state.ingredients = [];
      delete state.bun;
    }
  }
});

export const {
  addIngredient,
  deleteIngredient,
  moveIngredient,
  clearConstructor
} = constructorItemsSlice.actions;

export const constructorItemsReducer = constructorItemsSlice.reducer;
export default constructorItemsReducer;
