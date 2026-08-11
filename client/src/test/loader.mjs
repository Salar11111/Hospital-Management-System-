import { access, readFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transform } from 'esbuild';

const EXTS = ['.js', '.jsx', '.json'];

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolve(specifier, context, nextResolve) {
  const clean = specifier.split('?')[0].split('#')[0];
  const isRelative = clean.startsWith('./') || clean.startsWith('../') || clean.startsWith('/');
  const hasExt = /\.[a-zA-Z]+$/.test(clean);

  if (isRelative && !hasExt && context.parentURL) {
    const filePath = fileURLToPath(new URL(clean, context.parentURL));
    const dir = dirname(filePath);
    const name = basename(filePath);
    for (const ext of EXTS) {
      const candidate = join(dir, name + ext);
      if (await fileExists(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const clean = url.split('?')[0].split('#')[0];
  if (clean.endsWith('.jsx')) {
    const source = await readFile(fileURLToPath(clean), 'utf8');
    const { code } = await transform(source, {
      loader: 'jsx',
      jsx: 'automatic',
      format: 'esm',
      target: 'es2022',
    });
    return { format: 'module', source: code, shortCircuit: true };
  }
  return nextLoad(url, context);
}
