// @ts-nocheck
import { Fab } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { AddIcon } from '@/components/ui/icons';
import { useNavigate } from '@/lib/router';
import { useRestriction } from '@/lib/permissions';

const useStyles = makeStyles()((theme) => ({
  fab: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(2)})`,
    },
  },
}));

const CollectionFab = ({ editPath, disabled }) => {
  const { classes } = useStyles();
  const navigate = useNavigate();

  const readonly = useRestriction('readonly');

  if (!readonly && !disabled) {
    return (
      <div className={classes.fab}>
        <Fab size="medium" color="primary" onClick={() => navigate(editPath)}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
  return '';
};

export default CollectionFab;
