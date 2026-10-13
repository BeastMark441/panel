import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import { toast } from 'sonner';

import {
    adminClearExtensionSettingFileMutation,
    adminDisableExtensionMutation,
    adminEnableExtensionMutation,
    adminGetExtensionSettingsOptions,
    adminGetExtensionSettingsQueryKey,
    adminInstallExtensionMutation,
    adminListExtensionFormsOptions,
    adminListExtensionsOptions,
    adminListExtensionsQueryKey,
    adminRemoveExtensionMutation,
    adminUpdateExtensionSettingsMutation,
    adminUploadExtensionSettingFileMutation,
} from '@/api/generated/@tanstack/react-query.gen';
import type {
    AdminClearExtensionSettingFileData,
    AdminExtensionFormsResponse,
    AdminDisableExtensionData,
    AdminEnableExtensionData,
    AdminGetExtensionSettingsResponse,
    AdminInstallExtensionData,
    AdminListExtensionsResponse,
    AdminRemoveExtensionData,
    AdminUpdateExtensionSettingsData,
    AdminUploadExtensionSettingFileData,
    Options,
} from '@/api/generated';
import { isObject, isString } from '@/lib/objects';
import { notifyHttpError } from '@/plugins/notifications';

export type AdminExtensionsResponse = AdminListExtensionsResponse;
export type AdminExtension = NonNullable<AdminExtensionsResponse['data']>[number];

type AdminExtensionsQueryOptions = { enabled?: boolean };

export const adminExtensionsQueryOptions = () => adminListExtensionsOptions();

/** Расширения, поля которых отображаются в каждой форме администрирования, сгруппированные по форме. */
export type AdminExtensionForms = AdminExtensionFormsResponse['data'];

/** Изменяется только при включении или отключении расширений, после чего требуется перезагрузка страницы. */
export const adminExtensionFormsQueryOptions = (): ReturnType<typeof adminListExtensionFormsOptions> => ({
    ...adminListExtensionFormsOptions(),
    staleTime: Infinity,
});

export const installAdminExtensionInput = (
    file: File,
    enable: boolean,
    replace = false
): Options<AdminInstallExtensionData> => ({
    body: { package: file, enable, replace },
});

/** Установленное расширение, которое будет заменено загруженным пакетом после подтверждения администратора. */
export type AdminExtensionReplacement = {
    id: string;
    version: string;
    installedVersion: string | null;
    enabled: boolean;
};

/** Объект `meta` первой ошибки JSON:API в теле ответа. */
const firstErrorMeta = (response: AxiosResponse): unknown => {
    const data: unknown = response.data;
    const first: unknown = isObject(data) && 'errors' in data && Array.isArray(data.errors) ? data.errors[0] : null;

    return isObject(first) && 'meta' in first ? first.meta : null;
};

/** Обрабатывает ответ 409, возвращаемый при установке пакета с уже установленным ID. */
export const extensionReplacement = (cause: unknown): AdminExtensionReplacement | null => {
    if (!isAxiosError(cause) || cause.response?.status !== 409) {
        return null;
    }

    const meta = firstErrorMeta(cause.response);

    if (!isObject(meta) || !('identifier' in meta) || !('version' in meta) || !isString(meta.identifier)) {
        return null;
    }

    const installed = 'installed_version' in meta ? meta.installed_version : null;

    return {
        id: meta.identifier,
        version: isString(meta.version) ? meta.version : '',
        installedVersion: isString(installed) ? installed : null,
        enabled: 'enabled' in meta && meta.enabled === true,
    };
};

export const enableAdminExtensionInput = (extension: string): Options<AdminEnableExtensionData> => ({
    path: { extension },
    meta: { name: extension },
});

export const disableAdminExtensionInput = (extension: string): Options<AdminDisableExtensionData> => ({
    path: { extension },
    meta: { name: extension },
});

export const removeAdminExtensionInput = (extension: string, name?: string): Options<AdminRemoveExtensionData> => ({
    path: { extension },
    meta: { name: name ?? extension },
});

export type AdminExtensionSettingField = AdminGetExtensionSettingsResponse['data']['schema'][number];
export type AdminExtensionSettingValue = AdminExtensionSettingField['value'];

export const adminExtensionSettingsQueryOptions = (
    extension: string
): ReturnType<typeof adminGetExtensionSettingsOptions> => adminGetExtensionSettingsOptions({ path: { extension } });

export const updateAdminExtensionSettingsInput = (
    extension: string,
    settings: Record<string, AdminExtensionSettingValue>
): Options<AdminUpdateExtensionSettingsData> => ({
    path: { extension },
    body: { settings },
    meta: { name: extension },
});

export const uploadAdminExtensionSettingFileInput = (
    extension: string,
    input: string,
    file: File
): Options<AdminUploadExtensionSettingFileData> => ({
    path: { extension, input },
    body: { file },
});

export const clearAdminExtensionSettingFileInput = (
    extension: string,
    input: string
): Options<AdminClearExtensionSettingFileData> => ({
    path: { extension, input },
});

export const useAdminExtensions = (options?: AdminExtensionsQueryOptions) =>
    useQuery({ ...adminExtensionsQueryOptions(), ...options });

export const useAdminExtensionForms = (options?: AdminExtensionsQueryOptions) =>
    useQuery({ ...adminExtensionFormsQueryOptions(), ...options });

export const useAdminExtensionSettings = (extension: string, options?: { enabled?: boolean }) =>
    useQuery({ ...adminExtensionSettingsQueryOptions(extension), ...options });

export const useUpdateAdminExtensionSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...adminUpdateExtensionSettingsMutation(),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({
                queryKey: adminGetExtensionSettingsQueryKey({
                    path: { extension: variables.path.extension },
                }),
            });
            const name = variables.meta?.name;

            toast.success('Настройки сохранены', {
                description: name ? `Настройки расширения «${name}» обновлены.` : 'Настройки расширения обновлены.',
            });
        },
        onError: (error) => notifyHttpError(error, 'Не удалось обновить настройки расширения'),
    });
};

export const useUploadAdminExtensionSettingFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...adminUploadExtensionSettingFileMutation(),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(
                adminGetExtensionSettingsQueryKey({ path: { extension: variables.path.extension } }),
                data
            );
            toast.success('Файл загружен');
        },
        onError: (error) => notifyHttpError(error, 'Не удалось загрузить файл'),
    });
};

export const useClearAdminExtensionSettingFile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...adminClearExtensionSettingFileMutation(),
        onSuccess: (data, variables) => {
            queryClient.setQueryData(
                adminGetExtensionSettingsQueryKey({ path: { extension: variables.path.extension } }),
                data
            );
            toast.success('Файл удалён');
        },
        onError: (error) => notifyHttpError(error, 'Не удалось удалить файл'),
    });
};

const notifyReloadToApply = (title: string, description: string) =>
    toast.success(title, {
        description: `${description} Перезагрузите страницу, чтобы применить изменения.`,
        action: { label: 'Перезагрузить', onClick: () => window.location.reload() },
    });

export const useInstallAdminExtension = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...adminInstallExtensionMutation(),
        onSuccess: async (data) => {
            await queryClient.invalidateQueries({ queryKey: adminListExtensionsQueryKey() });
            const name = data.data?.name;
            const description = name ? `Расширение «${name}» установлено.` : 'Расширение установлено.';

            if (data.data?.enabled) {
                notifyReloadToApply('Расширение установлено', description);
            } else {
                toast.success('Расширение установлено', { description });
            }
        },
        onError: (error) => {
            // Подтверждение замены запрашивается в диалоге установки.
            if (!extensionReplacement(error)) {
                notifyHttpError(error, 'Не удалось установить расширение');
            }
        },
    });
};

export const useEnableAdminExtension = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...adminEnableExtensionMutation(),
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: adminListExtensionsQueryKey() });
            const name = data.data?.name ?? variables.meta?.name;

            notifyReloadToApply(
                'Расширение включено',
                name ? `Расширение «${name}» включено.` : 'Расширение включено.'
            );
        },
        onError: (error) => notifyHttpError(error, 'Не удалось включить расширение'),
    });
};

export const useDisableAdminExtension = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...adminDisableExtensionMutation(),
        onSuccess: async (data, variables) => {
            await queryClient.invalidateQueries({ queryKey: adminListExtensionsQueryKey() });
            const name = data.data?.name ?? variables.meta?.name;

            notifyReloadToApply(
                'Расширение отключено',
                name ? `Расширение «${name}» отключено.` : 'Расширение отключено.'
            );
        },
        onError: (error) => notifyHttpError(error, 'Не удалось отключить расширение'),
    });
};

export const useRemoveAdminExtension = () => {
    const queryClient = useQueryClient();

    return useMutation({
        ...adminRemoveExtensionMutation(),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: adminListExtensionsQueryKey() });
            const name = variables.meta?.name;

            notifyReloadToApply('Расширение удалено', name ? `Расширение «${name}» удалено.` : 'Расширение удалено.');
        },
        onError: (error) => notifyHttpError(error, 'Не удалось удалить расширение'),
    });
};
