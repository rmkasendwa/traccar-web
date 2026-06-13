import * as icons from 'lucide-react';

const aliases = {
  Add: 'Plus',
  ArrowBack: 'ArrowLeft',
  ArrowDropDown: 'ChevronDown',
  ArrowForward: 'ArrowRight',
  BarChart: 'ChartBar',
  Battery20: 'BatteryLow',
  Battery60: 'BatteryMedium',
  BatteryCharging20: 'BatteryCharging',
  BatteryCharging60: 'BatteryCharging',
  BatteryChargingFull: 'BatteryCharging',
  BatteryFull: 'BatteryFull',
  Build: 'Wrench',
  Cached: 'RefreshCw',
  Calculate: 'Calculator',
  Campaign: 'Megaphone',
  CheckCircleOutlined: 'CircleCheck',
  Close: 'X',
  ContentCopy: 'Copy',
  Delete: 'Trash2',
  DeleteForever: 'Trash',
  Description: 'FileText',
  Dns: 'Server',
  Draw: 'PencilLine',
  Error: 'CircleAlert',
  EventRepeat: 'CalendarSync',
  ExitToApp: 'LogOut',
  ExpandMore: 'ChevronDown',
  Folder: 'Folder',
  FormatListBulleted: 'List',
  GpsFixed: 'Crosshair',
  Help: 'CircleHelp',
  HelpOutlined: 'CircleHelp',
  Layers: 'Layers',
  Link: 'Link',
  LocationSearching: 'LocateFixed',
  Login: 'LogIn',
  Map: 'Map',
  Menu: 'Menu',
  MoreVert: 'EllipsisVertical',
  Notes: 'NotebookText',
  Notifications: 'Bell',
  NotificationsActive: 'BellRing',
  PauseCircleFilled: 'CirclePause',
  Payment: 'CreditCard',
  Pending: 'Clock',
  People: 'Users',
  Person: 'User',
  Place: 'MapPin',
  PlayArrow: 'Play',
  PlayCircleFilled: 'CirclePlay',
  Publish: 'Upload',
  QrCode2: 'QrCode',
  Replay: 'RotateCcw',
  Route: 'Route',
  Send: 'Send',
  Settings: 'Settings',
  Share: 'Share2',
  Star: 'Star',
  Stop: 'Square',
  Straighten: 'Ruler',
  Timeline: 'ChartNoAxesCombined',
  Today: 'CalendarDays',
  TravelExplore: 'Search',
  TrendingUp: 'TrendingUp',
  Tune: 'SlidersHorizontal',
  UploadFile: 'FileUp',
  VerifiedUser: 'ShieldCheck',
  Visibility: 'Eye',
  VisibilityOff: 'EyeOff',
  VpnLock: 'ShieldLock',
};

const createIcon = (name) => {
  const Icon = icons[aliases[name] || name] || icons.Circle;
  const Component = ({ fontSize, ...props }) => (
    <Icon
      aria-hidden="true"
      size={fontSize === 'small' ? 16 : fontSize === 'large' ? 28 : 20}
      strokeWidth={2}
      {...props}
    />
  );
  Component.displayName = `${name}Icon`;
  return Component;
};

export const AddIcon = createIcon('Add');
export const ArrowBackIcon = createIcon('ArrowBack');
export const ArrowDropDownIcon = createIcon('ArrowDropDown');
export const ArrowForwardIcon = createIcon('ArrowForward');
export const BarChartIcon = createIcon('BarChart');
export const Battery20Icon = createIcon('Battery20');
export const Battery60Icon = createIcon('Battery60');
export const BatteryCharging20Icon = createIcon('BatteryCharging20');
export const BatteryCharging60Icon = createIcon('BatteryCharging60');
export const BatteryChargingFullIcon = createIcon('BatteryChargingFull');
export const BatteryFullIcon = createIcon('BatteryFull');
export const BuildIcon = createIcon('Build');
export const CachedIcon = createIcon('Cached');
export const CalculateIcon = createIcon('Calculate');
export const CampaignIcon = createIcon('Campaign');
export const CheckCircleOutlinedIcon = createIcon('CheckCircleOutlined');
export const ChevronLeftIcon = createIcon('ChevronLeft');
export const ChevronRightIcon = createIcon('ChevronRight');
export const CloseIcon = createIcon('Close');
export const ContentCopyIcon = createIcon('ContentCopy');
export const DeleteIcon = createIcon('Delete');
export const DeleteForeverIcon = createIcon('DeleteForever');
export const DescriptionIcon = createIcon('Description');
export const DnsIcon = createIcon('Dns');
export const DownloadIcon = createIcon('Download');
export const DrawIcon = createIcon('Draw');
export const EditIcon = createIcon('Edit');
export const ErrorIcon = createIcon('Error');
export const EventRepeatIcon = createIcon('EventRepeat');
export const ExitToAppIcon = createIcon('ExitToApp');
export const ExpandMoreIcon = createIcon('ExpandMore');
export const FastForwardIcon = createIcon('FastForward');
export const FastRewindIcon = createIcon('FastRewind');
export const FolderIcon = createIcon('Folder');
export const FormatListBulletedIcon = createIcon('FormatListBulleted');
export const GpsFixedIcon = createIcon('GpsFixed');
export const HelpIcon = createIcon('Help');
export const HelpOutlinedIcon = createIcon('HelpOutlined');
export const LayersIcon = createIcon('Layers');
export const LinkIcon = createIcon('Link');
export const LocationSearchingIcon = createIcon('LocationSearching');
export const LoginIcon = createIcon('Login');
export const MapIcon = createIcon('Map');
export const MenuIcon = createIcon('Menu');
export const MoreVertIcon = createIcon('MoreVert');
export const NotesIcon = createIcon('Notes');
export const NotificationsIcon = createIcon('Notifications');
export const NotificationsActiveIcon = createIcon('NotificationsActive');
export const PauseIcon = createIcon('Pause');
export const PauseCircleFilledIcon = createIcon('PauseCircleFilled');
export const PaymentIcon = createIcon('Payment');
export const PendingIcon = createIcon('Pending');
export const PeopleIcon = createIcon('People');
export const PersonIcon = createIcon('Person');
export const PlaceIcon = createIcon('Place');
export const PlayArrowIcon = createIcon('PlayArrow');
export const PlayCircleFilledIcon = createIcon('PlayCircleFilled');
export const PublishIcon = createIcon('Publish');
export const QrCode2Icon = createIcon('QrCode2');
export const RefreshIcon = createIcon('Refresh');
export const ReplayIcon = createIcon('Replay');
export const RouteIcon = createIcon('Route');
export const SendIcon = createIcon('Send');
export const SettingsIcon = createIcon('Settings');
export const ShareIcon = createIcon('Share');
export const StarIcon = createIcon('Star');
export const StopIcon = createIcon('Stop');
export const StraightenIcon = createIcon('Straighten');
export const TimelineIcon = createIcon('Timeline');
export const TodayIcon = createIcon('Today');
export const TravelExploreIcon = createIcon('TravelExplore');
export const TrendingUpIcon = createIcon('TrendingUp');
export const TuneIcon = createIcon('Tune');
export const UploadFileIcon = createIcon('UploadFile');
export const VerifiedUserIcon = createIcon('VerifiedUser');
export const VisibilityIcon = createIcon('Visibility');
export const VisibilityOffIcon = createIcon('VisibilityOff');
export const VpnLockIcon = createIcon('VpnLock');
