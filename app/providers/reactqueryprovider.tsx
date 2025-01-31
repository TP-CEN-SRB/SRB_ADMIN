'use client';
import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

function ReactQueryProvider({ children }: React.PropsWithChildren) {
  const [client] = useState(new QueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

export default ReactQueryProvider;
