import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Zap } from "lucide-react";
import { getMyPackages, getXutPackages } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface PackageItem {
  number?: number;
  name: string;
  price?: number;
  code?: string;
  quota_code?: string;
  family_code?: string;
  group_code?: string;
}

interface PackagesListProps {
  type: 'my-packages' | 'xut-packages';
}

export default function PackagesList({ type }: PackagesListProps) {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = type === 'my-packages' ? await getMyPackages() : await getXutPackages();
      setPackages(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load packages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading packages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === 'my-packages' ? (
            <Package className="h-5 w-5 text-primary" />
          ) : (
            <Zap className="h-5 w-5 text-primary" />
          )}
          <h3 className="text-lg font-semibold">
            {type === 'my-packages' ? 'My Packages' : 'XUT Packages'}
          </h3>
        </div>
        <Button variant="outline" size="sm" onClick={loadPackages}>
          Refresh
        </Button>
      </div>

      {packages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No packages found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {packages.map((pkg, index) => (
            <Card key={pkg.code || pkg.quota_code || index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{pkg.name}</CardTitle>
                    {pkg.number && (
                      <CardDescription>Package #{pkg.number}</CardDescription>
                    )}
                  </div>
                  {pkg.price && (
                    <Badge variant="secondary">
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {pkg.code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Code:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{pkg.code}</code>
                  </div>
                )}
                {pkg.quota_code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quota Code:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{pkg.quota_code}</code>
                  </div>
                )}
                {pkg.family_code && pkg.family_code !== "N/A" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Family Code:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{pkg.family_code}</code>
                  </div>
                )}
                {pkg.group_code && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Group Code:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs">{pkg.group_code}</code>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}