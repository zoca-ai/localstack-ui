import { useQuery } from "@tanstack/react-query";
import { LocalStackHealth } from "@/types";

async function checkLocalStackHealth(): Promise<LocalStackHealth> {
  const response = await fetch("/api/health");
  if (!response.ok) {
    throw new Error("Failed to check LocalStack health");
  }
  return response.json();
}

export function useLocalStackHealth() {
  return useQuery({
    queryKey: ["localstack-health"],
    queryFn: checkLocalStackHealth,
    refetchInterval: Number(process.env.NEXT_PUBLIC_REFRESH_INTERVAL) || 5000,
    retry: 1,
  });
}
