import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface DirectoryHandleDb extends DBSchema {
    directoryHandles: {
        value: {
            name: string;
            handle: FileSystemDirectoryHandle;
        };
        key: number;
    };
}

const DB_Name = "persistent-directory-db";
const DB_Version = 1;

export class PersistentDirectoryHandler {
    public static async init() {
        const db = await openDB<DirectoryHandleDb>(DB_Name, DB_Version, {
            upgrade(db) {
                for (const name of db.objectStoreNames) {
                    db.deleteObjectStore(name);
                }
                db.createObjectStore("directoryHandles", { autoIncrement: true });
            },
        });
        return new PersistentDirectoryHandler(db);
    }

    private constructor(private readonly db: IDBPDatabase<DirectoryHandleDb>) { }

    public async store(handle: FileSystemDirectoryHandle) {
        const tx = this.db.transaction("directoryHandles", "readwrite");
        await tx.store.clear();
        await tx.store.add({ name: handle.name, handle });
        tx.commit();
    }

    public async clear() {
        await this.db.clear("directoryHandles");
    }

    public async load() {
        const entry = await this.db.get("directoryHandles", IDBKeyRange.lowerBound(-1));
        return entry?.handle;
    }
}