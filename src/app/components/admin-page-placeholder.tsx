import { Card, CardContent } from "@/components/ui/card";

type AdminPagePlaceholderProps = {
  title: string;
  description: string;
};

export function AdminPagePlaceholder({
  title,
  description,
}: AdminPagePlaceholderProps) {
  return (
    <Card className="w-full p-6">
      <CardContent className="space-y-3 p-0">
        <h2 className="text-[19px] font-medium leading-none text-[#050a0e]">
          {title}
        </h2>
        <p className="text-[14px] font-light text-[#787878]">{description}</p>
      </CardContent>
    </Card>
  );
}
