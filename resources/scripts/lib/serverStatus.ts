const INSTALLING_STATUSES: ReadonlySet<string> = new Set(['installing', 'install_failed', 'reinstall_failed']);

export const SKIPPED_INSTALL_SCRIPT_MESSAGE =
    'Этот сервер настроен так, чтобы пропускать скрипт установки шаблона (Egg). Переустановка недоступна, пока эта настройка не будет отключена.';

export const isInstallingStatus = (status: string | null): boolean =>
    status !== null && INSTALLING_STATUSES.has(status);

export const canReinstallServer = (status: string | null, skipScripts: boolean): boolean =>
    !skipScripts || isInstallingStatus(status);
