import React, { useState } from 'react';
import { Dialog, type DialogProps } from '@/components/elements/dialog';
import Button from '@/components/elements/Button';
import { TextInput } from '@/components/form/controls';
import Tooltip from '@/components/elements/tooltip/Tooltip';
import { useDisableAccountTwoFactor } from '@/api/account/two-factor/queries';

const DisableTOTPDialogContent = ({
    disableTwoFactor,
    onClose,
}: {
    disableTwoFactor: ReturnType<typeof useDisableAccountTwoFactor>;
    onClose: () => void;
}) => {
    const [password, setPassword] = useState('');

    const submit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();

        if (disableTwoFactor.isPending) {
            return;
        }

        try {
            await disableTwoFactor.mutateAsync({ body: { password } });
            onClose();
        } catch {
            // Error toast is handled by the mutation.
        }
    };

    return (
        <form id='disable-totp-form' className='mt-6' onSubmit={submit}>
            <label className='block pb-1' htmlFor='totp-password'>
                Пароль
            </label>
            <TextInput
                id='totp-password'
                type='password'
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.currentTarget.value)}
            />
            <Dialog.Footer>
                <Button.Text onClick={onClose}>Отмена</Button.Text>
                <Tooltip
                    delay={100}
                    disabled={password.length > 0}
                    content='Для продолжения введите пароль от учётной записи.'
                >
                    <Button.Danger
                        type='submit'
                        form='disable-totp-form'
                        disabled={disableTwoFactor.isPending || !password.length}
                        isLoading={disableTwoFactor.isPending}
                    >
                        Отключить
                    </Button.Danger>
                </Tooltip>
            </Dialog.Footer>
        </form>
    );
};

export default function DisableTOTPDialog({ open, onClose }: DialogProps) {
    const disableTwoFactor = useDisableAccountTwoFactor();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            preventExternalClose={disableTwoFactor.isPending}
            hideCloseIcon={disableTwoFactor.isPending}
            title='Отключение двухфакторной аутентификации'
            description='Отключение двухфакторной аутентификации снизит безопасность учётной записи.'
        >
            <DisableTOTPDialogContent disableTwoFactor={disableTwoFactor} onClose={onClose} />
        </Dialog>
    );
}
