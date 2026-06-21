import { vi } from "vitest";

export function mockRouter() {
  const push = vi.fn();
  const replace = vi.fn();
  vi.mock("next/navigation", () => ({
    useRouter: () => ({ push, replace }),
    usePathname: () => "/dashboard",
  }));
  return { push, replace };
}

export const mockUser = {
  id: "user-1",
  email: "alex@fitrack.test",
  fullName: "Alex Runner",
  role: "MEMBER",
  phoneNumber: "+1",
  gender: "other",
};
