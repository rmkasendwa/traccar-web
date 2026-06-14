// @ts-nocheck
import { makeStyles } from '@/components/ui/styles';
import { ListItemButton, ListItemIcon, ListItemText } from '@/components/ui';
import { Link } from '@/lib/router';

const useStyles = makeStyles()(() => ({
  menuItemText: {
    whiteSpace: 'nowrap',
  },
}));

const MenuItem = ({ title, link, icon, selected }) => {
  const { classes } = useStyles();
  return (
    <ListItemButton key={link} component={Link} to={link} selected={selected}>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={title} className={classes.menuItemText} />
    </ListItemButton>
  );
};

export default MenuItem;
