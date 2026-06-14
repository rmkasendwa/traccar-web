// @ts-nocheck
import { useState } from 'react';
import { IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@/components/ui';
import { Tooltip } from '@/components/ui';
import { MoreVertIcon } from '@/components/ui/icons';
import { EditIcon } from '@/components/ui/icons';
import { DeleteIcon } from '@/components/ui/icons';
import { useNavigate } from '@/lib/router';
import { makeStyles } from '@/components/ui/styles';
import RemoveDialog from '@/components/ui/RemoveDialog';
import { useTranslation } from '@/providers/localization/LocalizationProvider';

const useStyles = makeStyles()(() => ({
  row: {
    display: 'flex',
  },
}));

const CollectionActions = ({ itemId, editPath, endpoint, onReload, customActions, readonly }) => {
  const theme = useTheme();
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const phone = useMediaQuery(theme.breakpoints.down('sm'));

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [removing, setRemoving] = useState(false);

  const handleEdit = () => {
    navigate(`${editPath}/${itemId}`);
    setMenuAnchorEl(null);
  };

  const handleRemove = () => {
    setRemoving(true);
    setMenuAnchorEl(null);
  };

  const handleCustom = (action) => {
    action.handler(itemId);
    setMenuAnchorEl(null);
  };

  const handleRemoveResult = (removed) => {
    setRemoving(false);
    if (removed) {
      onReload();
    }
  };

  return (
    <>
      {phone ? (
        <>
          <IconButton size="small" onClick={(event) => setMenuAnchorEl(event.currentTarget)}>
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu open={!!menuAnchorEl} anchorEl={menuAnchorEl} onClose={() => setMenuAnchorEl(null)}>
            {customActions &&
              customActions.map((action) => (
                <MenuItem onClick={() => handleCustom(action)} key={action.key}>
                  {action.title}
                </MenuItem>
              ))}
            {!readonly && (
              <>
                {editPath && <MenuItem onClick={handleEdit}>{t('sharedEdit')}</MenuItem>}
                <MenuItem onClick={handleRemove}>{t('sharedRemove')}</MenuItem>
              </>
            )}
          </Menu>
        </>
      ) : (
        <div className={classes.row}>
          {customActions &&
            customActions.map((action) => (
              <Tooltip title={action.title} key={action.key}>
                <IconButton size="small" onClick={() => handleCustom(action)}>
                  {action.icon}
                </IconButton>
              </Tooltip>
            ))}
          {!readonly && (
            <>
              {editPath && (
                <Tooltip title={t('sharedEdit')}>
                  <IconButton size="small" onClick={handleEdit}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title={t('sharedRemove')}>
                <IconButton size="small" onClick={handleRemove}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      )}
      <RemoveDialog
        style={{ transform: 'none' }}
        open={removing}
        endpoint={endpoint}
        itemId={itemId}
        onResult={handleRemoveResult}
      />
    </>
  );
};

export default CollectionActions;
