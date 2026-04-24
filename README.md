# snaproute

A lightweight CLI for scaffolding Next.js API routes with typed handlers and auto-generated docs.

---

## Installation

```bash
npm install -g snaproute
# or
npx snaproute
```

---

## Usage

Generate a new API route with a single command:

```bash
snaproute generate users/profile
```

This scaffolds the following structure:

```
app/
└── api/
    └── users/
        └── profile/
            ├── route.ts       # Typed Next.js route handler
            └── route.docs.ts  # Auto-generated API documentation
```

**Example generated handler (`route.ts`):**

```typescript
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json({ message: "OK" }, { status: 200 });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  return NextResponse.json({ data: body }, { status: 201 });
}
```

### Options

| Flag | Description |
|------|-------------|
| `--methods` | Specify HTTP methods to scaffold (e.g. `--methods GET,POST`) |
| `--no-docs` | Skip auto-generating the docs file |
| `--dry-run` | Preview output without writing files |

---

## License

[MIT](./LICENSE)