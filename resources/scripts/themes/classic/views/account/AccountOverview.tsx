import { Alert, cn, PageContentBlock, PageHeading } from '@/sdk';
import { Slot, View, type ViewProps } from '@/sdk/theme';

const CARD_WIDTH = 'w-full sm:w-[calc(50%_-_1rem)] md:w-auto md:flex-1';

export default function AccountOverview({ model, className }: ViewProps<'page.account.overview'>) {
    return (
        <PageContentBlock title='Обзор учётной записи' className={className}>
            <PageHeading title='Учётная запись' description='Управляйте профилем, учётными данными и безопасностью.' />
            {model.twoFactorRequired && (
                <Alert title='Требуется двухфакторная аутентификация' type='danger'>
                    Для продолжения необходимо включить двухфакторную аутентификацию на вашей учётной записи.
                </Alert>
            )}
            <Slot name='account.overview.before' />
            <div className={cn('flex flex-wrap lg:grid lg:grid-cols-3 mb-10', model.twoFactorRequired && 'mt-4')}>
                <View name='account.password' className={CARD_WIDTH} />
                <View name='account.email' className={cn(CARD_WIDTH, 'mt-8 sm:mt-0 sm:ml-8')} />
                <View name='account.twoFactor' className={cn(CARD_WIDTH, 'md:ml-8 mt-8 md:mt-0')} />
            </div>
            <Slot name='account.overview.after' />
        </PageContentBlock>
    );
}
