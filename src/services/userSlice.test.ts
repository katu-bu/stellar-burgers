import userReducer, {
  loginUser,
  updateUser,
  registerUser,
  getUser,
  logoutUser
} from './userSlice';
import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  updateUserApi
} from '@api';
import { TUser } from '@utils-types';
import { deleteCookie } from '../utils/cookie';

// мокаем зависимости
jest.mock('@api');
jest.mock('../utils/cookie');

describe('userSlice', () => {
  // изначальное состояние
  const initialState = {
    isAuthChecked: false,
    isAuthenticated: false,
    data: null,
    loginUserError: null,
    loginUserRequest: false
  };

  // мокаем localStorage
  const localStorageMock = {
    clear: jest.fn()
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });

  // данные для тестов
  const mockUser: TUser = {
    email: 'test@example.com',
    name: 'Test User'
  };

  const mockLoginData = {
    email: 'test@example.com',
    password: 'password123'
  };

  const mockRegisterData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reducer', () => {
    it('должен возвращать начальное состояние', () => {
      expect(userReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });
  });

  describe('loginUser', () => {
    it('должен обрабатывать loginUser.pending', () => {
      const action = { type: loginUser.pending.type };
      const state = userReducer(initialState, action);

      expect(state.loginUserRequest).toBe(true);
      expect(state.loginUserError).toBe(null);
      expect(state.isAuthChecked).toBe(false);
    });

    it('должен обрабатывать loginUser.fulfilled', () => {
      const action = {
        type: loginUser.fulfilled.type,
        payload: mockUser
      };
      const state = userReducer(initialState, action);

      expect(state.data).toEqual(mockUser);
      expect(state.loginUserRequest).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
    });

    it('должен обрабатывать loginUser.rejected', () => {
      const action = {
        type: loginUser.rejected.type,
        payload: 'Ошибка входа'
      };
      const state = userReducer(initialState, action);

      expect(state.loginUserRequest).toBe(false);
      expect(state.loginUserError).toBe('Ошибка входа');
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe('registerUser', () => {
    it('должен обрабатывать registerUser.pending', () => {
      const action = { type: registerUser.pending.type };
      const state = userReducer(initialState, action);

      expect(state.loginUserRequest).toBe(true);
      expect(state.loginUserError).toBe(null);
      expect(state.isAuthChecked).toBe(false);
    });

    it('должен обрабатывать registerUser.fulfilled', () => {
      const action = {
        type: registerUser.fulfilled.type,
        payload: mockUser
      };
      const state = userReducer(initialState, action);

      expect(state.data).toEqual(mockUser);
      expect(state.loginUserRequest).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
    });

    it('должен обрабатывать registerUser.rejected', () => {
      const action = {
        type: registerUser.rejected.type,
        payload: 'Ошибка регистрации'
      };
      const state = userReducer(initialState, action);

      expect(state.loginUserRequest).toBe(false);
      expect(state.loginUserError).toBe('Ошибка регистрации');
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe('getUser', () => {
    it('должен обрабатывать getUser.pending', () => {
      const action = { type: getUser.pending.type };
      const state = userReducer(initialState, action);

      expect(state.isAuthChecked).toBe(false);
    });

    it('должен обрабатывать getUser.fulfilled', () => {
      const action = {
        type: getUser.fulfilled.type,
        payload: mockUser
      };
      const state = userReducer(initialState, action);

      expect(state.data).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isAuthChecked).toBe(true);
    });

    it('должен обрабатывать getUser.rejected', () => {
      const action = { type: getUser.rejected.type };
      const state = userReducer(initialState, action);

      expect(state.isAuthenticated).toBe(false);
      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('должен обрабатывать updateUser.fulfilled', () => {
      const action = {
        type: updateUser.fulfilled.type,
        payload: mockUser
      };
      const state = userReducer(initialState, action);

      expect(state.data).toEqual(mockUser);
    });
  });

  describe('logoutUser', () => {
    it('должен обрабатывать logoutUser.pending', () => {
      const action = { type: logoutUser.pending.type };
      const state = userReducer(initialState, action);

      expect(state.isAuthChecked).toBe(false);
    });

    it('должен обрабатывать logoutUser.fulfilled', () => {
      const action = { type: logoutUser.fulfilled.type };
      const state = userReducer(initialState, action);

      expect(state.isAuthChecked).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.data).toBe(null);
      expect(state.loginUserError).toBe(null);
      expect(state.loginUserRequest).toBe(false);
    });

    it('должен обрабатывать logoutUser.rejected', () => {
      const action = { type: logoutUser.rejected.type };
      const state = userReducer(initialState, action);

      expect(state.isAuthChecked).toBe(true);
    });
  });

  describe('async actions', () => {
    describe('loginUser', () => {
      it('должен вызывать loginUserApi при успешном логине', async () => {
        const mockResponse = { ...mockUser };
        (loginUserApi as jest.Mock).mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = loginUser(mockLoginData);

        await thunk(dispatch, () => ({}), undefined);

        expect(loginUserApi).toHaveBeenCalledWith(mockLoginData);
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: loginUser.fulfilled.type,
            payload: mockResponse
          })
        );
      });

      it('должен обрабатывать ошибку при неудачном логине', async () => {
        const errorMessage = 'Ошибка входа';
        (loginUserApi as jest.Mock).mockRejectedValue(new Error(errorMessage));

        const dispatch = jest.fn();
        const thunk = loginUser(mockLoginData);

        await thunk(dispatch, () => ({}), undefined);

        expect(loginUserApi).toHaveBeenCalledWith(mockLoginData);
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: loginUser.rejected.type
          })
        );
      });
    });

    describe('registerUser', () => {
      it('должен вызывать registerUserApi при успешной регистрации', async () => {
        const mockResponse = { ...mockUser };
        (registerUserApi as jest.Mock).mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = registerUser(mockRegisterData);

        await thunk(dispatch, () => ({}), undefined);

        expect(registerUserApi).toHaveBeenCalledWith(mockRegisterData);
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: registerUser.fulfilled.type,
            payload: mockResponse
          })
        );
      });
    });

    describe('getUser', () => {
      it('должен вызывать getUserApi при запросе пользователя', async () => {
        const mockResponse = { ...mockUser };
        (getUserApi as jest.Mock).mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = getUser();

        await thunk(dispatch, () => ({}), undefined);

        expect(getUserApi).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: getUser.fulfilled.type,
            payload: mockResponse
          })
        );
      });
    });

    describe('updateUser', () => {
      it('должен вызывать updateUserApi при обновлении пользователя', async () => {
        const mockResponse = { ...mockUser };
        (updateUserApi as jest.Mock).mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = updateUser(mockRegisterData);

        await thunk(dispatch, () => ({}), undefined);

        expect(updateUserApi).toHaveBeenCalledWith(mockRegisterData);
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: updateUser.fulfilled.type,
            payload: mockResponse
          })
        );
      });
    });

    describe('logoutUser', () => {
      it('должен вызывать logoutApi и очищать данные при выходе', async () => {
        const mockResponse = { success: true };
        (logoutApi as jest.Mock).mockResolvedValue(mockResponse);

        const dispatch = jest.fn();
        const thunk = logoutUser();

        await thunk(dispatch, () => ({}), undefined);

        expect(logoutApi).toHaveBeenCalled();
        expect(deleteCookie).toHaveBeenCalledWith('accessToken');
        expect(localStorageMock.clear).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(
          expect.objectContaining({
            type: logoutUser.fulfilled.type,
            payload: mockResponse
          })
        );
      });
    });
  });
});
