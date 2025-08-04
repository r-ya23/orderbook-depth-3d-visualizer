'use client';

import React from 'react';
import { store } from '@/store/index';
import { Provider } from 'react-redux';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <Provider store={store}>
      {children}
    </Provider>
  );
}