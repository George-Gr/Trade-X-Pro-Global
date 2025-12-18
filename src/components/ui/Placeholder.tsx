import * as React from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { LucideAlertCircle } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description?: string;
}

export const Placeholder: React.FC<PlaceholderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="py-6">
      <EmptyState
        icon={LucideAlertCircle}
        title={title}
        description={description}
        variant="default"
      />
    </div>
  );
};

export default Placeholder;
