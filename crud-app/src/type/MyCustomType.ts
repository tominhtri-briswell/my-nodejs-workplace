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

export { CustomApiResult, CustomDataTableResult, CustomValidateResult };