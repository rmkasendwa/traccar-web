// @ts-nocheck
import { useTheme, useMediaQuery } from '@/components/ui';
import { useSelector } from 'react-redux';
import { makeStyles } from '@/components/ui/styles';

const useStyles = makeStyles()((theme) => ({
  image: {
    alignSelf: 'center',
    maxWidth: '240px',
    maxHeight: '120px',
    width: 'auto',
    height: 'auto',
    margin: theme.spacing(2),
  },
}));

const LogoImage = ({ color }) => {
  const theme = useTheme();
  const { classes } = useStyles();

  const expanded = !useMediaQuery(theme.breakpoints.down('lg'));

  const logo = useSelector((state) => state.session.server.attributes?.logo);
  const logoInverted = useSelector((state) => state.session.server.attributes?.logoInverted);

  if (logo) {
    if (expanded && logoInverted) {
      return <img className={classes.image} src={logoInverted} alt="" />;
    }
    return <img className={classes.image} src={logo} alt="" />;
  }
  return (
    <span
      className={classes.image}
      role="img"
      aria-label="Traccar"
      style={{
        display: 'block',
        width: 240,
        height: 64,
        backgroundColor: color,
        mask: 'url(/logo-wordmark.svg) center / contain no-repeat',
        WebkitMask: 'url(/logo-wordmark.svg) center / contain no-repeat',
      }}
    />
  );
};

export default LogoImage;
