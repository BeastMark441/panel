import { queryOptions, skipToken, useQuery, type QueryClient } from '@tanstack/react-query';
import type { SiteSettings } from '@/api/settings/types';
import { getBootstrapSiteSettings } from '@/bootstrap';

export const siteSettingsQueryKey = ['bootstrap', 'site-settings'] as const;

const getSiteSettings = (): SiteSettings => {
    const settings = getBootstrapSiteSettings();

    if (!settings) {
        throw new Error('Site settings have not been hydrated.');
    }

    return settings;
};

/** Bootstrap data with no fetcher; changed only by `setSiteSettingsQueryData`. */
export const siteSettingsQueryOptions = () =>
    queryOptions({
        queryKey: siteSettingsQueryKey,
        queryFn: skipToken,
        initialData: getSiteSettings,
        staleTime: 'static',
    });

export const useSiteSettings = (): SiteSettings => {
    const { data } = useQuery(siteSettingsQueryOptions());

    if (data === undefined) {
        throw new Error('Site settings have not been hydrated.');
    }

    return data;
};

export const setSiteSettingsQueryData = (
    queryClient: QueryClient,
    updater: (settings: SiteSettings) => SiteSettings
) => {
    queryClient.setQueryData<SiteSettings>(siteSettingsQueryKey, (settings) => updater(settings ?? getSiteSettings()));
};
