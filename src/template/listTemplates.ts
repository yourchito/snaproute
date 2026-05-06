import * as fs from "fs";
import * as path from "path";

export interface TemplateEntry {
  name: string;
  description: string;
  methods: string[];
  hasAuth: boolean;
  hasValidation: boolean;
}

const BUILTIN_TEMPLATES: TemplateEntry[] = [
  {
    name: "default",
    description: "Basic typed route handler with GET and POST support",
    methods: ["GET", "POST"],
    hasAuth: false,
    hasValidation: false,
  },
  {
    name: "crud",
    description: "Full CRUD route with GET, POST, PUT, DELETE handlers",
    methods: ["GET", "POST", "PUT", "DELETE"],
    hasAuth: false,
    hasValidation: true,
  },
  {
    name: "protected",
    description: "Auth-guarded route with session/token check middleware",
    methods: ["GET", "POST"],
    hasAuth: true,
    hasValidation: false,
  },
  {
    name: "webhook",
    description: "Webhook receiver with signature verification and POST only",
    methods: ["POST"],
    hasAuth: true,
    hasValidation: true,
  },
];

export function listBuiltinTemplates(): TemplateEntry[] {
  return BUILTIN_TEMPLATES;
}

export function listCustomTemplates(templateDir: string): TemplateEntry[] {
  if (!fs.existsSync(templateDir)) return [];

  return fs
    .readdirSync(templateDir)
    .filter((f) => f.endsWith(".ts") || f.endsWith(".js"))
    .map((f) => {
      const name = path.basename(f, path.extname(f));
      return {
        name,
        description: `Custom template: ${name}`,
        methods: [],
        hasAuth: false,
        hasValidation: false,
      };
    });
}

export function listAllTemplates(templateDir?: string): TemplateEntry[] {
  const builtin = listBuiltinTemplates();
  const custom = templateDir ? listCustomTemplates(templateDir) : [];
  return [...builtin, ...custom];
}

export function findTemplate(
  name: string,
  templateDir?: string
): TemplateEntry | undefined {
  return listAllTemplates(templateDir).find((t) => t.name === name);
}
