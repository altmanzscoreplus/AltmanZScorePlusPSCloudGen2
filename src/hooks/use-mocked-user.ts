import type { User } from 'src/types/user';

export const useMockedUser = (): User => {
  // To get the user from the authContext, you can use
  // `const { user } = useAuth();`
  return {
    id: '5e86809283e28b96d2d38537',
    avatar: '/assets/avatars/avatar-ken-kious.png',
    name: 'Ken Kious',
    email: 'kenk@powersight.com',
  };
};
