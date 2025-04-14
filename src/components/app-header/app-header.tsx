import { FC } from 'react';
import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';

// отражение в шапке имени пользователя
export const AppHeader: FC = () => {
  const userName = useSelector((state) => state.user.data?.name);
  return <AppHeaderUI userName={userName} />;
};
