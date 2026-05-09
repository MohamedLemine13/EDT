import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import generouted from '@generouted/react-router/plugin'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // File-based routing - create files in src/pages and routes are auto-generated
    generouted(),
    // Tailwind CSS v4
    tailwindcss(),
    // Auto-imports for React hooks, router, and more
    AutoImport({
      imports: [
        'react',
        'react-router-dom',
        {
          from: 'react',
          imports: [
            'useState',
            'useEffect',
            'useCallback',
            'useMemo',
            'useRef',
            'useContext',
            'useReducer',
            'useId',
            'useTransition',
            'useDeferredValue',
            'useSyncExternalStore',
            'useInsertionEffect',
            'useLayoutEffect',
            'useImperativeHandle',
            'useDebugValue',
          ],
        },
      ],
      dts: 'src/auto-imports.d.ts',
      dirs: ['src/components', 'src/hooks', 'src/lib'],
      vueTemplate: false,
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
