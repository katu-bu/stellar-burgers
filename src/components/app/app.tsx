import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom';
import {
  ConstructorPage,
  Feed,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  ProfileOrders,
  NotFound404
} from '@pages';
import '../../index.css';
import styles from './app.module.css';
import { AppHeader, Modal, IngredientDetails, OrderInfo } from '@components';
import { useSelector } from 'react-redux';
import { RootState, useDispatch } from '../../services/store';
import { getUser } from '../../services/userSlice';
import { Preloader } from '../ui/preloader';
import { fetchIngredients } from '../../services/ingredientsSlice';

// компонент защищенного роута
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// защищенный роут для залогиненных пользователей
const AuthenticatedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthChecked = useSelector(
    (state: RootState) => state.user.isAuthChecked
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  if (!isAuthChecked) {
    return <Preloader />;
  }
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return <>{children}</>;
};

// защищенный роут для незалогиненных пользователей
const NonAuthenticatedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthChecked = useSelector(
    (state: RootState) => state.user.isAuthChecked
  );
  const isAuthenticated = useSelector(
    (state: RootState) => state.user.isAuthenticated
  );
  if (!isAuthChecked) {
    return <Preloader />;
  }
  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }
  return <>{children}</>;
};

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Получение фонового состояния для модалок
  const backgroundLocation = location.state?.backgroundLocation;
  // Обработчик закрытия модалки
  const handleModalClose = () => {
    navigate(-1);
  };
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getUser());
    // Вызов thunk для загрузки ингредиентов
    dispatch(fetchIngredients());
  }, [dispatch]);

  return (
    <div className={styles.app}>
      <AppHeader />
      <Routes location={backgroundLocation || location}>
        {/* Роуты */}
        <Route path='/' element={<ConstructorPage />} />
        <Route path='/feed' element={<Feed />} />
        {/* Роуты для модалок с доп информацией */}
        <Route
          path='/feed/:number'
          element={
            <Modal title='Детали заказа' onClose={handleModalClose}>
              <OrderInfo />
            </Modal>
          }
        />
        <Route
          path='/ingredients/:id'
          element={
            <Modal title='Детали ингредиента' onClose={handleModalClose}>
              <IngredientDetails />
            </Modal>
          }
        />
        {/* Защищенный роут для модалки с доп информацией по деталям заказа */}
        <Route
          path='/profile/orders/:number'
          element={
            <AuthenticatedRoute>
              <Modal title='Детали заказа' onClose={handleModalClose}>
                <OrderInfo />
              </Modal>
            </AuthenticatedRoute>
          }
        />
        {/* Защищенные роуты */}
        <Route
          path='/login'
          element={
            <NonAuthenticatedRoute>
              <Login />
            </NonAuthenticatedRoute>
          }
        />
        <Route
          path='/register'
          element={
            <NonAuthenticatedRoute>
              <Register />
            </NonAuthenticatedRoute>
          }
        />
        <Route
          path='/forgot-password'
          element={
            <NonAuthenticatedRoute>
              <ForgotPassword />
            </NonAuthenticatedRoute>
          }
        />
        <Route
          path='/reset-password'
          element={
            <NonAuthenticatedRoute>
              <ResetPassword />
            </NonAuthenticatedRoute>
          }
        />
        {/* Защищенные роуты профиля */}
        <Route
          path='/profile'
          element={
            <AuthenticatedRoute>
              <Profile />
            </AuthenticatedRoute>
          }
        />
        <Route
          path='/profile/orders'
          element={
            <AuthenticatedRoute>
              <ProfileOrders />
            </AuthenticatedRoute>
          }
        />
        {/* Роут ошибки -страница не найдена */}
        <Route path='*' element={<NotFound404 />} />
      </Routes>
    </div>
  );
};

export default App;
