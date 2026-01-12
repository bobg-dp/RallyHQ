import { supabase } from "@/lib/supabase/client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: "user" | "admin";
    avatar?: string;
    emailConfirmed?: boolean;
  };
  token: string;
  refreshToken: string;
}

function mapSupabaseUserToAuthResponse(session: any): AuthResponse {
  const user = session?.user;
  const accessToken = session?.access_token ?? session?.accessToken ?? "";
  const refreshToken = session?.refresh_token ?? session?.refreshToken ?? "";
  const emailConfirmed = user?.email_confirmed_at !== null;

  return {
    user: {
      id: user?.id ?? "",
      email: user?.email ?? "",
      name: (user?.user_metadata?.name ?? user?.user_metadata?.full_name) || "",
      role: "user",
      avatar: user?.user_metadata?.avatar ?? undefined,
      emailConfirmed,
    },
    token: accessToken,
    refreshToken: refreshToken,
  };
}

const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    if (!data?.session) throw new Error("No session returned from Supabase");

    return mapSupabaseUserToAuthResponse(data.session);
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const { data: res, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: data.name,
        },
      },
    });

    if (error) throw error;

    // If confirmation is required, session may be null. Return a minimal response.
    const session = (res as any)?.session ?? null;

    if (session) {
      return mapSupabaseUserToAuthResponse(session);
    }

    // For cases where user must confirm email, return a placeholder response (no tokens)
    // Explicitly set emailConfirmed: false to block access
    return {
      user: {
        id: (res as any)?.user?.id ?? "",
        email: (res as any)?.user?.email ?? data.email,
        name: data.name,
        role: "user",
        emailConfirmed: false,
      },
      token: "",
      refreshToken: "",
    };
  },

  logout: async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    // Use setSession to exchange refresh token for a new session
    const { data, error } = await supabase.auth.setSession({
      access_token: "",
      refresh_token: refreshToken,
    } as any);
    if (error) throw error;
    if (!data?.session) throw new Error("No session returned from Supabase");
    return mapSupabaseUserToAuthResponse(data.session);
  },

  forgotPassword: async (email: string): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) throw error;
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    const { error } = await supabase.auth.updateUser({ password }, {
      accessToken: token,
    } as any);
    if (error) throw error;
  },

  getProfile: async (): Promise<AuthResponse["user"]> => {
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    const user = sessionData?.session?.user;
    if (!user) throw new Error("Not authenticated");
    return {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? "",
      role: "user",
    };
  },

  updateProfile: async (
    data: Partial<AuthResponse["user"]>
  ): Promise<AuthResponse["user"]> => {
    const { data: userData, error } = await supabase.auth.updateUser({
      data: { name: data.name, avatar: data.avatar },
    });
    if (error) throw error;
    const user = (userData as any)?.user;
    return {
      id: user.id,
      email: user.email ?? "",
      name: user.user_metadata?.name ?? "",
      role: "user",
    };
  },
};

export default authService;
