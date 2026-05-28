export const AuthService = {
  login: async (credentials: { dni: string; password: string }) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          message: data.mensaje ?? "Error al iniciar sesión",
          type: "error" as const,
        };
      }

      return {
        message: "¡Ingreso exitoso!",
        type: "success" as const,
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Error inesperado",
        type: "error" as const,
      };
    }
  },

  forgotPassword: async (dni: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dni }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          message: data.mensaje ?? "Error al solicitar recuperación",
          type: "error" as const,
        };
      }

      return {
        message:
          "Si el DNI corresponde a un usuario válido, te enviamos un correo con instrucciones.",
        type: "success" as const,
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Error inesperado",
        type: "error" as const,
      };
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          message: data.mensaje ?? "Error al restablecer la contraseña",
          type: "error" as const,
        };
      }

      return {
        message: "Contraseña restablecida correctamente",
        type: "success" as const,
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Error inesperado",
        type: "error" as const,
      };
    }
  },

  logout: async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          message: data.mensaje ?? "Error al cerrar sesión",
          type: "error" as const,
        };
      }

      return {
        message: "Sesión cerrada correctamente",
        type: "success" as const,
      };
    } catch (error) {
      return {
        message: error instanceof Error ? error.message : "Error inesperado",
        type: "error" as const,
      };
    }
  },
};
