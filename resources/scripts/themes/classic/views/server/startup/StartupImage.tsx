import { Input, InputSpinner, Select, TitledGreyBox } from '@/sdk';
import type { ViewProps } from '@/sdk/theme';

export default function StartupImage({ model, className }: ViewProps<'server.startup.image'>) {
    return (
        <TitledGreyBox title='Docker-образ' className={className}>
            {model.images.length > 1 && !model.custom ? (
                <>
                    <InputSpinner visible={model.pending}>
                        <Select
                            disabled={model.images.length < 2}
                            value={model.image}
                            onChange={(value) => void model.select(String(value)).catch(() => {})}
                            options={model.images.map(({ label, value }) => ({ value, label }))}
                        />
                    </InputSpinner>
                    <p className='text-xs text-muted-foreground mt-2'>
                        Расширенная возможность: позволяет выбрать Docker-образ, который будет использоваться при
                        запуске этого сервера.
                    </p>
                </>
            ) : (
                <>
                    <Input disabled readOnly value={model.image} />
                    {model.custom && (
                        <p className='text-xs text-muted-foreground mt-2'>
                            Docker-образ этого сервера был установлен администратором вручную и не может быть изменён
                            через этот интерфейс.
                        </p>
                    )}
                </>
            )}
        </TitledGreyBox>
    );
}
