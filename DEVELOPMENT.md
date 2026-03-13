# Camino Development Guide

## Project Structure

\`\`\`
camino/
├── app/
│   ├── (protected)/          # Protected routes with auth
│   │   ├── dashboard/        # User dashboard
│   │   ├── signals/          # Signals dashboard
│   │   ├── mission/          # Mission and team views
│   │   ├── decisions/        # Decision tracking
│   │   ├── insights/         # Analytics and insights
│   │   └── upload/           # Data upload interface
│   ├── auth/                 # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── onboarding/
│   │   └── check-email/
│   ├── api/                  # API routes
│   │   ├── upload/
│   │   ├── signals/
│   │   ├── decisions/
│   │   ├── benchmarks/
│   │   └── kpis/
│   └── layout.tsx            # Root layout
├── components/               # React components
│   ├── ui/                   # shadcn/ui components
│   ├── app-nav.tsx           # Main navigation
│   ├── signal-card.tsx       # Signal display card
│   └── ...                   # Other components
├── lib/                      # Utility functions
│   ├── supabase/             # Supabase clients
│   ├── signals-service.ts    # Signal data operations
│   ├── decisions-service.ts  # Decision operations
│   ├── mission-service.ts    # KPI and mission logic
│   └── csv-parser.ts         # CSV parsing utilities
├── scripts/                  # SQL migration scripts
│   ├── 001_create_profiles.sql
│   ├── 002_create_signals.sql
│   ├── 003_create_kpis_and_decisions.sql
│   └── 004_data_foundations_and_benchmarks.sql
└── public/                   # Static assets
\`\`\`

## Key Technologies

### Frontend
- **Next.js 15**: App Router, Server Components
- **React 19**: Latest features including useEffectEvent
- **Tailwind CSS v4**: Utility-first styling
- **shadcn/ui**: Component library
- **Recharts**: Data visualization

### Backend
- **Supabase**: PostgreSQL database + auth
- **Vercel AI SDK**: OpenAI integration for analysis
- **Server Actions**: Form submissions and mutations

### Development
- **TypeScript**: Type safety
- **ESLint**: Code linting
- **v0**: AI-powered development

## Development Workflow

### 1. Local Setup
\`\`\`bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
open http://localhost:3000
\`\`\`

### 2. Making Changes

**Adding a New Feature**
1. Create branch (if using Git)
2. Build feature in v0 or locally
3. Test thoroughly
4. Update documentation
5. Deploy preview to test

**Adding a New Page**
\`\`\`typescript
// app/(protected)/new-feature/page.tsx
import { createClient } from "@/lib/supabase/server"

export default async function NewFeaturePage() {
  const supabase = await createClient()
  // ... your code
  
  return <div>Your page</div>
}
\`\`\`

**Adding an API Route**
\`\`\`typescript
// app/api/new-endpoint/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // ... your logic
  
  return NextResponse.json({ data: [] })
}
\`\`\`

### 3. Database Changes

**Adding a New Table**
1. Write SQL migration in `scripts/`
2. Test locally in Supabase SQL editor
3. Add RLS policies
4. Update TypeScript types
5. Create service functions in `lib/`

**Example Migration**
\`\`\`sql
-- scripts/005_new_feature.sql
CREATE TABLE new_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Policy: Users see only their own data
CREATE POLICY "Users can view own data"
  ON new_table FOR SELECT
  USING (auth.uid() = user_id);
\`\`\`

### 4. Testing

**Manual Testing Checklist**
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)
- [ ] Auth flows (signup, login, logout)
- [ ] Data upload and parsing
- [ ] Signal creation and display
- [ ] Decision tracking
- [ ] Navigation between pages

**Testing Auth**
\`\`\`typescript
// Test in browser console
const { data: { user } } = await supabase.auth.getUser()
console.log(user) // Should show current user
\`\`\`

**Testing Database**
\`\`\`sql
-- Run in Supabase SQL editor
SELECT * FROM profiles LIMIT 5;
SELECT * FROM signals LIMIT 5;
SELECT COUNT(*) FROM signal_data_points;
\`\`\`

## Common Tasks

### Add New Signal Category
\`\`\`typescript
// Update type in lib/signals-service.ts
type SignalCategory = 
  | "revenue"
  | "customer"
  | "product"
  | "operations"
  | "your-new-category" // Add here
\`\`\`

### Change AI Analysis Prompt
\`\`\`typescript
// Update in lib/signals-service.ts
const analysis = await generateText({
  model: "openai/gpt-4o",
  prompt: `Your updated prompt here...`
})
\`\`\`

### Add New Benchmark Type
\`\`\`sql
-- Update enum in database
ALTER TYPE benchmark_type ADD VALUE 'your_new_type';
\`\`\`

### Customize Email Templates
1. Go to Supabase Dashboard
2. Authentication → Email Templates
3. Edit HTML templates
4. Use variables: `{{ .Email }}`, `{{ .ConfirmationURL }}`

## Debugging

### Check Auth State
\`\`\`typescript
// Add to any component
const supabase = createClientComponentClient()
const { data: { session } } = await supabase.auth.getSession()
console.log("[v0] Session:", session)
\`\`\`

### Check Database Connection
\`\`\`typescript
// Add to API route
const { data, error } = await supabase
  .from('signals')
  .select('*')
  .limit(1)
console.log("[v0] Database test:", { data, error })
\`\`\`

### Enable Supabase Logs
\`\`\`typescript
// lib/supabase/client.ts
createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: 'public',
    },
    auth: {
      debug: true, // Add this
    },
  }
)
\`\`\`

## Performance Tips

### Server Components
- Use Server Components by default
- Only add `"use client"` when needed for interactivity
- Fetch data in Server Components, pass to Client Components

### Database Queries
- Always use indexes on foreign keys
- Limit results with `.limit()`
- Use `.select('id, name')` instead of `.select('*')`
- Cache results with React `cache()`

### Image Optimization
\`\`\`typescript
import Image from 'next/image'

<Image 
  src="/image.jpg" 
  width={500} 
  height={300}
  alt="Description"
/>
\`\`\`

## Code Style

### TypeScript
\`\`\`typescript
// Use explicit types
const getSignals = async (): Promise<Signal[]> => {
  // ...
}

// Avoid any
const data: any // ❌ Bad
const data: Signal[] // ✅ Good
\`\`\`

### React
\`\`\`typescript
// Use async Server Components
export default async function Page() {
  const data = await fetchData()
  return <div>{data}</div>
}

// Client components for interactivity
"use client"
export function InteractiveComponent() {
  const [state, setState] = useState()
  return <button onClick={() => setState(...)}>Click</button>
}
\`\`\`

### Naming
- **Components**: PascalCase (`SignalCard`)
- **Functions**: camelCase (`getSignalById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_UPLOAD_SIZE`)
- **Files**: kebab-case (`signal-card.tsx`)

## Security Best Practices

1. **Never expose secrets**
   - Use environment variables
   - Never commit `.env` files
   - Use `NEXT_PUBLIC_` prefix only for public variables

2. **Validate all inputs**
   - Sanitize user uploads
   - Validate API request bodies
   - Use TypeScript for type safety

3. **Use RLS policies**
   - Every table should have RLS enabled
   - Test policies as different users
   - Principle of least privilege

4. **Audit logging**
   - Log important actions
   - Include user ID and timestamp
   - Store in `audit_log` table (create if needed)

## Getting Help

**v0 Questions**: Ask in chat, reference this file
**Supabase**: supabase.com/docs
**Next.js**: nextjs.org/docs
**Vercel AI SDK**: sdk.vercel.ai

---

Happy coding!
