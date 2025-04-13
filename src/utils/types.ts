export type TIngredient = {
  _id: string;
  name: string;
  type: string;
  proteins: number;
  fat: number;
  carbohydrates: number;
  calories: number;
  price: number;
  image: string;
  image_large: string;
  image_mobile: string;
};

export type TConstructorIngredient = TIngredient & { reactDisplayId: number };

export type TConstructorItems = {
  bun?: TIngredient;
  ingredients: TConstructorIngredient[];
};

export type TOrder = {
  _id: string;
  status: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  number: number;
  ingredients: string[];
};

export type TOrderWithName = {
  order: TOrder;
  name: string;
};

export type TFeedMetadata = { total: number; totalToday: number };

export type TOrdersData = {
  orders: TOrder[];
} & TFeedMetadata;

export type TUser = {
  email: string;
  name: string;
};

export type TTabMode = 'bun' | 'sauce' | 'main';
