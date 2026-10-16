import { PageContentBlock } from '@/sdk';
import { View, type ViewProps } from '@/sdk/theme';

export default function AccountActivityPage({ className }: ViewProps<'page.account.activity'>) {
    return (
        <PageContentBlock title='Журнал активности учётной записи' className={className}>
            <View name='activity.log' scope='account' />
        </PageContentBlock>
    );
}
