type CustomApiResult = {
    message?: string;
    data?: unknown;
    status?: number;
};

type CustomDataTableResult = {
    draw: number,
    recordsTotal: number,
    recordsFiltered: number,
    data: unknown[],
};

type CustomValidateResult = {
    isValid: boolean,
    message?: string;
};

type DestinationCallback = (error: Error, destination: string) => void;

type FileNameCallback = (error: Error | string | string[] | null, filename: string) => void;

export {
    CustomApiResult,
    CustomDataTableResult,
    CustomValidateResult,
    DestinationCallback,
    FileNameCallback
};