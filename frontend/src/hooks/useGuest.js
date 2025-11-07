import { useState, useEffect } from "react";

export default function useGuest() {
  const [guestUsed, setGuestUsed] = useState(0);
  const maxGuestUses = 1;

  useEffect(() => {
    const used = parseInt(localStorage.getItem("guest_used") || "0", 10);
    setGuestUsed(used);
  }, []);

  const increment = () => {
    const newUsed = guestUsed + 1;
    localStorage.setItem("guest_used", newUsed);
    setGuestUsed(newUsed);
  };

  const canUse = guestUsed < maxGuestUses;

  return { guestUsed, canUse, increment };
}
