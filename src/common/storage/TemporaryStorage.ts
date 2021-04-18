import PlatformStorage from "./PlatformStorage";

export class StoredValue<T> {
    expires?: number;
    payload: T;
}

export interface TemporaryValue<T> {
    // Storage duration, in seconds.
    duration?: number;
    payload: T;
}

abstract class TemporaryStorage<T> implements PlatformStorage<StoredValue<T>> {
    private inner: PlatformStorage<StoredValue<T>>;

    constructor(inner: PlatformStorage<StoredValue<T>>) {
        this.inner = inner;
    }

    async set(entries: { [key: string]: TemporaryValue<T> }): Promise<void> {
        const iter = Object.entries(entries);
        const mapped = await Promise.all(
            iter.map(async ([key, val]) => {
                let expires = undefined;
                if (val.duration) {
                    expires = this.epochMilliseconds() + 1000 * val.duration;
                }

                return [
                    key,
                    {
                        expires,
                        payload: val.payload,
                    },
                ];
            }),
        );

        await this.inner.set(Object.fromEntries(mapped));
    }

    async get(keys: string[]): Promise<{ [key: string]: TemporaryValue<T> | undefined }> {
        const entries = await this.inner.get(keys);

        const now = this.epochMilliseconds();
        const mapped = await Promise.all(
            Object.entries(entries).map(
                async ([key, val]): Promise<[string, TemporaryValue<T> | undefined]> => {
                    if (val) {
                        let duration = undefined;
                        if (val.expires) {
                            if (val.expires > now) {
                                return [key, undefined];
                            }

                            duration = (val.expires - now) / 1000;
                        }
                        return [key, { duration, payload: val.payload }];
                    }
                    return [key, undefined];
                },
            ),
        );

        return Object.fromEntries(mapped);
    }

    async del(keys: string[]): Promise<void> {
        await this.inner.del(keys);
    }

    abstract checkValid(val: StoredValue<T>): Promise<boolean>;

    private epochMilliseconds(): number {
        return Date.now();
    }
}

export default TemporaryStorage;
