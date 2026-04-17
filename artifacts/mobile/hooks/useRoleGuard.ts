import { router } from "expo-router";
import { useEffect } from "react";
import { useApp } from "@/contexts/AppContext";

export function useRequireAdmin() {
  const { userRole, authToken, loading } = useApp();
  useEffect(() => {
    if (loading) return;
    if (userRole !== "admin" || !authToken) {
      router.replace("/role-select");
    }
  }, [userRole, authToken, loading]);
}

export function useRequireOfficer() {
  const { userRole, authToken, loading } = useApp();
  useEffect(() => {
    if (loading) return;
    if (userRole !== "officer" || !authToken) {
      router.replace("/role-select");
    }
  }, [userRole, authToken, loading]);
}
