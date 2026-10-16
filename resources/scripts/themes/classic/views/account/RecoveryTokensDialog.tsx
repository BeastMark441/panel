import { Alert, Button, CopyOnClick, Dialog } from '@/sdk';

export default function RecoveryTokensDialog({ tokens, onClose }: { tokens: readonly string[]; onClose: () => void }) {
    const grouped: [string, string][] = [];

    for (const [index, token] of tokens.entries()) {
        if (index % 2 === 0) {
            grouped.push([token, tokens[index + 1] || '']);
        }
    }

    return (
        <Dialog
            open={tokens.length > 0}
            onClose={onClose}
            title='Двухфакторная аутентификация включена'
            description='Сохраните коды ниже в надёжном месте. Если вы потеряете доступ к телефону, сможете войти с помощью этих кодов восстановления.'
            hideCloseIcon
            preventExternalClose
        >
            <Dialog.Icon position='container' type='success' />
            <CopyOnClick text={tokens.join('\n')} showInNotification={false}>
                <pre className='bg-background rounded-sm p-2 mt-6'>
                    {grouped.map((value) => (
                        <span key={value.join('_')} className='block'>
                            {value[0]}
                            <span className='mx-2 selection:bg-background'>&nbsp;</span>
                            {value[1]}
                            <span className='selection:bg-background'>&nbsp;</span>
                        </span>
                    ))}
                </pre>
            </CopyOnClick>
            <Alert type='danger' className='mt-3'>
                Эти коды не будут показаны повторно.
            </Alert>
            <Dialog.Footer>
                <Button.Text onClick={onClose}>Готово</Button.Text>
            </Dialog.Footer>
        </Dialog>
    );
}
