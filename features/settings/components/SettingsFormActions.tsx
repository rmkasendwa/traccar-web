// @ts-nocheck
import { Button } from '@/components/ui';
import { CheckCircleOutlinedIcon } from '@/components/ui/icons';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const SettingsFormActions = ({
  description,
  dirty = true,
  saving = false,
  saved = false,
  valid = true,
  onCancel,
  onSave,
}) => {
  const t = useTranslation();
  const resolvedDescription = description || t('settingsReviewChanges');

  return (
    <div
      className="settings-form-actions preferences-card-wide"
      role="region"
      aria-label={t('settingsFormActions')}
    >
      <div className="settings-form-status" aria-live="polite">
        {saved ? (
          <span className="settings-saved-message">
            <CheckCircleOutlinedIcon fontSize="small" /> {t('sharedSaved')}
          </span>
        ) : (
          <p>{resolvedDescription}</p>
        )}
      </div>
      <Button type="button" color="primary" variant="outlined" onClick={onCancel} disabled={saving}>
        {t('sharedCancel')}
      </Button>
      <Button
        type="button"
        color="primary"
        variant="contained"
        onClick={onSave}
        disabled={!dirty || !valid || saving}
        aria-busy={saving}
      >
        {saving && <span className="settings-save-spinner" aria-hidden="true" />}
        {saving ? t('sharedLoading') : saved ? t('sharedSaved') : t('sharedSave')}
      </Button>
    </div>
  );
};

export default SettingsFormActions;
