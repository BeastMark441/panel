import { useState } from 'react';
import Button from '@/components/elements/Button';
import SetupTOTPDialog from '@/components/dashboard/forms/SetupTOTPDialog';
import RecoveryTokensDialog from '@/components/dashboard/forms/RecoveryTokensDialog';
import DisableTOTPDialog from '@/components/dashboard/forms/DisableTOTPDialog';
import { useCurrentUser } from '@/api/account/queries';

function ConfigureTwoFactorForm() {
    const [tokens, setTokens] = useState<string[]>([]);
    const [visible, setVisible] = useState<'enable' | 'disable' | null>(null);
    const isEnabled = useCurrentUser().useTotp;

    const onTokens = (tokens: string[]) => {
        setTokens(tokens);
        setVisible(null);
    };

    return (
        <div>
            <SetupTOTPDialog
                open={visible === 'enable'}
                enabled={visible === 'enable'}
                onClose={() => setVisible(null)}
                onTokens={onTokens}
            />
            <RecoveryTokensDialog tokens={tokens} open={tokens.length > 0} onClose={() => setTokens([])} />
            <DisableTOTPDialog open={visible === 'disable'} onClose={() => setVisible(null)} />
            <p className='text-sm'>
                {isEnabled
                    ? 'Двухфакторная аутентификация на вашей учётной записи включена.'
                    : 'Двухфакторная аутентификация на вашей учётной записи не включена. Нажмите кнопку ниже, чтобы настроить её.'}
            </p>
            <div className='mt-6'>
                {isEnabled ? (
                    <Button.Danger onClick={() => setVisible('disable')}>
                        Отключить двухфакторную аутентификацию
                    </Button.Danger>
                ) : (
                    <Button onClick={() => setVisible('enable')}>Включить двухфакторную аутентификацию</Button>
                )}
            </div>
        </div>
    );
}

export default ConfigureTwoFactorForm;
