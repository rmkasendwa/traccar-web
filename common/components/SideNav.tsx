// @ts-nocheck
import { Fragment } from 'react';
import {
  List,
  ListItemText,
  ListItemIcon,
  Divider,
  ListSubheader,
  ListItemButton,
} from '@/components/ui';
import { Link, useLocation } from '@/lib/router';

const SideNav = ({ routes }) => {
  const location = useLocation();

  return (
    <List disablePadding style={{ paddingTop: '16px' }}>
      {routes.map((route) =>
        route.subheader ? (
          <Fragment key={route.subheader}>
            <Divider />
            <ListSubheader>{route.subheader}</ListSubheader>
          </Fragment>
        ) : (
          <ListItemButton
            disableRipple
            component={Link}
            key={route.href}
            to={route.href}
            selected={location.pathname.match(route.match || route.href) !== null}
          >
            <ListItemIcon>{route.icon}</ListItemIcon>
            <ListItemText primary={route.name} />
          </ListItemButton>
        ),
      )}
    </List>
  );
};

export default SideNav;
