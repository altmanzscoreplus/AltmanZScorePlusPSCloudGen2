import type { FC } from 'react';
import { formatDistanceToNowStrict, subDays, subHours, subMinutes } from 'date-fns';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { Presence } from 'src/components/presence';

const now = new Date();

interface Contact {
  id: string;
  avatar: string;
  isActive: boolean;
  lastActivity: number;
  name: string;
}

const contacts: Contact[] = [
  {
    id: '5e8891ab188cd2855e6029b7',
    avatar: '/assets/avatars/avatar-ken-kious.png',
    isActive: true,
    lastActivity: now.getTime(),
    name: 'Ken Kious',
  },
  {
    id: '5e887a62195cc5aef7e8ca5d',
    avatar: '/assets/avatars/avatar-ricky-montano.png',
    isActive: false,
    lastActivity: subHours(now, 2).getTime(),
    name: 'Ricky Montano Jr',
  },
  {
    id: '5e887ac47eed253091be10cb',
    avatar: '/assets/avatars/avatar-siegbert-gottfried.png',
    isActive: false,
    lastActivity: subMinutes(now, 15).getTime(),
    name: 'Jason Steiner',
  },
  {
    id: '5e887b209c28ac3dd97f6db5',
    avatar: '/assets/avatars/avatar-jie-yan-song.png',
    isActive: true,
    lastActivity: now.getTime(),
    name: 'Vincent Trinh',
  },
  {
    id: '5e887b7602bdbc4dbb234b27',
    avatar: '/assets/avatars/avatar-jane-rotanson.png',
    isActive: true,
    lastActivity: now.getTime(),
    name: 'Grace N',
  },
  {
    id: '5e86805e2bafd54f66cc95c3',
    avatar: '/assets/avatars/avatar-miron-vitold.png',
    isActive: false,
    lastActivity: subDays(now, 2).getTime(),
    name: 'Miron Bob',
  },
  {
    id: '5e887a1fbefd7938eea9c981',
    avatar: '/assets/avatars/avatar-penjani-inyene.png',
    isActive: false,
    lastActivity: subHours(now, 6).getTime(),
    name: 'Penjani Inyene',
  },
  {
    id: '5e887d0b3d090c1b8f162003',
    avatar: '/assets/avatars/avatar-omar-darboe.png',
    isActive: true,
    lastActivity: now.getTime(),
    name: 'Omar Darobe',
  },
  {
    id: '5e88792be2d4cfb4bf0971d9',
    avatar: '/assets/avatars/avatar-siegbert-gottfried.png',
    isActive: true,
    lastActivity: now.getTime(),
    name: 'Jason Steiner',
  },
  {
    id: '5e8877da9a65442b11551975',
    avatar: '/assets/avatars/avatar-iulia-albu.png',
    isActive: true,
    lastActivity: now.getTime(),
    name: 'Iulia Albu',
  },
  {
    id: '5e8680e60cba5019c5ca6fda',
    avatar: '/assets/avatars/avatar-nasimiyu-danai.png',
    isActive: true,
    lastActivity: now.getTime(),
    name: 'Nasimiyu Danai',
  },
];

export const Modal4: FC = () => (
  <Box
    sx={{
      backgroundColor: (theme) => (theme.palette.mode === 'dark' ? 'neutral.800' : 'neutral.100'),
      p: 3,
    }}
  >
    <Paper
      elevation={12}
      sx={{
        maxWidth: 320,
        mx: 'auto',
        p: 2,
      }}
    >
      <Typography variant="h6">Contacts</Typography>
      <Box sx={{ mt: 2 }}>
        <List disablePadding>
          {contacts.map((contact) => {
            const showOnline = contact.isActive;
            const lastActivity =
              !contact.isActive && contact.lastActivity
                ? formatDistanceToNowStrict(contact.lastActivity)
                : undefined;

            return (
              <ListItem
                disableGutters
                key={contact.id}
              >
                <ListItemAvatar>
                  <Avatar src={contact.avatar} />
                </ListItemAvatar>
                <ListItemText
                  disableTypography
                  primary={
                    <Link
                      color="text.primary"
                      noWrap
                      underline="none"
                      variant="subtitle2"
                    >
                      {contact.name}
                    </Link>
                  }
                />
                {showOnline && (
                  <Presence
                    size="small"
                    status="online"
                  />
                )}
                {lastActivity && (
                  <Typography
                    color="text.secondary"
                    noWrap
                    variant="caption"
                  >
                    {lastActivity} ago
                  </Typography>
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Paper>
  </Box>
);
