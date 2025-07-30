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
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex flex-1 items-center justify-between">
          <h1 className="text-xl font-semibold"></h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

