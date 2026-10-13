import Button from '@/components/elements/Button';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface Props {
    apiKey: string;
    onClose: () => void;
}

export default function ApiKeyModalContent({ apiKey, onClose }: Props) {
    return (
        <>
            <p className='text-sm mb-6'>
                Запрошенный вами API-ключ показан ниже. Сохраните его в надёжном месте — он не будет показан повторно.
            </p>
            <pre className='overflow-x-scroll text-sm bg-muted rounded-sm py-2 px-4 font-mono'>
                <CopyOnClick text={apiKey}>
                    <code className='font-mono'>{apiKey}</code>
                </CopyOnClick>
            </pre>
            <div className='flex justify-end mt-6'>
                <Button type='button' onClick={onClose}>
                    Закрыть
                </Button>
            </div>
        </>
    );
}
