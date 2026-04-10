const API_BASE = "http://mylibrary.tryasp.net/api";

function getToken(): string | null {
  return localStorage.getItem("auth_token");
}

function setToken(token: string) {
  localStorage.setItem("auth_token", token);
}

function clearToken() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
}

// --- Interfaces ---

export interface Permission {
  permissionId: string;
  permissionName: string;
  displayName: string;
}

export interface Group {
  groupId: number;
  groupName: string;
  groupLevel?: number;
  permissions?: string[];
  permissionIds?: string[];
}

export interface Employee {
  employeeId: number;
  userId?: number;        // <-- UserID من جدول Users (اللي بياخذه toggle-status)
  firstName: string;
  familyName: string;
  fatherName: string;
  grandfatherName: string;
  firstNameEn: string;
  familyNameEn: string;
  empNumber: string;
  phoneNumber: string;
  idnumber: string;
  birthDate: string;
  groupId: number;
  groupName?: string;
  userStatus: "Active" | "Inactive" | "Pending";
  permissions?: string[];
  createdBy?: string;
}

export interface LookupItem {
  id: number;
  name: string;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 204 || (res.status === 200 && res.headers.get("content-length") === "0")) {
    return {} as T;
  }

  const text = await res.text();
  if (!text) return {} as T;

  try {
    return JSON.parse(text);
  } catch {
    return text as unknown as T;
  }
}

export const authApi = {
  login: (data: { userName: string; password: string }) =>
    request<any>("/Auth/login", { method: "POST", body: JSON.stringify(data) }),

  toggleStatus: (userId: number | string) =>
    request<any>(`/Auth/toggle-status/${userId}`, { method: "PUT" }),

  changePassword: (data: { code: string | null; newPassword: string }) =>
    request<any>("/Auth/change-password", { method: "PUT", body: JSON.stringify(data) }),
};

export const permissionApi = {
  getAll: () => request<Permission[]>("/Permission"),
  getById: (id: string) => request<Permission>(`/Permission/${id}`),
  create: (data: { permissionName: string; displayName: string }) =>
    request<any>("/Permission", { method: "POST", body: JSON.stringify(data) }),
  update: (data: Permission) =>
    request<any>("/Permission", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/Permission/${id}`, { method: "DELETE" }),
};

export const groupApi = {
  getAll: () => request<Group[]>("/Group"),
  getById: (id: number) => request<Group>(`/Group/${id}`),
  lookup: () => request<any[]>("/Group/lookup"),
  create: (data: { groupName: string; groupLevel?: number; permissionIds?: string[] }) =>
    request<any>("/Group", { method: "POST", body: JSON.stringify(data) }),
  update: (data: { groupId: number; groupName: string; groupLevel?: number; permissionIds?: string[] }) =>
    request<any>("/Group", { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: number) =>
    request<any>(`/Group/${id}`, { method: "DELETE" }),
};

export const employeeApi = {
  getAll: () => request<Employee[]>("/Employee"),
  getById: (id: number) => request<Employee>(`/Employee/${id}`),

  create: (data: Omit<Employee, "employeeId">) =>
    request<any>("/Employee", { method: "POST", body: JSON.stringify(data) }),

  update: (data: Employee) =>
    request<any>("/Employee", { method: "PUT", body: JSON.stringify(data) }),

  changeGroup: (employeeId: number, newGroupId: number) =>
    request<any>(`/Employee/${employeeId}/change-group`, {
      method: "PATCH",
      body: JSON.stringify({ newGroupId }),
    }),

  transferOwnership: (data: { newAdminId: number; Password: string }) =>
    request<any>("/Employee/transfer-ownership", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const lookupApi = {
  getAll: (endpoint: string) => request<any[]>(endpoint),

  create: (endpoint: string, nameField: string, value: string) =>
    request<any>(endpoint, {
      method: "POST",
      body: JSON.stringify({ [nameField]: value }),
    }),

  delete: (endpoint: string, id: number) =>
    request<any>(`${endpoint}/${id}`, { method: "DELETE" }),

  update: (endpoint: string, idField: string, idValue: any, nameField: string, nameValue: string) =>
    request<any>(endpoint, {
      method: "PUT",
      body: JSON.stringify({
        [idField]: idValue,
        [nameField]: nameValue,
      }),
    }),
};

export { getToken, setToken, clearToken };