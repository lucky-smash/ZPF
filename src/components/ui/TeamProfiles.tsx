import { Figure } from "@/components/ui/Figure";
import { team } from "@/data";

/**
 * Individual team profiles.
 *
 * Deliberately inert: `team` in src/data/team.ts is empty because no
 * names, biographies or portraits have been approved. Add entries
 * there and drop this component into the craft section to publish it.
 */
export function TeamProfiles() {
  const published = team.filter((member) => member.status === "approved");
  if (published.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
      {published.map((member) => (
        <li key={member.id}>
          {member.image ? (
            <Figure
              asset={member.image}
              ratio="4 / 5"
              sizes="(max-width: 64rem) 50vw, 25vw"
            />
          ) : null}
          <h3 className="display mt-4 text-lg">{member.name}</h3>
          <p className="meta mt-1 text-ash">{member.role}</p>
          {member.bio ? (
            <p className="mt-3 text-sm leading-relaxed text-ash">{member.bio}</p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
