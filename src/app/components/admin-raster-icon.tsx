import { cn } from "@/lib/utils";

/** SVG/raster from `public/` with explicit dimensions (toolbar + table pattern). */
export function AdminRasterIcon({
  src,
  width,
  height,
  className,
}: {
  src: string;
  width: number;
  height: number;
  className?: string;
}) {
  return (
    <img
      alt=""
      className={cn("shrink-0 object-contain", className)}
      decoding="async"
      height={height}
      src={src}
      width={width}
    />
  );
}
