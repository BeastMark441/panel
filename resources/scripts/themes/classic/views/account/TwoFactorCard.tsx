import { Button, ContentBox } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';
import DisableTwoFactorDialog from './DisableTwoFactorDialog';
import RecoveryTokensDialog from './RecoveryTokensDialog';
import SetupTwoFactorDialog from './SetupTwoFactorDialog';

export default function TwoFactorCard({ model, className }: ViewProps<'account.twoFactor'>) {
    return (
        <ContentBox className={className} title='Двухфакторная аутентификация'>
            <div>
                <SetupTwoFactorDialog model={model} />
                <RecoveryTokensDialog tokens={model.recoveryTokens} onClose={model.dismissRecoveryTokens} />
                <DisableTwoFactorDialog model={model} />
                <p className='text-sm'>
                    {model.enabled
                        ? 'Двухфакторная аутентификация на вашей учётной записи включена.'
                        : 'Двухфакторная аутентификация на вашей учётной записи не включена. Нажмите кнопку ниже, чтобы настроить её.'}
                </p>
                <div className='mt-6'>
                    {model.enabled ? (
                        <Button.Danger onClick={() => model.openDialog('disable')}>
                            Отключить двухфакторную аутентификацию
                        </Button.Danger>
                    ) : (
                        <Button onClick={() => model.openDialog('enable')}>
                            Включить двухфакторную аутентификацию
                        </Button>
                    )}
                </div>
            </div>
        </ContentBox>
    );
}
