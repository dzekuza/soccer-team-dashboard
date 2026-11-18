import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PromoTileProps {
  href: string;
  label: string;
  background: string;
  player: string;
  playerWidth: number;
  playerHeight: number;
  /** Which edge the player and label sit on; they are on opposite sides. */
  playerSide: "left" | "right";
}

const SECTION_TITLE = "Įsigykite";

const TILES: PromoTileProps[] = [
  {
    href: "/parduotuve",
    label: "Atributika",
    background: "/landing/atributika-bg.jpg",
    player: "/landing/atributika-player.webp",
    playerWidth: 960,
    playerHeight: 1440,
    playerSide: "left",
  },
  {
    href: "/renginiai",
    label: "Bilietai",
    background: "/landing/bilietai-bg.jpg",
    player: "/landing/bilietai-player.webp",
    playerWidth: 990,
    playerHeight: 1440,
    playerSide: "right",
  },
];

function PromoTile({
  href,
  label,
  background,
  player,
  playerWidth,
  playerHeight,
  playerSide,
}: PromoTileProps) {
  const onLeft = playerSide === "left";

  return (
    <Link
      href={href}
      className={cn(
        // Desktop: the player may rise above the tile into the heading band (as in
        // the design) while the bottom and sides stay clipped. Stacked: clip fully.
        "relative flex min-h-promo flex-1 flex-col justify-end overflow-hidden p-16 md:overflow-visible md:[clip-path:inset(-10rem_0_0_0)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white",
        onLeft ? "items-end" : "items-start",
      )}
    >
      <Image
        src={background}
        alt=""
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />
      <Image
        src={player}
        alt=""
        width={playerWidth}
        height={playerHeight}
        sizes="(min-width: 768px) 30vw, 60vw"
        className={cn(
          "pointer-events-none absolute top-1/2 h-full w-auto max-w-none md:h-promo-player -translate-y-1/2",
          onLeft ? "left-0" : "right-0",
        )}
      />
      <span className="relative text-title font-bold text-white">{label}</span>
    </Link>
  );
}

export function TicketsApparelSection() {
  return (
    <section className="w-full bg-background">
      <h2 className="px-14 py-8 text-center text-headline font-bold text-white">
        {SECTION_TITLE}
      </h2>
      <div className="flex w-full flex-col md:flex-row">
        {TILES.map((tile) => (
          <PromoTile key={tile.href} {...tile} />
        ))}
      </div>
    </section>
  );
}
