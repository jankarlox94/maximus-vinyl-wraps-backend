-- CreateTable
CREATE TABLE "Estimate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "customerName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "serviceType" TEXT NOT NULL DEFAULT 'Digital Printing',
    "hasImage" BOOLEAN,
    "width" TEXT,
    "height" TEXT,
    "unit" TEXT,
    "dimensions" TEXT,
    "quantity" TEXT,
    "paperStock" TEXT NOT NULL DEFAULT 'Standard 80lb',
    "finish" TEXT NOT NULL DEFAULT 'Matte',
    "notes" TEXT,
    "imagePath" TEXT
);
