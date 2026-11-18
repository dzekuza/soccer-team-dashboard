import Image from "next/image";

interface Partner {
  file: string;
  name: string;
}

// Logos live in public/partners/<file>.svg (white artwork, made for the dark background)
const PARTNERS: Partner[] = [
  {
    file: "klaipedos-rajono-savivaldybe",
    name: "Klaipėdos rajono savivaldybė",
  },
  { file: "neogroup", name: "Neogroup" },
  { file: "weber", name: "Weber" },
  { file: "simuva", name: "Simuva" },
  { file: "tele2", name: "Tele2" },
  { file: "compensa", name: "Compensa" },
  { file: "transkela", name: "Transkela" },
  { file: "splius", name: "Splius" },
  { file: "gg-rail", name: "GG Rail" },
  { file: "voltas", name: "Voltas" },
  { file: "trevena", name: "Trevena" },
  { file: "tulsera", name: "Tulsera" },
  { file: "stelga", name: "Stelga" },
  { file: "ribena", name: "Ribena" },
  { file: "kerpita", name: "Kerpita" },
  { file: "bocas", name: "Bocas" },
  { file: "bavista", name: "Bavista" },
  { file: "arlanga", name: "Arlanga" },
  { file: "edelmeta", name: "Edelmeta" },
  { file: "damava", name: "Damava" },
  { file: "lijo", name: "Lijo" },
  { file: "argus-saugos-tarnyba", name: "Argus saugos tarnyba" },
  { file: "griksto-klinika", name: "Grikšto klinika" },
  { file: "gargzdai-mano", name: "Gargždai mano" },
  { file: "gargzdu-pramogos", name: "Gargždų pramogos" },
  { file: "gargzdu-rangos-darbai", name: "Gargždų rangos darbai" },
  {
    file: "banga-klaipedos-rajono-laikrastis",
    name: "Banga – Klaipėdos rajono laikraštis",
  },
];

export function PartnersSection() {
  return (
    <section className="w-full bg-[#0A165B]">
      <div className="border border-[rgba(95,95,113,0.39)]">
        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {PARTNERS.map((partner) => (
            <li
              key={partner.file}
              className="border border-[rgba(95,95,113,0.39)] p-6 flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
            >
              <div className="relative h-14 w-36">
                <Image
                  src={`/partners/${partner.file}.svg`}
                  alt={partner.name}
                  fill
                  sizes="144px"
                  className="object-contain"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
