import { Button, Dialog, InputSpinner, Select, SpinnerOverlay } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';

export default function JavaVersionPrompt({ model }: ViewProps<'server.feature.javaVersion'>) {
    return (
        <Dialog
            open={model.open}
            title='Неподдерживаемая версия Java'
            onClose={model.close}
            preventExternalClose={model.pending}
            hideCloseIcon={model.pending}
        >
            <SpinnerOverlay visible={model.pending} />
            <p className='mt-4'>
                На этом сервере в настоящее время используется неподдерживаемая версия Java, поэтому его невозможно
                запустить.
                {model.canChangeImage && (
                    <>&nbsp;Выберите поддерживаемую версию из списка ниже, чтобы продолжить запуск сервера.</>
                )}
            </p>
            {model.canChangeImage && (
                <div className='mt-4'>
                    <InputSpinner visible={model.loading}>
                        <Select
                            disabled={!model.images}
                            value={model.selected}
                            onChange={(value) => model.select(String(value))}
                            options={(model.images ?? []).map(({ label, value }) => ({ value, label }))}
                        />
                    </InputSpinner>
                </div>
            )}
            <div className='mt-8 flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-4 sm:space-y-0'>
                <Button isSecondary onClick={model.close} className='w-full sm:w-auto'>
                    Отмена
                </Button>
                {model.canChangeImage && (
                    <Button onClick={() => void model.update().catch(() => {})} className='w-full sm:w-auto'>
                        Обновить Docker-образ
                    </Button>
                )}
            </div>
        </Dialog>
    );
}
