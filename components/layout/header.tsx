"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Header() {
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries();
    toast.success("Refreshed all services");
  };

  return (
    <header className="">
      <div className="flex h-16 items-center px-6 border-b"></div>
    </header>
  );
}
