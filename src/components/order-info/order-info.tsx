import { FC, useEffect, useMemo } from 'react';
import { Preloader } from '../ui/preloader';
import { OrderInfoUI } from '../ui/order-info';
import { TIngredient, TOrder } from '@utils-types';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from '../../services/store';
import { fetchOrder } from '../../services/orderModalDataSlice';

function extractIngredients(orderData: TOrder, allIngredients: TIngredient[]) {
  return allIngredients.filter((ingredient) =>
    orderData.ingredients.includes(ingredient._id)
  );
}

function findOrder(number: string | undefined, orders: TOrder[]) {
  return orders.find((order) => order.number.toString() === number);
}

function checkOrderByNumber(
  number: string | undefined,
  orderModalData: TOrder | undefined
) {
  return orderModalData?.number?.toString() === number;
}

function extractData(
  number: string | undefined,
  orderModalData: TOrder | undefined,
  orders: TOrder[],
  allIngredients: TIngredient[]
): [TOrder, TIngredient[]] | undefined {
  if (number === undefined) {
    return undefined;
  }
  if (
    orderModalData !== undefined &&
    checkOrderByNumber(number, orderModalData)
  ) {
    return [orderModalData, extractIngredients(orderModalData, allIngredients)];
  }
  const orderData = findOrder(number, orders);
  if (orderData === undefined) {
    return undefined;
  }
  return [orderData, extractIngredients(orderData, allIngredients)];
}

export const OrderInfo: FC = () => {
  const { number } = useParams<{ number: string }>();
  const isLoading = useSelector(
    (state) => state.ingredients.isLoading || state.orderModal.isLoading
  );
  const orderModalData = useSelector((state) => state.orderModal.orderData);
  const feedOrders = useSelector((state) => state.feed.ordersData.orders);
  const myOrders = useSelector((state) => state.myOrders.ordersData.orders);
  const allIngredients = useSelector((state) => state.ingredients.ingredients);
  const orders = [...myOrders, ...feedOrders];
  const dispatch = useDispatch();
  useEffect(() => {
    if (
      number !== undefined &&
      !isLoading &&
      !checkOrderByNumber(number, orderModalData) &&
      !findOrder(number, orders)
    ) {
      dispatch(fetchOrder({ number }));
    }
  }, [number, isLoading, orderModalData, orders, dispatch]);

  /* Готовим данные для отображения */
  const orderInfo = useMemo(() => {
    const extractedData = extractData(
      number,
      orderModalData,
      orders,
      allIngredients
    );
    if (extractedData === undefined) return null;
    const [orderData, ingredients] = extractedData;

    const date = new Date(orderData.createdAt);

    type TIngredientsWithCount = {
      [key: string]: TIngredient & { count: number };
    };

    const ingredientsInfo = orderData.ingredients.reduce(
      (acc: TIngredientsWithCount, item) => {
        if (!acc[item]) {
          const ingredient = ingredients.find((ing) => ing._id === item);
          if (ingredient) {
            acc[item] = {
              ...ingredient,
              count: 1
            };
          }
        } else {
          acc[item].count++;
        }

        return acc;
      },
      {}
    );

    const total = Object.values(ingredientsInfo).reduce(
      (acc, item) => acc + item.price * item.count,
      0
    );

    return {
      ...orderData,
      ingredientsInfo,
      date,
      total
    };
  }, [number, orderModalData, orders, allIngredients]);

  if (isLoading || orderInfo === null) {
    return <Preloader />;
  }
  return <OrderInfoUI orderInfo={orderInfo} />;
};
