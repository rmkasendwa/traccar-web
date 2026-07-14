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
import { ChevronsRight, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

const FIELD_MIN_WIDTH = 224;
const FIELD_GAP = 12;
const OVERFLOW_BUTTON_WIDTH = 40;
const COMPACT_LABEL_WIDTH = 40;

const flattenChildren = (children) =>
  Children.toArray(children).flatMap((child) =>
    isValidElement(child) && child.type === Fragment
      ? flattenChildren(child.props.children)
      : [child],
  );

const OverflowFilterRow = ({ children, actions, compactLabel }) => {
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
      const compactLabelVisible =
        compactLabel && window.matchMedia('(max-width: 700px), (max-height: 760px)').matches;
      const compactLabelWidth = compactLabelVisible ? COMPACT_LABEL_WIDTH + FIELD_GAP : 0;
      const allFieldsWidth = fields.length * FIELD_MIN_WIDTH + fields.length * FIELD_GAP;

      if (width >= compactLabelWidth + actionsWidth + allFieldsWidth) {
        setVisibleCount(fields.length);
        return;
      }

      const available =
        width - compactLabelWidth - actionsWidth - OVERFLOW_BUTTON_WIDTH - FIELD_GAP * 2;
      const minimumVisibleFields = fields.length ? 1 : 0;
      setVisibleCount(
        Math.max(
          minimumVisibleFields,
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
      if (
        event.target.closest('[data-select-field-popover]') ||
        overflowRef.current?.contains(event.target)
      ) {
        return;
      }
      setOverflowOpen(false);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [overflowOpen]);

  return (
    <div ref={containerRef} className="relative flex min-w-0 items-end gap-2 sm:gap-3">
      {compactLabel && (
        <div className="hidden shrink-0 [@media(max-height:760px)]:block [@media(max-width:700px)]:block">
          {compactLabel}
        </div>
      )}
      {fields.slice(0, visibleCount).map((field, index) => (
        <div
          key={`visible-filter-${index}`}
          className="min-w-0 flex-1 sm:min-w-56 [@media(min-width:701px)_and_(min-height:761px)]:min-w-56"
        >
          {field}
        </div>
      ))}
      {overflowFields.length > 0 && (
        <div ref={overflowRef} className="relative shrink-0">
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => setOverflowOpen((open) => !open)}
            aria-label="Show more report filters"
            aria-expanded={overflowOpen}
            title={`${overflowFields.length} more ${overflowFields.length === 1 ? 'filter' : 'filters'}`}
            className="group relative h-10 min-h-10 min-w-10 rounded-xl border-sky-500/40 bg-sky-500/5 px-2 text-sky-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-500 hover:bg-sky-500/10 hover:shadow-md dark:text-sky-300"
          >
            <ChevronsRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-(--color-paper) bg-sky-500 px-1 text-[10px] font-bold leading-none text-white shadow-sm">
              {overflowFields.length}
            </span>
          </Button>
          {overflowOpen && (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="More report criteria"
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-3 sm:block sm:bg-transparent sm:p-0 sm:backdrop-blur-none"
              onPointerDown={(event) => {
                if (event.target === event.currentTarget) setOverflowOpen(false);
              }}
            >
              <div className="max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-hidden rounded-2xl border border-(--color-divider) bg-(--color-paper) shadow-2xl ring-1 ring-black/5 dark:ring-white/5 sm:w-[min(21rem,calc(100vw-2rem))]">
                <div className="flex items-center justify-between gap-3 border-b border-(--color-divider) bg-sky-500/5 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-(--color-text)">More criteria</p>
                    <p className="truncate text-xs text-(--color-muted)">
                      Additional report filters
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-700 dark:text-sky-300">
                      {overflowFields.length}
                    </span>
                    <Button
                      variant="text"
                      color="primary"
                      onClick={() => setOverflowOpen(false)}
                      aria-label="Close more report filters"
                      className="h-8 min-w-8 rounded-lg px-2 text-(--color-muted) hover:bg-sky-500/10 hover:text-sky-700 dark:hover:text-sky-200 sm:hidden"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
                <div className="flex max-h-[calc(100dvh-7rem)] flex-col gap-4 overflow-y-auto p-4">
                  {overflowFields.map((field, index) => (
                    <div key={`overflow-filter-${visibleCount + index}`} className="min-w-0">
                      {field}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        ref={actionsRef}
        className="min-w-36 shrink-0 sm:min-w-56 [@media(max-height:760px)]:min-w-36 [@media(max-width:700px)]:min-w-36"
      >
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
    <div className="flex min-w-0 gap-1.5 sm:gap-2">
      <div className="min-w-0 flex-1">
        {Object.keys(options).length === 1 ? (
          <Button
            fullWidth
            size="small"
            variant="contained"
            color="primary"
            disabled={disabled}
            onClick={onClick}
            className="min-h-10 rounded-xl bg-sky-600 font-semibold shadow-sm hover:bg-sky-500"
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
            className="[&>button]:min-h-10 [&>button]:bg-sky-600 [&>button]:font-semibold [&>button]:shadow-sm [&>button:hover]:bg-sky-500 [&>button:first-child]:rounded-l-xl [&>button:last-child]:rounded-r-xl"
          />
        )}
      </div>
      {searchParams.size > 0 && (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          onClick={resetFilters}
          aria-label="Reset report filters"
          title="Reset filters"
          className="min-h-10 rounded-xl border-(--color-divider) px-2.5 text-(--color-muted) hover:border-sky-500 hover:bg-sky-50 hover:text-sky-700 dark:hover:bg-sky-950 sm:px-3"
        >
          <RotateCcw size={16} />
        </Button>
      )}
    </div>
  );

  return (
    <section className="relative isolate border-b border-(--color-divider) bg-(--color-paper) p-2 print:hidden sm:p-3 lg:p-4 [@media(max-height:760px)]:border-b-0 [@media(max-height:760px)]:p-2 [@media(max-width:700px)]:border-b-0">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-16 bg-linear-to-b from-sky-500/6 to-transparent sm:h-24"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-8 top-0 z-0 hidden h-24 w-64 rounded-full bg-sky-400/5 blur-3xl sm:block"
      />
      <div className="relative z-10 flex flex-col gap-2 lg:flex-row lg:items-end xl:gap-3">
        <div className="flex shrink-0 items-center gap-2.5 lg:w-56 lg:self-center xl:w-64 [@media(max-height:760px)]:sr-only [@media(max-width:700px)]:sr-only">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-linear-to-br from-sky-500 to-cyan-600 text-white shadow-md shadow-sky-500/20 ring-1 ring-white/20 sm:h-10 sm:w-10">
            <SlidersHorizontal size={18} strokeWidth={2.25} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-bold tracking-tight text-(--color-text)">
              Report criteria
            </h2>
            <p className="hidden truncate text-xs text-(--color-muted) sm:block lg:hidden xl:block xl:whitespace-normal [@media(max-height:760px)]:hidden">
              Choose what to include, then generate your report.
            </p>
          </div>
        </div>
        <div className="min-w-0 flex-1 rounded-xl border border-(--color-divider) bg-(--color-background)/35 p-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] sm:rounded-2xl sm:p-3 [@media(max-height:760px)]:rounded-none [@media(max-height:760px)]:border-0 [@media(max-height:760px)]:bg-transparent [@media(max-height:760px)]:p-0 [@media(max-width:700px)]:rounded-none [@media(max-width:700px)]:border-0 [@media(max-width:700px)]:bg-transparent [@media(max-width:700px)]:p-0">
          <OverflowFilterRow
            actions={reportActions}
            compactLabel={
              <span
                className="grid h-10 w-10 place-items-center rounded-xl bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/25 dark:text-sky-300"
                aria-label="Report criteria"
                title="Report criteria"
              >
                <SlidersHorizontal size={18} strokeWidth={2.25} aria-hidden="true" />
              </span>
            }
          >
            {deviceType !== 'none' && (
              <div className="min-w-0">
                <SelectField
                  className="[@media(max-height:760px)]:[&>span:first-child]:sr-only [@media(max-height:760px)]:[&>button]:min-h-10 [@media(max-width:700px)]:[&>span:first-child]:sr-only [@media(max-width:700px)]:[&>button]:min-h-10"
                  label={t(deviceType === 'multiple' ? 'deviceTitle' : 'reportDevice')}
                  data={
                    deviceType === 'multiple'
                      ? deviceList
                      : deviceList.filter((it) => it.id !== 'all')
                  }
                  value={deviceType === 'multiple' ? deviceIds : deviceIds.find(() => true)}
                  allValue="all"
                  onChange={(e) => {
                    const values =
                      deviceType === 'multiple'
                        ? e.target.value
                        : [e.target.value].filter((id) => id);
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
                  className="[@media(max-height:760px)]:[&>span:first-child]:sr-only [@media(max-height:760px)]:[&>button]:min-h-10 [@media(max-width:700px)]:[&>span:first-child]:sr-only [@media(max-width:700px)]:[&>button]:min-h-10"
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
                    className="[@media(max-height:760px)]:[&>span:first-child]:sr-only [@media(max-height:760px)]:[&>button]:min-h-10 [@media(max-width:700px)]:[&>span:first-child]:sr-only [@media(max-width:700px)]:[&>button]:min-h-10"
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
                      className="[@media(max-height:760px)]:[&>span:first-child]:sr-only [@media(max-height:760px)]:[&_input]:min-h-10 [@media(max-width:700px)]:[&>span:first-child]:sr-only [@media(max-width:700px)]:[&_input]:min-h-10"
                      label={t('reportFrom')}
                      size="small"
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
                      className="[@media(max-height:760px)]:[&>span:first-child]:sr-only [@media(max-height:760px)]:[&_input]:min-h-10 [@media(max-width:700px)]:[&>span:first-child]:sr-only [@media(max-width:700px)]:[&_input]:min-h-10"
                      label={t('reportTo')}
                      size="small"
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
                    className="[@media(max-height:760px)]:[&>span:first-child]:sr-only [@media(max-height:760px)]:[&_input]:min-h-10 [@media(max-width:700px)]:[&>span:first-child]:sr-only [@media(max-width:700px)]:[&_input]:min-h-10"
                    value={description || ''}
                    onChange={(event) => setDescription(event.target.value)}
                    label={t('sharedDescription')}
                    size="small"
                    fullWidth
                  />
                </div>
                <div className="min-w-0">
                  <SelectField
                    className="[@media(max-height:760px)]:[&>span:first-child]:sr-only [@media(max-height:760px)]:[&>button]:min-h-10 [@media(max-width:700px)]:[&>span:first-child]:sr-only [@media(max-width:700px)]:[&>button]:min-h-10"
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
        </div>
      </div>
    </section>
  );
};

export default ReportFilter;
