import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconColor?: "blue" | "green" | "amber" | "purple" | "red";
  isLoading?: boolean;
}

export default function StatusCard({
  title,
  value,
  icon,
  iconColor = "blue",
  isLoading = false
}: StatusCardProps) {
  // Define color classes based on iconColor
  const getColorClasses = () => {
    switch (iconColor) {
      case "blue":
        return {
          bg: "bg-blue-100",
          text: "text-blue-600"
        };
      case "green":
        return {
          bg: "bg-green-100",
          text: "text-green-600"
        };
      case "amber":
        return {
          bg: "bg-amber-100",
          text: "text-amber-600"
        };
      case "purple":
        return {
          bg: "bg-purple-100",
          text: "text-purple-600"
        };
      case "red":
        return {
          bg: "bg-red-100",
          text: "text-red-600"
        };
      default:
        return {
          bg: "bg-blue-100",
          text: "text-blue-600"
        };
    }
  };

  const { bg, text } = getColorClasses();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={`rounded-full p-3 ${bg}`}>
            <div className={`h-5 w-5 ${text}`}>{icon}</div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <h3 className="text-2xl font-bold">{value}</h3>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
