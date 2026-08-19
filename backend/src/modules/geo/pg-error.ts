export function isUniqueViolation(err: unknown): boolean {
    let current: unknown = err;
    for (let i = 0; i < 5 && current; i++) {
        if (typeof current === "object" && current !== null && "code" in current) {
            if ((current as { code?: string }).code === "23505") {
                return true;
            }
        }
        current =
            typeof current === "object" && current !== null && "cause" in current
                ? (current as { cause?: unknown }).cause
                : undefined;
    }
    return false;
}
