declare module 'notistack' {
  export interface SnackbarMessage {
    message: string;
    key: number;
    variant?: 'default' | 'error' | 'success' | 'warning' | 'info';
  }

  export interface SnackbarKey {
    key: number;
  }

  export interface SnackbarProps {
    autoHideDuration?: number;
    disableWindowBlurListener?: boolean;
    onClose?: () => void;
    onExited?: (event: React.TransitionEvent<HTMLElement>, key: SnackbarKey) => void;
    open?: boolean;
    resumeHideDuration?: number;
  }

  export interface OptionsObject {
    key?: string | number;
    variant?: 'default' | 'error' | 'success' | 'warning' | 'info';
    autoHideDuration?: number;
    disableWindowBlurListener?: boolean;
    anchorOrigin?: {
      horizontal: 'left' | 'center' | 'right';
      vertical: 'top' | 'bottom';
    };
    preventDuplicate?: boolean;
    action?: React.ReactNode | ((key: SnackbarKey) => React.ReactNode);
    onClose?: () => void;
    className?: string;
    style?: React.CSSProperties;
  }

  export interface ProviderContext {
    enqueueSnackbar: (message: string | React.ReactNode, options?: OptionsObject) => SnackbarKey;
    closeSnackbar: (key?: SnackbarKey) => void;
  }
}

import { SWRResponse } from 'swr'

// Use SWR types directly
export type UseQueryResponse<T> = SWRResponse<T>

// Add type for mutation function
export type MutationFunction<TData = any, TResult = any> = (data: TData) => Promise<TResult>

// Add type for mutation result
export type MutationResult<TData = any, TResult = any> = {
  mutate: (data: TData) => Promise<TResult>
  isLoading: boolean
  error: Error | null
}

export interface SWROptions<T> {
  revalidateOnFocus?: boolean
  revalidateOnReconnect?: boolean
  refreshInterval?: number
  shouldRetryOnError?: boolean
  dedupingInterval?: number
  focusThrottleInterval?: number
  loadingTimeout?: number
  errorRetryInterval?: number
  errorRetryCount?: number
  onSuccess?: (data: T) => void
  onError?: (err: Error) => void
  onLoadingSlow?: (key: string, config: SWROptions<T>) => void
  onErrorRetry?: (err: Error, key: string, config: SWROptions<T>, revalidate: () => Promise<boolean>, { retryCount: number }) => void
}

declare module 'swr' {
  interface SWRConfiguration {
    suspense?: boolean
    revalidateOnFocus?: boolean
    revalidateOnReconnect?: boolean
    refreshInterval?: number
    shouldRetryOnError?: boolean
  }
}

declare module '*.svg' {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.jpeg' {
  const content: string;
  export default content;
}

declare module '*.gif' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: { [key: string]: any };
  export default content;
}
