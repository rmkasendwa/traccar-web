// @ts-nocheck
'use client';

import {
  Children,
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useMediaQuery, useTheme } from './theme';

const cn = (...values) => values.filter(Boolean).join(' ');
const sxStyle = (sx) => (typeof sx === 'object' && sx ? sx : undefined);
const colorClass = (color) =>
  ({
    error: 'text-red-600',
    success: 'text-green-600',
    info: 'text-sky-600',
    secondary: 'text-[var(--color-secondary)]',
    primary: 'text-[var(--color-primary)]',
    textSecondary: 'text-[var(--color-muted)]',
    textPrimary: 'text-[var(--color-text)]',
  })[color] || '';

export { useMediaQuery, useTheme };

export const CssBaseline = () => null;
export const StyledEngineProvider = ({ children }) => children;

export const Box = forwardRef(({ component: Component = 'div', className, sx, ...props }, ref) => (
  <Component
    ref={ref}
    className={className}
    style={{ ...sxStyle(sx), ...props.style }}
    {...props}
  />
));
Box.displayName = 'Box';

export const Paper = forwardRef(({ className, elevation = 1, square, sx, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-[var(--color-paper)]',
      !square && 'rounded-md',
      elevation > 0 && 'shadow',
      className,
    )}
    style={{ ...sxStyle(sx), ...props.style }}
    {...props}
  />
));
Paper.displayName = 'Paper';

export const Container = ({ className, maxWidth = 'lg', ...props }) => (
  <div
    className={cn('mx-auto w-full px-4', maxWidth === 'sm' ? 'max-w-2xl' : 'max-w-6xl', className)}
    {...props}
  />
);

export const Typography = forwardRef(
  ({ component, variant = 'body1', color, align, noWrap, className, sx, ...props }, ref) => {
    const Component =
      component ||
      { h4: 'h4', h5: 'h5', h6: 'h6', subtitle1: 'h3', caption: 'span' }[variant] ||
      'p';
    const variants = {
      h4: 'text-3xl font-semibold',
      h5: 'text-2xl font-semibold',
      h6: 'text-xl font-semibold',
      subtitle1: 'text-base font-semibold',
      body2: 'text-sm',
      caption: 'text-xs',
      button: 'text-sm font-semibold uppercase tracking-wide',
    };
    return (
      <Component
        ref={ref}
        className={cn(
          variants[variant],
          colorClass(color),
          noWrap && 'truncate',
          align === 'center' && 'text-center',
          className,
        )}
        style={{ ...sxStyle(sx), ...props.style }}
        {...props}
      />
    );
  },
);
Typography.displayName = 'Typography';

export const Button = forwardRef(
  (
    {
      variant = 'text',
      color = 'primary',
      fullWidth,
      size = 'medium',
      className,
      startIcon,
      endIcon,
      sx,
      ...props
    },
    ref,
  ) => {
    const contained = variant === 'contained';
    const outlined = variant === 'outlined';
    const colors =
      color === 'error'
        ? contained
          ? 'bg-red-600 text-white hover:bg-red-700'
          : 'text-red-600 border-red-600'
        : color === 'secondary'
          ? contained
            ? 'bg-[var(--color-secondary)] text-white'
            : 'text-[var(--color-secondary)] border-[var(--color-secondary)]'
          : contained
            ? 'bg-[var(--color-primary)] text-white'
            : 'text-[var(--color-primary)] border-[var(--color-primary)]';
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
          size === 'small' ? 'min-h-8 px-2 text-sm' : 'min-h-10 px-4',
          outlined && 'border',
          colors,
          fullWidth && 'w-full',
          className,
        )}
        style={{ ...sxStyle(sx), ...props.style }}
        {...props}
      >
        {startIcon}
        {props.children}
        {endIcon}
      </button>
    );
  },
);
Button.displayName = 'Button';

export const IconButton = forwardRef(({ color, size, edge, className, sx, ...props }, ref) => (
  <button
    ref={ref}
    type={props.type || 'button'}
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full transition hover:bg-black/10 disabled:opacity-50 dark:hover:bg-white/10',
      size === 'small' ? 'h-8 w-8' : 'h-10 w-10',
      colorClass(color),
      className,
    )}
    style={{ ...sxStyle(sx), ...props.style }}
    {...props}
  />
));
IconButton.displayName = 'IconButton';

export const Fab = ({ className, size, ...props }) => (
  <IconButton
    className={cn(
      'bg-[var(--color-primary)] text-white shadow-lg hover:bg-[var(--color-primary)]/90',
      size === 'medium' && 'h-12 w-12',
      className,
    )}
    {...props}
  />
);

export const ButtonGroup = forwardRef(({ children, fullWidth, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'inline-flex [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md',
      fullWidth && 'w-full [&>button:first-child]:flex-1',
      className,
    )}
    {...props}
  >
    {children}
  </div>
));
ButtonGroup.displayName = 'ButtonGroup';

const FieldShell = ({ label, error, helperText, fullWidth, children, className }) => (
  <label className={cn('flex flex-col gap-1 text-sm', fullWidth && 'w-full', className)}>
    {label && <span className={error ? 'text-red-600' : 'text-[var(--color-muted)]'}>{label}</span>}
    {children}
    {helperText && (
      <span className={cn('text-xs', error ? 'text-red-600' : 'text-[var(--color-muted)]')}>
        {helperText}
      </span>
    )}
  </label>
);

export const TextField = forwardRef(
  (
    {
      label,
      helperText,
      error,
      fullWidth,
      multiline,
      rows,
      select,
      children,
      className,
      InputProps,
      inputProps,
      slotProps,
      type = 'text',
      size,
      ...props
    },
    ref,
  ) => {
    const inputSlot = slotProps?.input || InputProps || {};
    const htmlInput = slotProps?.htmlInput || inputProps || {};
    const common = cn(
      'min-w-0 rounded-md border border-[var(--color-divider)] bg-transparent px-3 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)]',
      size === 'small' ? 'min-h-9 py-1.5' : 'min-h-10 py-2',
      error && 'border-red-600',
      inputSlot.className,
    );
    let control;
    if (select) {
      control = (
        <select ref={ref} className={common} {...htmlInput} {...props}>
          {children}
        </select>
      );
    } else if (multiline) {
      control = <textarea ref={ref} rows={rows} className={common} {...htmlInput} {...props} />;
    } else {
      control = (
        <div className="flex items-center rounded-md border border-[var(--color-divider)] focus-within:border-[var(--color-primary)]">
          {inputSlot.startAdornment}
          <input
            ref={ref}
            type={type}
            className={cn(common, 'w-full border-0 focus:ring-0')}
            {...htmlInput}
            {...props}
          />
          {inputSlot.endAdornment}
        </div>
      );
    }
    return (
      <FieldShell
        label={label}
        helperText={helperText}
        error={error}
        fullWidth={fullWidth}
        className={className}
      >
        {control}
      </FieldShell>
    );
  },
);
TextField.displayName = 'TextField';

export const FormControl = ({ fullWidth, className, ...props }) => (
  <div className={cn('flex flex-col gap-1', fullWidth && 'w-full', className)} {...props} />
);
export const InputLabel = ({ className, ...props }) => (
  <label className={cn('text-sm text-[var(--color-muted)]', className)} {...props} />
);
export const OutlinedInput = forwardRef(
  ({ className, startAdornment, endAdornment, ...props }, ref) => (
    <div className="flex items-center rounded-md border border-[var(--color-divider)]">
      {startAdornment}
      <input
        ref={ref}
        className={cn('min-h-10 min-w-0 flex-1 bg-transparent px-3 outline-none', className)}
        {...props}
      />
      {endAdornment}
    </div>
  ),
);
OutlinedInput.displayName = 'OutlinedInput';
export const InputAdornment = ({ position, className, ...props }) => (
  <span className={cn('inline-flex px-2 text-[var(--color-muted)]', className)} {...props} />
);

export const MenuItem = ({
  value,
  selected,
  className,
  component: Component = 'button',
  ...props
}) => (
  <Component
    type={Component === 'button' ? 'button' : undefined}
    data-value={value}
    className={cn(
      'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/10',
      selected && 'bg-black/5 dark:bg-white/10',
      className,
    )}
    {...props}
  />
);

export const Select = forwardRef(
  ({ children, label, fullWidth, className, onChange, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'min-h-10 rounded-md border border-[var(--color-divider)] bg-[var(--color-paper)] px-3',
        fullWidth && 'w-full',
        className,
      )}
      onChange={onChange}
      {...props}
    >
      {Children.map(children, (child) =>
        isValidElement(child) ? (
          <option value={child.props.value} disabled={child.props.disabled}>
            {child.props.children}
          </option>
        ) : (
          child
        ),
      )}
    </select>
  ),
);
Select.displayName = 'Select';

export const Checkbox = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn('h-4 w-4 accent-[var(--color-primary)]', className)}
    {...props}
  />
));
Checkbox.displayName = 'Checkbox';
export const Switch = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    role="switch"
    className={cn('h-5 w-10 accent-[var(--color-primary)]', className)}
    {...props}
  />
));
Switch.displayName = 'Switch';
export const FormControlLabel = ({ control, label, className, ...props }) => (
  <label className={cn('flex items-center gap-2 text-sm', className)} {...props}>
    {control}
    <span>{label}</span>
  </label>
);
export const FormGroup = ({ className, ...props }) => (
  <div className={cn('flex flex-col gap-2', className)} {...props} />
);

export const Link = ({ className, underline, color, ...props }) => (
  <a
    className={cn(
      'cursor-pointer text-[var(--color-primary)] hover:underline',
      colorClass(color),
      className,
    )}
    {...props}
  />
);
export const Divider = ({ className, ...props }) => (
  <hr className={cn('border-0 border-t border-[var(--color-divider)]', className)} {...props} />
);
export const Chip = ({ label, onDelete, className, ...props }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full bg-black/10 px-2 py-1 text-xs dark:bg-white/10',
      className,
    )}
    {...props}
  >
    {label}
    {onDelete && (
      <button type="button" onClick={onDelete}>
        ×
      </button>
    )}
  </span>
);
export const Avatar = ({ src, alt = '', className, children, ...props }) => (
  <span
    className={cn(
      'inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-black/10',
      className,
    )}
    {...props}
  >
    {src ? <img src={src} alt={alt} className="h-full w-full object-cover" /> : children}
  </span>
);
export const Badge = ({ badgeContent, variant, invisible, children, className }) => (
  <span className={cn('relative inline-flex', className)}>
    {children}
    {!invisible && (
      <span
        className={cn(
          'absolute -right-1 -top-1 rounded-full bg-red-600 text-white',
          variant === 'dot' ? 'h-2.5 w-2.5' : 'min-w-4 px-1 text-center text-[10px]',
        )}
      >
        {variant === 'dot' ? '' : badgeContent}
      </span>
    )}
  </span>
);

export const AppBar = ({ className, color, position = 'fixed', ...props }) => (
  <header
    className={cn(
      'z-30 w-full border-b border-[var(--color-divider)] bg-[var(--color-paper)] shadow-sm',
      position === 'fixed' && 'fixed top-0',
      position === 'sticky' && 'sticky top-0',
      className,
    )}
    {...props}
  />
);
export const Toolbar = ({ className, ...props }) => (
  <div className={cn('flex min-h-14 items-center gap-2 px-4', className)} {...props} />
);

export const List = ({ className, subheader, ...props }) => (
  <div className={cn('py-1', className)} {...props}>
    {subheader}
    {props.children}
  </div>
);
export const ListItem = ({ className, secondaryAction, ...props }) => (
  <div className={cn('flex min-h-12 items-center gap-3 px-4 py-2', className)} {...props}>
    {props.children}
    {secondaryAction && <span className="ml-auto">{secondaryAction}</span>}
  </div>
);
export const ListItemButton = forwardRef(
  ({ className, selected, component: Component = 'button', ...props }, ref) => (
    <Component
      ref={ref}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left hover:bg-black/5 dark:hover:bg-white/10',
        selected && 'bg-black/5 dark:bg-white/10',
        className,
      )}
      {...props}
    />
  ),
);
ListItemButton.displayName = 'ListItemButton';
export const ListItemIcon = ({ className, ...props }) => (
  <span className={cn('inline-flex min-w-8', className)} {...props} />
);
export const ListItemAvatar = ({ className, ...props }) => (
  <span className={cn('inline-flex min-w-12', className)} {...props} />
);
export const ListItemText = ({ primary, secondary, className, ...props }) => (
  <span className={cn('min-w-0 flex-1', className)} {...props}>
    <span className="block truncate">{primary}</span>
    {secondary && (
      <span className="block truncate text-sm text-[var(--color-muted)]">{secondary}</span>
    )}
    {props.children}
  </span>
);
export const ListSubheader = ({ className, ...props }) => (
  <div
    className={cn('px-4 py-2 text-xs font-semibold uppercase text-[var(--color-muted)]', className)}
    {...props}
  />
);

const Overlay = ({ children, onClose }) =>
  createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      {children}
    </div>,
    document.body,
  );
export const Dialog = ({ open, onClose, fullWidth, maxWidth, children, className }) =>
  open ? (
    <Overlay onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'max-h-[90vh] overflow-auto rounded-lg bg-[var(--color-paper)] shadow-xl',
          fullWidth && 'w-full',
          maxWidth === 'xs' ? 'max-w-sm' : maxWidth === 'sm' ? 'max-w-xl' : 'max-w-2xl',
          className,
        )}
      >
        {children}
      </div>
    </Overlay>
  ) : null;
export const DialogContent = ({ className, ...props }) => (
  <div className={cn('p-5', className)} {...props} />
);
export const DialogContentText = ({ className, ...props }) => (
  <p className={cn('text-[var(--color-muted)]', className)} {...props} />
);
export const DialogActions = ({ className, ...props }) => (
  <div
    className={cn('flex justify-end gap-2 border-t border-[var(--color-divider)] p-4', className)}
    {...props}
  />
);

const Floating = ({ open, anchorEl, children, className }) => {
  if (!open || typeof document === 'undefined') return null;
  const rect = anchorEl?.getBoundingClientRect?.();
  return createPortal(
    <div
      className={cn(
        'fixed z-50 min-w-40 overflow-hidden rounded-md border border-[var(--color-divider)] bg-[var(--color-paper)] py-1 shadow-xl',
        className,
      )}
      style={{ top: rect ? rect.bottom + 4 : '50%', left: rect ? rect.left : '50%' }}
    >
      {children}
    </div>,
    document.body,
  );
};
export const Menu = ({ open, anchorEl, onClose, children, className }) => (
  <Floating open={open} anchorEl={anchorEl} className={className}>
    <div onClick={onClose}>{children}</div>
  </Floating>
);
export const Popover = ({ open, anchorEl, onClose, children, className }) => (
  <Floating open={open} anchorEl={anchorEl} className={className}>
    <div>{children}</div>
  </Floating>
);
export const Tooltip = ({ title, children, open }) => (
  <span title={typeof title === 'string' ? title : undefined} className="inline-flex">
    {children}
    {open && typeof title !== 'string' && <span className="sr-only">{title}</span>}
  </span>
);

export const Drawer = ({
  open = true,
  onClose,
  anchor = 'left',
  variant,
  slotProps,
  children,
  className,
}) => {
  if (!open && variant !== 'permanent') return null;
  const content = (
    <aside
      className={cn(
        'h-full bg-[var(--color-paper)] shadow-xl',
        slotProps?.paper?.className,
        className,
      )}
    >
      {children}
    </aside>
  );
  if (variant === 'permanent') return content;
  return (
    <div
      className="fixed inset-0 z-40 bg-black/40"
      onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}
    >
      <div className={cn('absolute inset-y-0', anchor === 'right' ? 'right-0' : 'left-0')}>
        {content}
      </div>
    </div>
  );
};

export const Snackbar = ({
  open,
  onClose,
  autoHideDuration,
  children,
  message,
  action,
  className,
}) => {
  useEffect(() => {
    if (!open || !autoHideDuration) return undefined;
    const timer = setTimeout(() => onClose?.({}, 'timeout'), autoHideDuration);
    return () => clearTimeout(timer);
  }, [open, autoHideDuration, onClose]);
  if (!open) return null;
  return createPortal(
    <div
      className={cn(
        'fixed bottom-5 left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-md bg-slate-900 px-4 py-3 text-white shadow-xl',
        className,
      )}
    >
      {children || message}
      {action}
    </div>,
    document.body,
  );
};
export const Alert = ({ severity = 'info', action, children, className, ...props }) => (
  <div
    role="alert"
    className={cn(
      'flex items-center gap-3 rounded-md border p-3',
      severity === 'error'
        ? 'border-red-300 bg-red-50 text-red-800 dark:bg-red-950'
        : severity === 'success'
          ? 'border-green-300 bg-green-50 text-green-800 dark:bg-green-950'
          : 'border-sky-300 bg-sky-50 text-sky-800 dark:bg-sky-950',
      className,
    )}
    {...props}
  >
    <span className="flex-1">{children}</span>
    {action}
  </div>
);

export const Table = ({ className, size, ...props }) => (
  <div className="w-full overflow-x-auto">
    <table
      className={cn(
        'w-full border-collapse text-left text-sm',
        size === 'small' && 'text-xs',
        className,
      )}
      {...props}
    />
  </div>
);
export const TableHead = (props) => <thead className="bg-black/5 dark:bg-white/5" {...props} />;
export const TableBody = (props) => <tbody {...props} />;
export const TableFooter = (props) => <tfoot {...props} />;
export const TableRow = ({ className, hover, selected, ...props }) => (
  <tr
    className={cn(
      'border-b border-[var(--color-divider)]',
      hover && 'hover:bg-black/5 dark:hover:bg-white/5',
      selected && 'bg-black/5 dark:bg-white/5',
      className,
    )}
    {...props}
  />
);
export const TableCell = ({ component: Component = 'td', align, className, colSpan, ...props }) => (
  <Component
    colSpan={colSpan}
    className={cn(
      'px-3 py-2',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      className,
    )}
    {...props}
  />
);

export const Card = ({ className, ...props }) => (
  <Paper className={cn('overflow-hidden', className)} {...props} />
);
export const CardContent = ({ className, ...props }) => (
  <div className={cn('p-4', className)} {...props} />
);
export const CardActions = ({ className, ...props }) => (
  <div className={cn('flex items-center gap-2 p-2', className)} {...props} />
);
export const CardMedia = ({ component: Component = 'img', className, ...props }) => (
  <Component className={cn('block w-full object-cover', className)} {...props} />
);

export const Grid = ({ container, spacing, size, className, ...props }) => (
  <div
    className={cn(
      container ? 'grid grid-cols-12' : '',
      spacing && 'gap-4',
      size && `col-span-${typeof size === 'number' ? size : 12}`,
      className,
    )}
    {...props}
  />
);
export const Breadcrumbs = ({ separator = '/', className, children, ...props }) => (
  <nav className={cn('flex items-center gap-2', className)} {...props}>
    {Children.map(children, (child, index) => (
      <>
        {index > 0 && <span>{separator}</span>}
        {child}
      </>
    ))}
  </nav>
);

export const Accordion = ({
  children,
  defaultExpanded,
  expanded,
  onChange,
  className,
  ...props
}) => {
  const [localOpen, setLocalOpen] = useState(defaultExpanded || false);
  const open = expanded ?? localOpen;
  const parts = Children.toArray(children);
  return (
    <div className={cn('border-b border-[var(--color-divider)]', className)} {...props}>
      {parts.map((child) =>
        isValidElement(child)
          ? cloneElement(child, {
              __open: open,
              __toggle: (event) => {
                setLocalOpen(!open);
                onChange?.(event, !open);
              },
            })
          : child,
      )}
    </div>
  );
};
export const AccordionSummary = ({ children, expandIcon, __toggle }) => (
  <button
    type="button"
    className="flex min-h-12 w-full items-center gap-2 px-4 text-left"
    onClick={__toggle}
  >
    <span className="flex-1">{children}</span>
    {expandIcon}
  </button>
);
export const AccordionDetails = ({ children, __open, className }) =>
  __open ? <div className={cn('px-4 pb-4', className)}>{children}</div> : null;

export const BottomNavigation = ({ value, onChange, className, ...props }) => (
  <nav
    className={cn(
      'flex min-h-14 items-stretch border-t border-[var(--color-divider)] bg-[var(--color-paper)]',
      className,
    )}
    {...props}
  >
    {Children.map(props.children, (child) =>
      isValidElement(child)
        ? cloneElement(child, {
            selected: child.props.value === value,
            onClick: (event) => onChange?.(event, child.props.value),
          })
        : child,
    )}
  </nav>
);
export const BottomNavigationAction = ({ label, icon, selected, className, ...props }) => (
  <button
    type="button"
    className={cn(
      'flex flex-1 flex-col items-center justify-center text-xs',
      selected ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]',
      className,
    )}
    {...props}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export const Skeleton = ({ variant, width, height, className }) => (
  <span
    className={cn(
      'block animate-pulse bg-black/10 dark:bg-white/10',
      variant === 'circular' ? 'rounded-full' : 'rounded',
      className,
    )}
    style={{ width, height }}
  />
);
export const Slider = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="range"
    className={cn('accent-[var(--color-primary)]', className)}
    {...props}
  />
));
Slider.displayName = 'Slider';

export const Autocomplete = ({
  options = [],
  value,
  onChange,
  inputValue,
  onInputChange,
  getOptionLabel = (option) => option?.label ?? String(option ?? ''),
  renderInput,
  multiple,
  freeSolo,
  disabled,
  className,
}) => {
  const id = useId();
  const labels = multiple ? (value || []).map(getOptionLabel).join(', ') : getOptionLabel(value);
  const current = inputValue ?? labels;
  const params = {
    id,
    value: current,
    disabled,
    onChange: (event) => onInputChange?.(event, event.target.value, 'input'),
    inputProps: { list: `${id}-options` },
  };
  return (
    <div className={className}>
      {renderInput ? renderInput(params) : <TextField {...params} />}
      <datalist id={`${id}-options`}>
        {options.map((option, index) => (
          <option key={option?.id ?? index} value={getOptionLabel(option)} />
        ))}
      </datalist>
    </div>
  );
};

export const createFilterOptions =
  () =>
  (options, { inputValue }) =>
    options.filter((option) =>
      String(option?.name ?? option)
        .toLowerCase()
        .includes(inputValue.toLowerCase()),
    );
