import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { useSelector } from 'react-redux';
import { RootState } from 'src/services/store';

// отражение в шапке имени пользователя
export const AppHeader: FC = () => {
  const userName = useSelector((state: RootState) => state.user.data?.name);
  return <AppHeaderUI userName={userName} />;
};
