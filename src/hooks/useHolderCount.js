// src/hooks/useHolderCount.js
import { useEffect, useState } from "react";

export function useHolderCount() {
  const [holderCount, setHolderCount] = useState(null);

  useEffect(() => {
    const fetchHolders = async () => {
      let allOwners = new Set();
      let cursor = undefined;

      try {
        while (true) {
          const params = {
            limit: 1000,
            mint: "HxptKywiNbHobJD4XMMBn1czMUGkdMrUkeUErQLKbonk" // $GOGS
          };
          if (cursor !== undefined) {
            params.cursor = cursor;
          }

          const response = await fetch(
            import.meta.env.VITE_HELIUS_RPC,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: "get-holders",
                method: "getTokenAccounts",
                params
              })
            }
          );

          const data = await response.json();

          if (!data.result || data.result.token_accounts.length === 0) break;

          data.result.token_accounts.forEach((acc) => {
            allOwners.add(acc.owner);
          });

          cursor = data.result.cursor;
          if (!cursor) break;
        }

        setHolderCount(allOwners.size);
      } catch (err) {
        console.error("failed to fetch holders:", err);
      }
    };

    fetchHolders();
    const interval = setInterval(fetchHolders, 10000);
    return () => clearInterval(interval);
  }, []);

  return holderCount;
}
