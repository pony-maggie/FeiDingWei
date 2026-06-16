import type { Translation } from "@/lib/i18n";

type PeopleMember = {
  id: string;
  name: string;
  email: string;
  workspaceRole: string;
  functionLabel: string;
  team: { name: string } | null;
  activeRooms: Array<{
    id: string;
    name: string;
    roomRole: string;
  }>;
};

export function PeopleDirectory({
  members,
  labels
}: {
  members: PeopleMember[];
  labels: Translation["people"];
}) {
  return (
    <section className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">{labels.heading}</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {members.map((member) => (
          <article
            key={member.id}
            aria-label={member.name}
            className="rounded border border-line bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-ink">{member.name}</div>
                <div className="mt-1 text-xs text-slate-500">{member.email}</div>
              </div>
              <div className="rounded bg-paper px-2 py-1 text-xs text-slate-600">
                {member.functionLabel}
              </div>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
              <div>
                {labels.workspaceRole}: {member.workspaceRole}
              </div>
              <div>
                {labels.functionLabel}: {member.functionLabel}
              </div>
              <div>
                {labels.team}: {member.team?.name ?? labels.noTeam}
              </div>
            </div>
            <div className="mt-3 border-t border-line pt-3">
              <div className="text-xs font-medium text-slate-700">{labels.activeRooms}</div>
              {member.activeRooms.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {member.activeRooms.map((room) => (
                    <span
                      key={room.id}
                      className="rounded border border-line bg-paper px-2 py-1 text-xs text-slate-600"
                    >
                      {room.name} · {room.roomRole}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-2 text-xs text-slate-500">{labels.noActiveRooms}</div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
