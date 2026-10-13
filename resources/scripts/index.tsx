import React from 'react';
import { createRoot } from 'react-dom/client';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import App from '@/components/App';
import { queryClient } from '@/api/queryClient';
import { syncThemeColorMeta } from '@/lib/theme';
import '@/assets/tailwind.css';
import '@/router/view-transitions.css';
import { followCurrentUserLanguage } from './i18n';

dayjs.locale('ru');

followCurrentUserLanguage(queryClient);
syncThemeColorMeta();

const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
