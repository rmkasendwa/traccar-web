// @ts-nocheck
import { useEffect } from 'react';
import { useNavigate } from '@/lib/router';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  Tooltip,
} from '@/components/ui';
import { makeStyles } from '@/components/ui/styles';
import { CheckCircleOutlinedIcon as CheckCircleOutlineIcon } from '@/components/ui/icons';
import { HelpOutlinedIcon as HelpOutlineIcon } from '@/components/ui/icons';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import { sessionActions } from '@/store';
import ReportEmptyState from '@/features/reports/components/ReportEmptyState';

const useStyles = makeStyles()((theme) => ({
  columnAction: {
    width: '1%',
    paddingLeft: theme.spacing(1),
  },
}));

const LogsPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  useEffect(() => {
    dispatch(sessionActions.enableLogs(true));
    return () => dispatch(sessionActions.enableLogs(false));
  }, [dispatch]);

  const items = useSelector((state) => state.session.logs);

  const registerDevice = (uniqueId) => {
    const query = new URLSearchParams({ uniqueId });
    navigate(`/settings/device?${query.toString()}`);
  };

  return (
    <div className="report-page">
      {!items.length ? (
        <ReportEmptyState
          title="Waiting for device logs"
          description="Incoming device communication will appear here in real time."
        />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell className={classes.columnAction} />
              <TableCell>{t('deviceIdentifier')}</TableCell>
              <TableCell>{t('positionProtocol')}</TableCell>
              <TableCell>{t('commandData')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className={classes.columnAction} padding="none">
                  {item.deviceId ? (
                    <IconButton color="success" size="small" disabled>
                      <CheckCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <Tooltip title={t('loginRegister')}>
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => registerDevice(item.uniqueId)}
                      >
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>{item.uniqueId}</TableCell>
                <TableCell>{item.protocol}</TableCell>
                <TableCell>{item.data}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default LogsPage;
