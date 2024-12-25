const randomName = () => `test-${Math.random().toString(36)}`;

const bearerToken = (token: string) => `Bearer ${token}`;

export { randomName, bearerToken };
