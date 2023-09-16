import React, { useState, useEffect, createContext, useContext } from "react";
import { auth } from "../firebase/firebase.config";

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

export const authContext = createContext();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    console.log("error creating auth context");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        console.log("no hay usuario suscrito");
        setUser({});
      } else {
        const { uid, email, emailVerified, isAnonymous, providerData } =
          currentUser;
        const userWithAdmin = {
          uid,
          email,
          emailVerified,
          isAnonymous,
          providerData,
          isAdmin: false,
        };
        setUser(userWithAdmin);
      }
    });

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    return () => unsubscribe();
  }, []);

  const login = async (inputEmail, password) => {
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        inputEmail,
        password
      );
      const { user } = response;
      const { uid, email, emailVerified, isAnonymous, providerData } = user;
      const userWithAdmin = {
        uid,
        email,
        emailVerified,
        isAnonymous,
        providerData,
        isAdmin: false,
      };
      setUser(userWithAdmin);

      localStorage.setItem("user", JSON.stringify(userWithAdmin));
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
  };

  return (
    <authContext.Provider
      value={{
        login,
        logout,
        user,
      }}
    >
      {children}
    </authContext.Provider>
  );
}

export const UserAuth = () => {
  return useContext(authContext);
};
