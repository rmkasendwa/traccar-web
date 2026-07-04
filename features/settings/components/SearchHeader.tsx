// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { TextField } from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  header: {
    position: 'sticky',
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    padding: theme.spacing(3, 2, 2),
  },
}));

const SearchHeader = ({ keyword, setKeyword }) => {
  const { classes } = useStyles();
  const t = useTranslation();

  const [input, setInput] = useState(keyword);
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => setKeyword(input), 500);
    return () => clearTimeout(timerRef.current);
  }, [input, setKeyword]);

  return (
    <div className={`${classes.header} settings-search-header`}>
      <TextField
        variant="outlined"
        placeholder={t('sharedSearch')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};

export default SearchHeader;
