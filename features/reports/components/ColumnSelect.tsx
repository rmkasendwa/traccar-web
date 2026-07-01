// @ts-nocheck
import SelectField from '@/components/ui/SelectField';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const ColumnSelect = ({ columns, setColumns, columnsArray, rawValues, disabled }) => {
  const t = useTranslation();

  return (
    <div className="min-w-0">
      <SelectField
        label={t('sharedColumns')}
        data={columnsArray.map(([id, title]) => ({ id, name: rawValues ? title : t(title) }))}
        value={columns}
        onChange={(e) => setColumns(e.target.value)}
        multiple
        singleLine
        disabled={disabled}
        fullWidth
      />
    </div>
  );
};

export default ColumnSelect;
