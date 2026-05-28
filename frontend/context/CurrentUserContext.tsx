"use client";

import { UsuarioAuthResponse } from "@/types/dtos";
import { createContext, useContext } from "react";

const CurrentUserContext = createContext<UsuarioAuthResponse | null>(null);

export function CurrentUserProvider({
  user,
  children,
}: {
  user: UsuarioAuthResponse | null;
  children: React.ReactNode;
}) {
  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(CurrentUserContext);
}
