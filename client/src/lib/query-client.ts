import { QueryClient } from '@tanstack/react-query'

// Data only changes when a spreadsheet is re-imported, so a short staleTime
// is safe; retry once so a dead server fails fast into the error state.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
