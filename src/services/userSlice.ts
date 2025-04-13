import {
  getUserApi,
  loginUserApi,
  logoutApi,
  registerUserApi,
  TLoginData,
  TRegisterData,
  updateUserApi
} from '@api';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { TUser } from '@utils-types';
import { deleteCookie } from '../utils/cookie';

type TUserState = {
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  data: TUser | null;
  loginUserError: string | null;
  loginUserRequest: boolean;
};

const initialState: TUserState = {
  isAuthChecked: false, // проверка токена пользователя
  isAuthenticated: false,
  data: null,
  loginUserError: null,
  loginUserRequest: false
};

export const loginUser = createAsyncThunk(
  'user/loginUser',
  async ({ email, password }: TLoginData) =>
    await loginUserApi({ email, password })
);
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: TRegisterData) => await updateUserApi(data)
);
export const registerUser = createAsyncThunk(
  'user/registerData',
  async (data: TRegisterData) => await registerUserApi(data)
);
export const getUser = createAsyncThunk(
  'user/getUser',
  async () => await getUserApi()
);
export const logoutUser = createAsyncThunk('user/logout', async () => {
  const response = await logoutApi();
  deleteCookie('accessToken');
  localStorage.clear();
  return response;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isAuthChecked = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthChecked = true;
        state.isAuthenticated = false;
        state.data = null;
        state.loginUserError = null;
        state.loginUserRequest = false;
      })
      .addCase(updateUser.pending, () => {})
      .addCase(updateUser.rejected, () => {})
      .addCase(updateUser.fulfilled, (state, action) => {
        state.data = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
        state.isAuthChecked = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.payload as string;
        state.isAuthChecked = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loginUserRequest = false;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.pending, (state) => {
        state.loginUserRequest = true;
        state.loginUserError = null;
        state.isAuthChecked = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loginUserRequest = false;
        state.loginUserError = action.payload as string;
        state.isAuthChecked = true;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loginUserRequest = false;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(getUser.pending, (state) => {
        state.isAuthChecked = false;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isAuthenticated = false;
        state.isAuthChecked = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      });
  }
});

export const userReducer = userSlice.reducer;
export default userReducer;
