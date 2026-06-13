import { useTheme } from '@/components/ui';
import { ArrowBackIcon } from '@/components/icons';
import { ArrowForwardIcon } from '@/components/icons';

const BackIcon = () => {
  const theme = useTheme();
  return theme.direction === 'rtl' ? <ArrowForwardIcon /> : <ArrowBackIcon />;
};

export default BackIcon;
