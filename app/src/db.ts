import { openDB, DBSchema, IDBPDatabase } from "idb";

interface DirectoryHandleDb extends DBSchema {
    directoryHandles: {
        key: number,
        value: StoredDirectoryHandle;
    };
}
export interface StoredDirectoryHandle {
    readonly id: number,
    readonly lastUsed: Date,
    readonly handle: FileSystemDirectoryHandle,
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
                db.createObjectStore("directoryHandles", { autoIncrement: true, keyPath: "id" });
            },
        });
        return new PersistentDirectoryHandler(db);
    }

    private constructor(private readonly db: IDBPDatabase<DirectoryHandleDb>) { }

    public async add(handle: FileSystemDirectoryHandle) {
        const newEntry: Omit<StoredDirectoryHandle, "id"> = {
            handle,
            lastUsed: new Date(),
        }
        await this.db.add("directoryHandles", newEntry as unknown as StoredDirectoryHandle);//This type cast hack is necessary because the ID will be auto incremented
    }

    public async delete(id: number) {
        await this.db.delete("directoryHandles", id);
    }

    public async clear() {
        await this.db.clear("directoryHandles");
    }

    public async getAll(): Promise<StoredDirectoryHandle[]> {
        const entries = await this.db.getAll("directoryHandles");
        return entries;
    }

    public async getById(id: number): Promise<StoredDirectoryHandle | undefined> {
        return this.db.get("directoryHandles", id);
    }
}