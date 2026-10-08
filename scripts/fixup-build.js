import path from 'node:path';
import fs from 'node:fs';

// TODO: remove this script once react-router fixes this issue
console.log('Applying workaround for this issue: https://github.com/remix-run/react-router/issues/14587')

function loudMove(inPath, outPath) {
  console.log(`Moving "${inPath}" to "${outPath}"...`)
  fs.renameSync(inPath, outPath);
}

const relPath = path.posix.relative('/', process.env.PUBLIC_BASE_PATH ?? '/');
if (relPath === '') {
  console.log('Skipped; no custom base path detected');
} else {
  const buildClientPath = path.resolve('build', 'client');
  const origPath = path.resolve(buildClientPath, relPath);
  const tmpBasePath = path.resolve(fs.mkdtempSync('.web-translit-fixup-'));
  const tmpPath = path.join(tmpBasePath, 'subfolder');
  try {
    loudMove(origPath, tmpPath);
    const dir = fs.opendirSync(tmpPath);
    for await (const dirent of dir) {
      loudMove(
        path.resolve(dirent.parentPath, dirent.name),
        path.resolve(buildClientPath, dirent.name),
      );
    }
  } finally {
    fs.rmSync(tmpBasePath, { recursive: true, force: true });
  }
}
