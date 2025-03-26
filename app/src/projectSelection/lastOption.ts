import { PersistentDirectoryHandler } from "../db";

const LAST_USED_DIR_DB_ID = "LAST_USED_DIR_DB_ID";

export async function tryOpenLastUsedDir(db: PersistentDirectoryHandler) {
    const lastUsedKeyString = sessionStorage.getItem(LAST_USED_DIR_DB_ID);
    if (lastUsedKeyString === null) {
        return undefined;
    }

    const lastUsedKey = parseInt(lastUsedKeyString);

    const entry = await db.getById(lastUsedKey);
    if (entry === undefined) {
        return undefined;
    }
    const permissions = await entry.handle.queryPermission({ mode: "read" });
    if (permissions !== "granted") {
        return undefined;
    }

    return entry;
}

export function removeLastUsedDirReference() {
    sessionStorage.removeItem(LAST_USED_DIR_DB_ID);
}

export function setLastUsedDirReference(id: number) {
    sessionStorage.setItem(LAST_USED_DIR_DB_ID, id.toString());
}