export const validateMountName = (value: string): string | undefined => {
    if (value.length < 2) {
        return 'Название должно содержать не менее 2 символов.';
    }

    if (value.length > 64) {
        return 'Название не должно превышать 64 символов.';
    }

    return undefined;
};
