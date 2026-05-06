import fs from "fs";
import path from "path";

export interface CustomTemplateOptions {
  name: string;
  content: string;
  overwrite?: boolean;
}

export interface SaveTemplateResult {
  success: boolean;
  path?: string;
  error?: string;
  overwritten?: boolean;
}

export interface DeleteTemplateResult {
  success: boolean;
  path?: string;
  error?: string;
}

export function resolveCustomTemplateDir(baseDir: string): string {
  return path.join(baseDir, ".snaproute", "templates");
}

export function resolveCustomTemplatePath(baseDir: string, name: string): string {
  const dir = resolveCustomTemplateDir(baseDir);
  return path.join(dir, `${name}.ts`);
}

export function saveCustomTemplate(
  baseDir: string,
  options: CustomTemplateOptions
): SaveTemplateResult {
  const { name, content, overwrite = false } = options;
  const dir = resolveCustomTemplateDir(baseDir);
  const filePath = resolveCustomTemplatePath(baseDir, name);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const exists = fs.existsSync(filePath);
  if (exists && !overwrite) {
    return {
      success: false,
      error: `Template "${name}" already exists. Use --overwrite to replace it.`,
    };
  }

  fs.writeFileSync(filePath, content, "utf-8");
  return { success: true, path: filePath, overwritten: exists };
}

export function deleteCustomTemplate(
  baseDir: string,
  name: string
): DeleteTemplateResult {
  const filePath = resolveCustomTemplatePath(baseDir, name);

  if (!fs.existsSync(filePath)) {
    return { success: false, error: `Template "${name}" not found.` };
  }

  fs.unlinkSync(filePath);
  return { success: true, path: filePath };
}
