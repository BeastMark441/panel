import {
    Alert,
    Button,
    CopyOnClick,
    Dialog,
    Input,
    QrCode,
    Spinner,
    Tooltip,
    type AccountTwoFactorModel,
    type TwoFactorSetupModel,
} from '@/sdk';

function SecretQrCode({ setup }: { setup: TwoFactorSetupModel }) {
    if (setup.error) {
        return <span className='text-sm text-muted-foreground text-center'>Не удалось загрузить QR-код.</span>;
    }

    return setup.qrCode === null ? <Spinner /> : <QrCode value={setup.qrCode} className='w-full h-full shadow-none' />;
}

function SetupForm({ setup, onClose }: { setup: TwoFactorSetupModel; onClose: () => void }) {
    const { code, password } = setup.fields;
    const complete = password.fieldProps.value.length > 0 && code.fieldProps.value.length === 6;

    return (
        <form
            id='enable-totp-form'
            onSubmit={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setup.submit();
            }}
        >
            <div className='flex items-center justify-center w-56 h-56 p-2 bg-card shadow-sm mx-auto mt-6'>
                <SecretQrCode setup={setup} />
            </div>
            <CopyOnClick text={setup.secret ?? undefined}>
                <p className='font-mono text-sm text-foreground text-center mt-2'>
                    {setup.secret?.match(/.{1,4}/g)?.join(' ') || 'Загрузка...'}
                </p>
            </CopyOnClick>
            {setup.error && (
                <div className='mt-4 space-y-3'>
                    <Alert type='danger'>{setup.error}</Alert>
                    <Button.Text type='button' onClick={setup.retry}>
                        Повторить
                    </Button.Text>
                </div>
            )}
            <p id='totp-code-description' className='mt-6'>
                Отсканируйте QR-код с помощью приложения для двухфакторной аутентификации. Затем введите 6-значный код в
                поле ниже.
            </p>
            <Input {...code.fieldProps} aria-labelledby='totp-code-description' className='mt-3' placeholder='000000' />
            <label htmlFor='totp-password' className='block mt-3'>
                Пароль учётной записи
            </label>
            <Input {...password.fieldProps} id='totp-password' className='mt-1' />
            <Dialog.Footer>
                <Button.Text onClick={onClose}>Отмена</Button.Text>
                <Tooltip
                    disabled={complete}
                    content={
                        setup.secret
                            ? 'Для продолжения введите 6-значный код и пароль.'
                            : 'Ожидание загрузки QR-кода...'
                    }
                    delay={100}
                >
                    <Button
                        disabled={!setup.canSubmit}
                        isLoading={setup.submitting}
                        type='submit'
                        form='enable-totp-form'
                    >
                        Включить
                    </Button>
                </Tooltip>
            </Dialog.Footer>
        </form>
    );
}

export default function SetupTwoFactorDialog({ model }: { model: AccountTwoFactorModel }) {
    return (
        <Dialog
            open={model.dialog === 'enable'}
            onClose={model.closeDialog}
            preventExternalClose={model.setup.submitting}
            hideCloseIcon={model.setup.submitting}
            title='Включение двухфакторной аутентификации'
            description='Защитите учётную запись от несанкционированного доступа. При каждом входе будет запрашиваться код подтверждения.'
        >
            <SetupForm setup={model.setup} onClose={model.closeDialog} />
        </Dialog>
    );
}
