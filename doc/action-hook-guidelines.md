# Server Actions & React Query - Best Practices Guide

## 🚀 Server Actions

### Basic Template

```typescript
"use server";

import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const schema = z.object({
  // validation rules
});

type Result = { success: true; data?: any } | { success: false; error: string };

export async function actionName(
  params: z.infer<typeof schema>
): Promise<Result> {
  try {
    // 1. Validate
    const data = schema.parse(params);

    // 2. Auth check
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return { success: false, error: "Unauthorized" };

    // 3. Business logic & DB operations
    const result = await supabase.from("table").insert(data);
    if (result.error) return { success: false, error: result.error.message };

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: "Đã có lỗi xảy ra" };
  }
}
```

### File Organization

```
src/actions/
├── auth/
├── products/
├── orders/
├── admin/
└── index.ts
```

### Naming

- **Files**: `kebab-case.ts` (e.g., `create-product.ts`)
- **Functions**: `camelCase` với action verb (e.g., `createProduct`)

### Key Rules

1. ✅ Always use `"use server"`
2. ✅ Validate input with Zod
3. ✅ Check authentication first
4. ✅ Use discriminated unions for return types
5. ✅ Handle errors gracefully

---

## ⚡ React Query Setup

### Installation & Config

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

```typescript
// lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) =>
        error?.status >= 400 && error?.status < 500 ? false : failureCount < 3,
    },
  },
});
```

```typescript
// components/providers/query-provider.tsx
"use client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Query Keys Convention

```typescript
// lib/query-keys.ts
export const QUERY_KEYS = {
  products: {
    all: ["products"] as const,
    lists: () => [...QUERY_KEYS.products.all, "list"] as const,
    list: (filters?: any) => [...QUERY_KEYS.products.lists(), filters] as const,
    detail: (id: string) => [...QUERY_KEYS.products.all, "detail", id] as const,
  },
  // Similar pattern for other entities...
} as const;
```

---

## 🎣 Hooks Patterns

### File Organization

```
src/hooks/
├── auth/
├── products/
├── orders/
└── index.ts
```

### Naming Convention

- **Query hooks**: `use-{entity}` (e.g., `use-products`)
- **Mutation hooks**: `use-{action}-{entity}` (e.g., `use-create-product`)

### Query Hook Template

```typescript
// hooks/products/use-products.ts
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/actions/products/get-products";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.products.list(filters),
    queryFn: () => getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

### Mutation Hook Template

```typescript
// hooks/products/use-create-product.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/actions/products/create-product";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products.all });
    },
  });
}
```

### Infinite Query Template

```typescript
export function useInfiniteProducts(filters?: ProductFilters) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.products.infinite(filters),
    queryFn: ({ pageParam = 1 }) =>
      getProducts({ page: pageParam, ...filters }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage ?? undefined,
  });
}
```

---

## 🔧 Common Patterns

### Permission Check

```typescript
// Check role from app_metadata
const {
  data: { user },
} = await supabase.auth.getUser();
if (!user) return { success: false, error: "Unauthorized" };

const role = user.app_metadata?.role || "candidate";

// Basic checks
if (role === "admin") {
  // Admin only logic
}

if (role === "recruiter") {
  // Recruiter logic
}

// Multiple roles
if (["admin", "recruiter"].includes(role)) {
  // Admin or recruiter logic
}

// Deny access
if (role !== "admin") {
  return { success: false, error: "Admin access required" };
}
```

### Role Hook

```typescript
// hooks/auth/use-user-role.ts
export function useUserRole() {
  return useQuery({
    queryKey: ["user", "role"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const role = user.app_metadata?.role || "candidate";
      return {
        user,
        role,
        isAdmin: role === "admin",
        isRecruiter: role === "recruiter",
        isCandidate: role === "candidate",
      };
    },
  });
}

// Usage in component
const { data: userRole } = useUserRole();
if (userRole?.isAdmin) {
  // Show admin UI
}
```

### File Upload

```typescript
// Validate file type and size
const allowedTypes = ["image/jpeg", "image/png"];
if (!allowedTypes.includes(file.type)) {
  return { success: false, error: "Invalid file type" };
}
if (file.size > 5 * 1024 * 1024) {
  // 5MB
  return { success: false, error: "File too large" };
}
```

### Optimistic Updates

```typescript
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.products.detail(variables.id),
      });

      // Snapshot previous value
      const previousProduct = queryClient.getQueryData(
        QUERY_KEYS.products.detail(variables.id)
      );

      // Optimistically update
      queryClient.setQueryData(
        QUERY_KEYS.products.detail(variables.id),
        variables
      );

      return { previousProduct };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(
        QUERY_KEYS.products.detail(variables.id),
        context?.previousProduct
      );
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.products.detail(variables.id),
      });
    },
  });
}
```

---

## Quick Checklist

### Server Actions

- `"use server"` at top
- Zod validation for input
- Authentication check
- Permission validation
- Proper error handling
- Discriminated union return type

### Hooks

- Consistent naming convention
- Proper query keys
- Cache invalidation after mutations
- Error handling in components
- Appropriate staleTime

### General

- TypeScript types from `custom.types.ts`
- File organization by domain
- Export from index files
- Consistent patterns across codebase

---

## 🎯 Usage Example

```typescript
"use client";

export function ProductForm() {
  const createProduct = useCreateProduct();

  const handleSubmit = async (data: ProductData) => {
    const result = await createProduct.mutateAsync(data);
    if (result.success) {
      toast.success("Product created!");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={createProduct.isPending}>
        {createProduct.isPending ? "Creating..." : "Create Product"}
      </button>
    </form>
  );
}
```

---

**💡 Key Benefits**: Type safety, consistent patterns, optimized caching, better UX with loading states và optimistic updates.
