// @ts-nocheck
import { useTheme } from '@/components/ui';
import { ArrowBackIcon } from '@/components/ui/icons';
import { ArrowForwardIcon } from '@/components/ui/icons';

const BackIcon = () => {
  const theme = useTheme();
  return theme.direction === 'rtl' ? <ArrowForwardIcon /> : <ArrowBackIcon />;
};

export default BackIcon;
