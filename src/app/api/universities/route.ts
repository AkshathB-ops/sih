import { handle, ok } from "@/lib/api/response";
import { listOrganizations } from "@/repositories/organization.repo";

export const GET = handle(async (request: Request) => {
  const search = new URL(request.url).searchParams;
  const orgType = search.get("orgType") ?? undefined;
  const district = search.get("district") ?? undefined;
  const searchQuery = search.get("search") ?? undefined;

  const types = orgType ? [orgType] : ["UNIVERSITY", "INDUSTRY", "STARTUP", "MSME", "CSR", "GOVERNMENT"];

  const all = await Promise.all(
    distinct(types).map((t) =>
      listOrganizations({ orgType: t as never, district, search: searchQuery, page: 1, pageSize: 100 }),
    ),
  );

  const items = all.flatMap((r) => r.items);
  return ok({ organizations: items });
});

function distinct(values: string[]): string[] {
  return [...new Set(values)];
}