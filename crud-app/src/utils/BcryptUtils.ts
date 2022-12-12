import bcrypt from 'bcrypt';

const SALT = 10;

const hashPassword = async (rawPassword: string) => {
    const hash = await bcrypt.hash(rawPassword, SALT);
    return hash;
};

const comparePassword = async (rawPassword: string, hashedPassword: string) => {
    const result = await bcrypt.compare(rawPassword, hashedPassword);
    return result;
};

export { hashPassword, comparePassword };