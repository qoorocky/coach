import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createUser,
  listUsers,
  setUserPassword,
  updateUser,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "@/lib/api/users";

export const USERS_KEY = "cms-users" as const;

export function useUsers() {
  return useQuery({
    queryKey: [USERS_KEY],
    queryFn: () => listUsers(),
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateUserRequest) => createUser(req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useUpdateUser(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: UpdateUserRequest) => updateUser(id, req),
    onSuccess: () => qc.invalidateQueries({ queryKey: [USERS_KEY] }),
  });
}

export function useSetUserPassword(id: number) {
  return useMutation({
    mutationFn: (password: string) => setUserPassword(id, password),
  });
}
