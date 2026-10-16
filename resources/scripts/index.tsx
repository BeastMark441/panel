import React from 'react';
import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import App from '@/components/App';
import { queryClient } from '@/api/queryClient';
import { syncThemeColorMeta } from '@/lib/theme';
import { bootTheme } from '@/views/boot';
import '@/router/view-transitions.css';
import { followCurrentUserLanguage } from './i18n';

dayjs.locale('ru');

followCurrentUserLanguage(queryClient);
syncThemeColorMeta();

const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);

    // Not a top-level await: one in the entry turns off the bundler's chunk merging for the whole build.
    void bootTheme().then(() =>
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        )
    );
}
