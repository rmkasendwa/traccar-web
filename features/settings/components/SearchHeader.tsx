// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Button, TextField } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { AddIcon } from '@/components/ui/icons';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { useNavigate } from '@/lib/router';
import { useRestriction } from '@/lib/permissions';

const useStyles = makeStyles()((theme) => ({
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    gap: theme.spacing(1.5),
    alignItems: 'stretch',
    padding: theme.spacing(3, 2, 2),
  },
  search: {
    flex: 1,
  },
  desktopAction: {
    display: 'none',
    whiteSpace: 'nowrap',
    [theme.breakpoints.up('md')]: {
      display: 'inline-flex',
    },
  },
}));

const SearchHeader = ({ keyword, setKeyword, editPath, addLabel, disabled }) => {
  const { classes } = useStyles();
  const t = useTranslation();
  const navigate = useNavigate();
  const readonly = useRestriction('readonly');
  const itemName = editPath?.split('/').filter(Boolean).pop() || 'item';
  const actionLabel = addLabel || `Add ${itemName}`;

  const [input, setInput] = useState(keyword);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => setKeyword(input), 500);
    return () => clearTimeout(timerRef.current);
  }, [input, setKeyword]);

  return (
    <div className={`${classes.header} settings-search-header`}>
      <TextField
        className={classes.search}
        variant="outlined"
        placeholder={t('sharedSearch')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      {editPath && !readonly && !disabled && (
        <Button
          className={classes.desktopAction}
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate(editPath)}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default SearchHeader;
