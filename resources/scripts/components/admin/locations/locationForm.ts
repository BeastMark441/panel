export const validateShortCode = (value: string): string | undefined => {
    if (value.length < 1) {
        return 'Укажите короткий код.';
    }

    if (value.length > 60) {
        return 'Короткий код не должен превышать 60 символов.';
    }

    return undefined;
};
