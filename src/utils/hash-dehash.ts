import bcrypt from 'bcrypt'

async function hashPayload(payload: string): Promise<string> {
    const salt = Number(process.env.SALT);
    return await bcrypt.hash(payload, salt);
}

async function dehashPayload(payload: string, hashedPayload: string): Promise<boolean> {
    return await bcrypt.compare(payload, hashedPayload);
}

export { hashPayload, dehashPayload };