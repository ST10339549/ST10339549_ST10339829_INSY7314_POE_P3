import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Increased salt rounds for better security

export async function hashPassword(plainTextPassword) {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return bcrypt.hash(plainTextPassword, salt);
}

export async function comparePassword(plainTextPassword, hashedPassword) {
    return bcrypt.compare(plainTextPassword, hashedPassword);
}