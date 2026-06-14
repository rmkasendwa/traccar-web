// @ts-nocheck
import { Button } from '@/components/ui';
import { Snackbar } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { useCatch } from '@/lib/react';
import { snackBarDurationLongMs } from '@/lib/duration';
import fetchOrThrow from '@/lib/api/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    [theme.breakpoints.down('md')]: {
      bottom: `calc(${theme.dimensions.bottomBarHeight}px + ${theme.spacing(1)})`,
    },
  },
  button: {
    height: 'auto',
    marginTop: 0,
    marginBottom: 0,
  },
}));

const RemoveDialog = ({ open, endpoint, itemId, onResult }) => {
  const { classes } = useStyles();
  const t = useTranslation();

  const handleRemove = useCatch(async () => {
    await fetchOrThrow(`/api/${endpoint}/${itemId}`, { method: 'DELETE' });
    onResult(true);
  });

  return (
    <Snackbar
      className={classes.root}
      open={open}
      autoHideDuration={snackBarDurationLongMs}
      onClose={() => onResult(false)}
      message={t('sharedRemoveConfirm')}
      action={
        <Button size="small" className={classes.button} color="error" onClick={handleRemove}>
          {t('sharedRemove')}
        </Button>
      }
    />
  );
};

export default RemoveDialog;
