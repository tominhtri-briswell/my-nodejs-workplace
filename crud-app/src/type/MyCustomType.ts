type CustomApiResult<Entity> = {
    message?: string;
    messages?: string[];
    data?: Entity | Entity[] | null;
    status?: number;
};

type CustomDataTableResult = {
    draw: number,
    recordsTotal: number,
    recordsFiltered: number,
    data: unknown[],
};

type CustomValidateResult<Entity> = {
    isValid: boolean,
    message?: string;
    data?: Entity | Entity[] | null;
    datas?: Entity[] | null;
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