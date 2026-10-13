import React, { useState } from 'react';
import { Dialog, type DialogProps } from '@/components/elements/dialog';
import { QRCodeSVG } from 'qrcode.react';
import Button from '@/components/elements/Button';
import Spinner from '@/components/elements/Spinner';
import { TextInput } from '@/components/form/controls';
import CopyOnClick from '@/components/elements/CopyOnClick';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { useAccountTwoFactorToken, useEnableAccountTwoFactor } from '@/api/account/two-factor/queries';
import { httpErrorToHuman } from '@/api/http';
import { Alert } from '@/components/elements/alert';

interface Props {
    enabled: boolean;
    onTokens: (tokens: string[]) => void;
}

const TotpQrCode = ({ failed, imageUrlData }: { failed: boolean; imageUrlData: string | undefined }) => {
    if (failed) {
        return <span className='text-sm text-muted-foreground text-center'>Не удалось загрузить QR-код.</span>;
    }

    if (imageUrlData === undefined) {
        return <Spinner />;
    }

    return <QRCodeSVG value={imageUrlData} className='w-full h-full shadow-none' />;
};

const ConfigureTwoFactorForm = ({
    enabled,
    enableTwoFactor,
    onClose,
    onTokens,
}: Props & {
    enableTwoFactor: ReturnType<typeof useEnableAccountTwoFactor>;
    onClose: () => void;
}) => {
    const [value, setValue] = useState('');
    const [password, setPassword] = useState('');
    const { data: tokenResponse, error, isFetching, refetch } = useAccountTwoFactorToken(enabled);
    const token = tokenResponse?.data;
    const secretGroups = token?.secret.match(/.{1,4}/g);

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (enableTwoFactor.isPending) {
            return;
        }

        try {
            const response = await enableTwoFactor.mutateAsync({ body: { code: value, password } });

            onTokens(response.attributes.tokens);
        } catch {
            // Error toast is handled by the mutation.
        }
    };

    return (
        <form id='enable-totp-form' onSubmit={submit}>
            <div className='flex items-center justify-center w-56 h-56 p-2 bg-card shadow-sm mx-auto mt-6'>
                <TotpQrCode failed={!!error && !isFetching} imageUrlData={token?.image_url_data} />
            </div>
            <CopyOnClick text={token?.secret}>
                <p className='font-mono text-sm text-foreground text-center mt-2'>
                    {secretGroups?.join(' ') || 'Загрузка...'}
                </p>
            </CopyOnClick>
            {error && !isFetching && (
                <div className='mt-4 space-y-3'>
                    <Alert type='danger'>{httpErrorToHuman(error)}</Alert>
                    <Button.Text type='button' onClick={() => refetch()}>
                        Повторить
                    </Button.Text>
                </div>
            )}
            <p id='totp-code-description' className='mt-6'>
                Отсканируйте QR-код с помощью приложения для двухфакторной аутентификации. Затем введите 6-значный код в
                поле ниже.
            </p>
            <TextInput
                aria-labelledby='totp-code-description'
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)}
                className='mt-3'
                placeholder='000000'
                type='text'
                inputMode='numeric'
                autoComplete='one-time-code'
                pattern='[0-9]{6}'
            />
            <label htmlFor='totp-password' className='block mt-3'>
                Пароль учётной записи
            </label>
            <TextInput
                className='mt-1'
                type='password'
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}
            />
            <Dialog.Footer>
                <Button.Text onClick={onClose}>Отмена</Button.Text>
                <Tooltip
                    disabled={password.length > 0 && value.length === 6}
                    content={token ? 'Для продолжения введите 6-значный код и пароль.' : 'Ожидание загрузки QR-кода...'}
                    delay={100}
                >
                    <Button
                        disabled={!token || value.length !== 6 || !password.length || enableTwoFactor.isPending}
                        isLoading={enableTwoFactor.isPending}
                        type='submit'
                        form='enable-totp-form'
                    >
                        Включить
                    </Button>
                </Tooltip>
            </Dialog.Footer>
        </form>
    );
};

export default function SetupTOTPDialog({ enabled, onClose, onTokens, open }: Props & DialogProps) {
    const enableTwoFactor = useEnableAccountTwoFactor();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            preventExternalClose={enableTwoFactor.isPending}
            hideCloseIcon={enableTwoFactor.isPending}
            title='Включение двухфакторной аутентификации'
            description='Защитите учётную запись от несанкционированного доступа. При каждом входе будет запрашиваться код подтверждения.'
        >
            <ConfigureTwoFactorForm
                enabled={enabled}
                enableTwoFactor={enableTwoFactor}
                onClose={onClose}
                onTokens={onTokens}
            />
        </Dialog>
    );
}
