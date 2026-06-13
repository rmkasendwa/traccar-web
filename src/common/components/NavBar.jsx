import { AppBar, Toolbar, Typography, IconButton } from '@/components/ui';
import { MenuIcon } from '@/components/icons';

const Navbar = ({ setOpenDrawer, title }) => (
  <AppBar position="sticky" color="inherit">
    <Toolbar>
      <IconButton color="inherit" edge="start" sx={{ mr: 2 }} onClick={() => setOpenDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Typography variant="h6" noWrap>
        {title}
      </Typography>
    </Toolbar>
  </AppBar>
);

export default Navbar;
