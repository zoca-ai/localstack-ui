"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { FunctionList } from "@/components/services/lambda/function-list";
import { FunctionViewer } from "@/components/services/lambda/function-viewer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Cpu, Timer, Package, RefreshCw, Info } from "lucide-react";
import { LambdaFunction } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LambdaPage() {
  const [selectedFunction, setSelectedFunction] =
    useState<LambdaFunction | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const queryClient = useQueryClient();

  const handleViewFunction = (func: LambdaFunction) => {
    setSelectedFunction(func);
    setViewerOpen(true);
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["lambda-functions"] });
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lambda</h1>
            <p className="text-muted-foreground">
              View and monitor your serverless functions
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This interface provides read-only access to Lambda functions in your
            LocalStack instance. Use the AWS CLI or SDK to deploy and manage
            functions.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lambda Functions</CardTitle>
                <CardDescription>
                  View your deployed Lambda functions and their configurations
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <FunctionList onViewFunction={handleViewFunction} />
          </CardContent>
        </Card>

        <FunctionViewer
          func={selectedFunction}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      </div>
    </MainLayout>
  );
}
