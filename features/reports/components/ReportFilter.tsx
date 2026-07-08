// @ts-nocheck
import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from '@/lib/router';
import { Button, TextField, Typography } from '@/components/ui';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useTranslation } from '@/providers/localization/LocalizationProvider';
import SplitButton from '@/components/ui/SplitButton';
import SelectField from '@/components/ui/SelectField';
import { useRestriction } from '@/lib/permissions';
import { deviceEquality } from '@/features/devices/lib/deviceEquality';
import { ChevronsRight, RotateCcw, SlidersHorizontal } from 'lucide-react';

const FIELD_MIN_WIDTH = 224;
const FIELD_GAP = 12;
const OVERFLOW_BUTTON_WIDTH = 40;

const flattenChildren = (children) =>
  Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );

const OverflowFilterRow = ({ children, actions }) => {
  const fields = flattenChildren(children);
  const containerRef = useRef(null);
  const actionsRef = useRef(null);
  const overflowRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(fields.length);
  const [overflowOpen, setOverflowOpen] = useState(false);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const actionsElement = actionsRef.current;
    if (!container || !actionsElement) return undefined;

    const updateVisibleCount = () => {
      const width = container.clientWidth;
      const actionsWidth = actionsElement.getBoundingClientRect().width;
      const allFieldsWidth = fields.length * FIELD_MIN_WIDTH + fields.length * FIELD_GAP;

      if (width >= actionsWidth + allFieldsWidth) {
        setVisibleCount(fields.length);
        return;
      }

      const available = width - actionsWidth - OVERFLOW_BUTTON_WIDTH - FIELD_GAP * 2;
      setVisibleCount(
        Math.max(
          0,
          Math.min(
            fields.length - 1,
            Math.floor((available + FIELD_GAP) / (FIELD_MIN_WIDTH + FIELD_GAP)),
          ),
        ),
      );
    };

    const observer = new ResizeObserver(updateVisibleCount);
    observer.observe(container);
    observer.observe(actionsElement);
    updateVisibleCount();
    return () => observer.disconnect();
  }, [fields.length]);

  const overflowFields = fields.slice(visibleCount);

  useEffect(() => {
    if (!overflowFields.length) setOverflowOpen(false);
  }, [overflowFields.length]);

  useEffect(() => {
    if (!overflowOpen) return undefined;
    const close = (event) => {
      if (!overflowRef.current?.contains(event.target)) setOverflowOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [overflowOpen]);

  return (
    <div ref={containerRef} className="relative flex min-w-0 items-end gap-3">
      {fields.slice(0, visibleCount).map((field, index) => (
        <div key={`visible-filter-${index}`} className="min-w-56 flex-1">
          {field}
        </div>
      ))}
      {overflowFields.length > 0 && (
        <div ref={overflowRef} className="relative shrink-0">
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOverflowOpen((open) => !open)}
            aria-label="Show more report filters"
            aria-expanded={overflowOpen}
            title="More filters"
            className="h-10 min-w-10 rounded-xl border-(--color-divider) px-2 text-(--color-muted)"
          >
            <ChevronsRight size={18} />
          </Button>
          {overflowOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-3 rounded-xl border border-(--color-divider) bg-(--color-paper) p-4 shadow-xl">
              {overflowFields.map((field, index) => (
                <div key={`overflow-filter-${visibleCount + index}`} className="min-w-0">
                  {field}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div ref={actionsRef} className="min-w-56 shrink-0">
        {actions}
      </div>
    </div>
  );
};

export const updateReportParams = (searchParams, setSearchParams, key, values) => {
  const newParams = new URLSearchParams(searchParams);
  newParams.delete(key);
  newParams.delete('from');
  newParams.delete('to');
  values.forEach((value) => newParams.append(key, value));
  setSearchParams(newParams, { replace: true });
};

const ReportFilter = ({ children, onShow, onExport, onSchedule, deviceType, loading, formats }) => {
  const t = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const readonly = useRestriction('readonly');

  const devices = useSelector((state) => state.devices.items, deviceEquality(['id', 'name']));
  const groups = useSelector((state) => state.groups.items);
  const deviceList = useMemo(
    () => [
      { id: 'all', name: t('notificationAlways') },
      ...Object.values(devices).sort((a, b) => a.name.localeCompare(b.name)),
    ],
    [devices, t],
  );
  const groupList = useMemo(
    () => Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)),
    [groups],
  );

  const deviceIds = useMemo(
    () => searchParams.getAll('deviceId').map((it) => (it === 'all' ? it : Number(it))),
    [searchParams],
  );
  const groupIds = useMemo(() => searchParams.getAll('groupId').map(Number), [searchParams]);
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const [period, setPeriod] = useState('today');
  const [customFrom, setCustomFrom] = useState(() =>
    dayjs().subtract(1, 'hour').locale('en').format('YYYY-MM-DDTHH:mm'),
  );
  const [customTo, setCustomTo] = useState(() => dayjs().locale('en').format('YYYY-MM-DDTHH:mm'));
  const [selectedOption, setSelectedOption] = useState('json');

  const [description, setDescription] = useState();
  const [calendarId, setCalendarId] = useState();
  const periodOptions = useMemo(
    () => [
      { id: 'today', name: t('reportToday') },
      { id: 'yesterday', name: t('reportYesterday') },
      { id: 'thisWeek', name: t('reportThisWeek') },
      { id: 'previousWeek', name: t('reportPreviousWeek') },
      { id: 'thisMonth', name: t('reportThisMonth') },
      { id: 'previousMonth', name: t('reportPreviousMonth') },
      { id: 'custom', name: t('reportCustom') },
    ],
    [t],
  );

  const evaluateDisabled = () => {
    if (deviceType === 'single' && !deviceIds.length) {
      return true;
    }
    if (deviceType === 'multiple' && !deviceIds.length && !groupIds.length) {
      return true;
    }
    if (selectedOption === 'schedule' && (!description || !calendarId)) {
      return true;
    }
    return loading;
  };
  const disabled = evaluateDisabled();
  const loaded = from && to && !loading;

  const evaluateOptions = () => {
    const result = {
      json: t('reportShow'),
    };
    if (onExport && loaded) {
      formats.forEach((format) => {
        result[format] = `${t('reportExport')} (${format.toUpperCase()})`;
      });
      result.print = t('reportPrint');
    }
    if (onSchedule && !readonly) {
      result.schedule = t('reportSchedule');
    }
    return result;
  };
  const options = evaluateOptions();

  useEffect(() => {
    if (from && to) {
      onShow({ deviceIds: deviceIds.filter((it) => it !== 'all'), groupIds, from, to });
    }
  }, [deviceIds, groupIds, from, to, onShow]);

  const showReport = () => {
    let selectedFrom;
    let selectedTo;
    switch (period) {
      case 'today':
        selectedFrom = dayjs().startOf('day');
        selectedTo = dayjs().endOf('day');
        break;
      case 'yesterday':
        selectedFrom = dayjs().subtract(1, 'day').startOf('day');
        selectedTo = dayjs().subtract(1, 'day').endOf('day');
        break;
      case 'thisWeek':
        selectedFrom = dayjs().startOf('week');
        selectedTo = dayjs().endOf('week');
        break;
      case 'previousWeek':
        selectedFrom = dayjs().subtract(1, 'week').startOf('week');
        selectedTo = dayjs().subtract(1, 'week').endOf('week');
        break;
      case 'thisMonth':
        selectedFrom = dayjs().startOf('month');
        selectedTo = dayjs().endOf('month');
        break;
      case 'previousMonth':
        selectedFrom = dayjs().subtract(1, 'month').startOf('month');
        selectedTo = dayjs().subtract(1, 'month').endOf('month');
        break;
      default:
        selectedFrom = dayjs(customFrom, 'YYYY-MM-DDTHH:mm');
        selectedTo = dayjs(customTo, 'YYYY-MM-DDTHH:mm');
        break;
    }

    const newParams = new URLSearchParams(searchParams);
    newParams.set('from', selectedFrom.toISOString());
    newParams.set('to', selectedTo.toISOString());
    setSearchParams(newParams, { replace: true });
  };

  const onSelected = (type) => {
    switch (type) {
      case 'xlsx':
      case 'csv':
      case 'gpx':
      case 'kml':
      case 'kmz':
        onExport({
          deviceIds: deviceIds.filter((it) => it !== 'all'),
          groupIds,
          from,
          to,
          format: type,
        });
        break;
      case 'print':
        window.print();
        break;
      default:
        setSelectedOption(type);
        break;
    }
  };

  const onClick = (type) => {
    switch (type) {
      case 'schedule':
        onSchedule(
          deviceIds.filter((it) => it !== 'all'),
          groupIds,
          {
            description,
            calendarId,
            attributes: {},
          },
        );
        break;
      case 'json':
      default:
        showReport();
        break;
    }
  };

  const resetFilters = () => {
    setPeriod('today');
    setSelectedOption('json');
    setDescription(undefined);
    setCalendarId(undefined);
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  const reportActions = (
    <div className="flex min-w-0 gap-2">
      <div className="min-w-0 flex-1">
        {Object.keys(options).length === 1 ? (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            disabled={disabled}
            onClick={onClick}
            className="rounded-xl bg-sky-600 font-semibold shadow-sm hover:bg-sky-500"
          >
            <Typography variant="button" noWrap>
              {t(loading ? 'sharedLoading' : 'reportShow')}
            </Typography>
          </Button>
        ) : (
          <SplitButton
            fullWidth
            variant="contained"
            color="primary"
            disabled={disabled}
            onClick={onClick}
            selected={selectedOption}
            setSelected={onSelected}
            options={options}
            className="[&>button]:bg-sky-600 [&>button]:font-semibold [&>button]:shadow-sm [&>button:hover]:bg-sky-500 [&>button:first-child]:rounded-l-xl [&>button:last-child]:rounded-r-xl"
          />
        )}
      </div>
      {searchParams.size > 0 && (
        <Button
          variant="outlined"
          color="primary"
          onClick={resetFilters}
          aria-label="Reset report filters"
          title="Reset filters"
          className="rounded-xl border-(--color-divider) px-3 text-(--color-muted) hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950"
        >
          <RotateCcw size={16} />
        </Button>
      )}
    </div>
  );

  return (
    <section className="border-b border-(--color-divider) bg-(--color-paper) p-4 print:hidden sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          <SlidersHorizontal size={17} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-(--color-text)">Report criteria</h2>
          <p className="text-xs text-(--color-muted)">
            Choose what to include, then generate your report.
          </p>
        </div>
      </div>
      <OverflowFilterRow actions={reportActions}>
        {deviceType !== 'none' && (
          <div className="min-w-0">
            <SelectField
              label={t(deviceType === 'multiple' ? 'deviceTitle' : 'reportDevice')}
              data={
                deviceType === 'multiple' ? deviceList : deviceList.filter((it) => it.id !== 'all')
              }
              value={deviceType === 'multiple' ? deviceIds : deviceIds.find(() => true)}
              allValue="all"
              onChange={(e) => {
                const values =
                  deviceType === 'multiple' ? e.target.value : [e.target.value].filter((id) => id);
                updateReportParams(searchParams, setSearchParams, 'deviceId', values);
              }}
              multiple={deviceType === 'multiple'}
              singleLine={deviceType === 'multiple'}
              fullWidth
            />
          </div>
        )}
        {deviceType === 'multiple' && (
          <div className="min-w-0">
            <SelectField
              label={t('settingsGroups')}
              data={groupList}
              value={groupIds}
              onChange={(e) => {
                const values = e.target.value;
                updateReportParams(searchParams, setSearchParams, 'groupId', values);
              }}
              multiple
              singleLine
              fullWidth
            />
          </div>
        )}
        {selectedOption !== 'schedule' ? (
          <>
            <div className="min-w-0">
              <SelectField
                label={t('reportPeriod')}
                data={periodOptions}
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                fullWidth
              />
            </div>
            {period === 'custom' && (
              <div className="min-w-0">
                <TextField
                  label={t('reportFrom')}
                  type="datetime-local"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  fullWidth
                />
              </div>
            )}
            {period === 'custom' && (
              <div className="min-w-0">
                <TextField
                  label={t('reportTo')}
                  type="datetime-local"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  fullWidth
                />
              </div>
            )}
          </>
        ) : (
          <>
            <div className="min-w-0">
              <TextField
                value={description || ''}
                onChange={(event) => setDescription(event.target.value)}
                label={t('sharedDescription')}
                fullWidth
              />
            </div>
            <div className="min-w-0">
              <SelectField
                value={calendarId}
                onChange={(event) => setCalendarId(Number(event.target.value))}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
                fullWidth
              />
            </div>
          </>
        )}
        {children}
      </OverflowFilterRow>
    </section>
  );
};

export default ReportFilter;
