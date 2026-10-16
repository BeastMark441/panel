import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

/** Local activity resources for tests; no HTTP backend or app bootstrap. */
export async function initializeActivityTranslations() {
    const instance = createInstance();

    await instance.use(initReactI18next).init({
        lng: 'ru',
        fallbackLng: false,
        ns: ['activity'],
        defaultNS: 'activity',
        interpolation: { escapeValue: false },
        resources: {
            ru: {
                activity: {
                    auth: { success: 'Выполнен вход' },
                    user: {
                        account: {
                            'email-changed': 'Адрес электронной почты изменён с {{old}} на {{new}}',
                        },
                        'api-key': { create: 'Создан API-ключ {{identifier}}' },
                    },
                    server: {
                        power: { start: 'Сервер запущен' },
                        sftp: {
                            write_one: 'Изменено содержимое файла {{files.0}}',
                            write_other: 'Изменено содержимое файлов — {{count}} шт.',
                        },
                    },
                },
            },
        },
    });
}
