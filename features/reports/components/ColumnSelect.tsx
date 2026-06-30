// @ts-nocheck
import { FormControl, InputLabel, MenuItem, Select } from '@/components/ui';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const ColumnSelect = ({ columns, setColumns, columnsArray, rawValues, disabled }) => {
  const t = useTranslation();

  return (
    <div className="min-w-0">
      <FormControl fullWidth>
        <InputLabel>{t('sharedColumns')}</InputLabel>
        <Select
          label={t('sharedColumns')}
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          multiple
          disabled={disabled}
        >
          {columnsArray.map(([key, string]) => (
            <MenuItem key={key} value={key}>
              {rawValues ? string : t(string)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default ColumnSelect;
