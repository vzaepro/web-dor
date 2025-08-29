import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PackagesList from "@/components/PackagesList";

interface PackagesProps {
  onBack: () => void;
}

export default function Packages({ onBack }: PackagesProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <CardTitle className="text-2xl font-bold">Packages</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="my-packages" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="my-packages">My Packages</TabsTrigger>
                <TabsTrigger value="xut-packages">XUT Packages</TabsTrigger>
              </TabsList>
              
              <TabsContent value="my-packages" className="mt-6">
                <PackagesList type="my-packages" />
              </TabsContent>
              
              <TabsContent value="xut-packages" className="mt-6">
                <PackagesList type="xut-packages" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}