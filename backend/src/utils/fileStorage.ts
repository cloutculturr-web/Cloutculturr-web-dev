import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Private storage root — outside any statically-served path. Never register
// this with express.static; access must always go through an authenticated
// download route.
export const UPLOADS_ROOT = path.join(__dirname, '../../uploads');

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_FILES_PER_APPLICATION = 5;

function extensionFor(mimetype: string): string {
  switch (mimetype) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'application/pdf':
      return '.pdf';
    default:
      return '';
  }
}

/**
 * Saves an in-memory uploaded file to private disk storage under a scoped
 * owner directory, using a randomly generated filename (never the original
 * client-supplied name, to avoid path-traversal / collisions).
 * Returns the path stored in the File document, relative to UPLOADS_ROOT.
 */
export function saveOwnerFile(
  ownerType: string,
  ownerId: string,
  buffer: Buffer,
  mimetype: string
): { storagePath: string; size: number } {
  const dir = path.join(UPLOADS_ROOT, ownerType, ownerId);
  fs.mkdirSync(dir, { recursive: true });

  const filename = `${crypto.randomBytes(16).toString('hex')}${extensionFor(mimetype)}`;
  const absolutePath = path.join(dir, filename);
  fs.writeFileSync(absolutePath, buffer);

  return {
    storagePath: path.join(ownerType, ownerId, filename),
    size: buffer.length,
  };
}

export function resolveStoredFilePath(storagePath: string): string {
  const resolved = path.resolve(UPLOADS_ROOT, storagePath);
  // Defense in depth against path traversal even though storagePath is
  // always server-generated, never taken directly from user input.
  if (!resolved.startsWith(path.resolve(UPLOADS_ROOT))) {
    throw new Error('Invalid stored file path');
  }
  return resolved;
}
