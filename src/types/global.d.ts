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

declare module '@tanstack/react-query' {
  export interface UseQueryOptions<
    TQueryFnData = unknown,
    TError = unknown,
    TData = TQueryFnData,
    TQueryKey extends QueryKey = QueryKey,
  > {
    queryKey: TQueryKey;
    queryFn: QueryFunction<TQueryFnData, TQueryKey>;
    enabled?: boolean;
    retry?: boolean | number | ((failureCount: number, error: TError) => boolean);
    retryDelay?: (retryAttempt: number) => number;
    staleTime?: number;
    cacheTime?: number;
    refetchInterval?: number | false;
    refetchIntervalInBackground?: boolean;
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
    notifyOnChangeProps?: Array<keyof InfiniteQueryObserverResult>;
    onSuccess?: (data: TData) => void;
    onError?: (error: TError) => void;
    onSettled?: (data: TData | undefined, error: TError | null) => void;
    select?: (data: TQueryFnData) => TData;
    suspense?: boolean;
    keepPreviousData?: boolean;
    placeholderData?: TQueryFnData | (() => TQueryFnData);
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
