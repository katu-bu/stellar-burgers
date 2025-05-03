import React, { ReactNode, useEffect } from 'react';
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
import { useDispatch, useSelector } from '../../services/store';
import { getUser } from '../../services/userSlice';
import { Preloader } from '../ui/preloader';
import { fetchIngredients } from '../../services/ingredientsSlice';

// компонент защищенного роута
interface ProtectedRouteProps {
  children: React.ReactNode;
}

// защищенный роут для залогиненных пользователей
const AuthenticatedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthChecked = useSelector((state) => state.user.isAuthChecked);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthChecked) {
    // прелоадер загрузки данных
    return <Preloader />;
  }
  if (!isAuthenticated) {
    return <Navigate to='/login' replace />;
  }
  return <>{children}</>;
};

// защищенный роут для незалогиненных пользователей
const NonAuthenticatedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthChecked = useSelector((state) => state.user.isAuthChecked);
  const isAuthenticated = useSelector((state) => state.user.isAuthenticated);
  if (!isAuthChecked) {
    // прелоадер загрузки данных
    return <Preloader />;
  }
  if (isAuthenticated) {
    return <Navigate to='/' replace />;
  }
  return <>{children}</>;
};

interface DetailsModalWrapperProps {
  title: string;
  children: ReactNode;
}

// компонент-обертка для отображения модального окна только при переходе через navigate
function DetailsModalWrapper({ title, children }: DetailsModalWrapperProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const handleModalClose = () => {
    navigate(-1);
  };
  const shouldShowModal = location.state?.openModal;

  // если условие выполнено, отражаем как модалку
  if (shouldShowModal) {
    return (
      <Modal title={title} onClose={handleModalClose}>
        {children}
      </Modal>
    );
  }

  return children;
}

const App = () => {
  const location = useLocation();
  // Получение фонового состояния для модалок
  const backgroundLocation = location.state?.backgroundLocation;
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
            <>
              {location.state?.openModal && <Feed />}
              <DetailsModalWrapper title='Детали заказа'>
                <OrderInfo />
              </DetailsModalWrapper>
            </>
          }
        />
        <Route
          path='/ingredients/:id'
          element={
            <>
              {location.state?.openModal && <ConstructorPage />}
              <DetailsModalWrapper title='Детали ингредиента'>
                <IngredientDetails />
              </DetailsModalWrapper>
            </>
          }
        />
        {/* Защищенный роут для модалки с доп информацией по деталям заказа */}
        <Route
          path='/profile/orders/:number'
          element={
            <>
              {location.state?.openModal && (
                <AuthenticatedRoute>
                  <ProfileOrders />
                </AuthenticatedRoute>
              )}
              <AuthenticatedRoute>
                <DetailsModalWrapper title='Детали заказа'>
                  <OrderInfo />
                </DetailsModalWrapper>
              </AuthenticatedRoute>
            </>
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
