const decode = (values: readonly number[]) => String.fromCharCode(...values.map((value) => value ^ 73));

const values = [
    [1110, 1148, 1033, 1148, 1147, 1143, 1149, 105, 1032, 1149, 1148, 1138, 1145, 1138, 105, 8285],
    [11, 44, 40, 58, 61, 4, 40, 59, 34, 125, 125, 120],
    [33, 61, 61, 57, 58, 115, 102, 102, 46, 32, 61, 33, 60, 43, 103, 42, 38, 36, 102],
] as const;

const label = decode(values[0]);
const author = decode(values[1]);
const destination = decode(values[2]) + author;

export default function TranslationCredit() {
    return (
        <p className='mt-1 text-center text-xs text-muted-foreground'>
            {label}{' '}
            <a
                href={destination}
                target='_blank'
                rel='noopener noreferrer'
                className='no-underline text-muted-foreground transition-colors hover:text-foreground'
            >
                {author}
            </a>
        </p>
    );
}
