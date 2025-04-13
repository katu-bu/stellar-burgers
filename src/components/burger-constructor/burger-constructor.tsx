import { FC, useMemo } from 'react';
import { TIngredient } from '@utils-types';
import { BurgerConstructorUI } from '@ui';
import { RootState, useDispatch, useSelector } from '../../services/store';
import {
  resetSuccessModal,
  submitOrder
} from '../../services/orderSuccessModalDataSlice';
import { clearConstructor } from '../../services/constructorItemsSlice';
import { useNavigate } from 'react-router-dom';

export const BurgerConstructor: FC = () => {
  const constructorItems = useSelector(
    (state: RootState) => state.constructorItems
  );
  const orderRequest = useSelector(
    (state: RootState) => state.orderSuccessModal.isLoading
  );
  const orderModalData =
    useSelector((state: RootState) => state.orderSuccessModal.orderResponse)
      ?.order || null;
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const onOrderClick = () => {
    if (!constructorItems.bun || orderRequest) return;
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const ingredientIds = constructorItems.ingredients.map(({ _id }) => _id);
    ingredientIds.push(constructorItems.bun._id);
    dispatch(submitOrder({ ingredientIds }));
  };
  const closeOrderModal = () => {
    dispatch(resetSuccessModal());
    dispatch(clearConstructor());
  };

  const price = useMemo(
    () =>
      (constructorItems.bun ? constructorItems.bun.price * 2 : 0) +
      constructorItems.ingredients.reduce(
        (s: number, v: TIngredient) => s + v.price,
        0
      ),
    [constructorItems]
  );

  return (
    <BurgerConstructorUI
      price={price}
      orderRequest={orderRequest}
      constructorItems={constructorItems}
      orderModalData={orderModalData}
      onOrderClick={onOrderClick}
      closeOrderModal={closeOrderModal}
    />
  );
};
