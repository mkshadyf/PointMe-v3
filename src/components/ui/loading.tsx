import { CircularProgress } from '@mui/material';

export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <CircularProgress />
    </div>
  );
};
