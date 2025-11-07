// resumequick.pro/frontend/src/hooks/useUser.js
import { API_CONFIG } from '../api/config'
import { showError } from '../utils/erroMessage'
import { useState, useEffect } from "react";
import { listenToAuthChanges } from "../lib/firebaseAuthService";

export default function useUser() {
  const [user, setUser] = useState(null);
  const [credits, setCredits] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (user) => {
    if (!user) return;

    try {
      const token = await user.getIdToken();

      const res = await fetch(`${API_CONFIG.baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setCredits({
        freeUsed: json.free_used,
        freeLimit: json.free_limit,
        paidCredits: json.paid_credits,
        totalAvailable: json.total_available,
        refreshed: json.credits_refreshed
      });
    } catch (error) {
      showError(error?.message)
    }
  };

  // Payment-related code removed - all features are free

  useEffect(() => {
    listenToAuthChanges(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        setLoading(true);
        await fetchUserData(firebaseUser);
        setLoading(false);
      } else {
        setCredits(null);
        setLoading(false);
      }
    });
  }, []);

  const refetch = async () => {
    try {
      await fetchUserData(user);
    } catch (error) {
      showError(error?.message)
    }
  };

  return {
    user,
    credits,
    loading,
    refetch
  };
}