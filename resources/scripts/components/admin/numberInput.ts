/** `null`, пока поле ввода пустое. */
export type NumberInputValue = number | null;

export const requiredNumber =
    (message: string, check?: (value: number) => string | undefined) =>
    ({ value }: { value: NumberInputValue }): string | undefined =>
        value === null ? message : check?.(value);

export const submittedNumber = (value: NumberInputValue): number => {
    if (value === null) {
        throw new Error('Обязательное числовое поле не заполнено.');
    }

    return value;
};
