-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Phone" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mac_address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Unknown',
    "ip" TEXT,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Phone" ("id", "mac_address", "status", "ip", "updatedAt") SELECT "id", "mac_address", "status", "ip", "updatedAt" FROM "Phone";
DROP TABLE "Phone";
ALTER TABLE "new_Phone" RENAME TO "Phone";
CREATE UNIQUE INDEX "Phone.mac_address_unique" ON "Phone"("mac_address");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;