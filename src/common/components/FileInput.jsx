import { useRef } from 'react';
import { TextField } from '@/components/ui';
import { IconButton } from '@/components/ui';
import { InputAdornment } from '@/components/ui';
import { CloseIcon } from '@/components/icons';

const FileInput = ({ placeholder, value, onChange, slotProps }) => {
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (event) => {
    onChange?.(event.target.files?.[0] || null);
    event.target.value = '';
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange?.(null);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleChange}
        {...slotProps?.htmlInput}
      />
      <TextField
        value={value?.name ?? ''}
        placeholder={placeholder}
        onClick={openPicker}
        slotProps={{
          input: {
            readOnly: true,
            sx: { cursor: 'pointer' },
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton size="small" edge="end" onClick={handleClear}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          },
          htmlInput: { sx: { cursor: 'pointer' } },
        }}
      />
    </>
  );
};

export default FileInput;
