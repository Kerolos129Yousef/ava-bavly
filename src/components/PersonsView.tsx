"use client";

import { useState } from "react";
import Link from "next/link";

interface Servant {
  id: string;
  name: string;
  photo: string | null;
}

interface Person {
  id: string;
  name: string;
  photo: string | null;
  phone: string | null;
  guardianName: string | null;
  guardianPhone: string | null;
  classId: string | null;
  className: string | null;
  servant: Servant | null;
}

interface ClassInfo {
  id: string;
  name: string;
}

type ViewMode = "table" | "byClass";

function SmallPhoto({ src, name, size = 32 }: { src: string | null; name: string; size?: number }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size, border: "2px solid var(--gold-pale)" }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--gold-pale)",
        color: "var(--gold-dark)",
        fontSize: size * 0.35,
        border: "2px solid var(--cream-dark)",
      }}
    >
      {name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
    </div>
  );
}

export default function PersonsView({
  persons,
  classes,
  canAdd = true,
  role = "MINISTRY_ADMIN",
}: {
  persons: Person[];
  classes: ClassInfo[];
  canAdd?: boolean;
  role?: string;
}) {
  const isServant = role === "SERVANT";
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [filterClassId, setFilterClassId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const searchedPersons = searchQuery
    ? persons.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : persons;

  const filtered = searchedPersons.filter((p) => {
    if (filterClassId && p.classId !== filterClassId) return false;
    return true;
  });

  const filteredClasses = filterClassId ? classes.filter((c) => c.id === filterClassId) : classes;

  const groupedByClass = filteredClasses
    .map((c) => ({
      ...c,
      persons: searchedPersons.filter((p) => p.classId === c.id),
    }))
    .filter((g) => g.persons.length > 0);

  const unassigned = filterClassId ? [] : searchedPersons.filter((p) => !p.classId);

  const searchBar = (
    <div className="mb-4 relative">
      <svg
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="var(--navy-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        placeholder="بحث بالاسم..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full rounded-lg pr-10 pl-3 py-2.5 text-sm"
        style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)", color: "var(--navy)" }}
      />
    </div>
  );

  if (isServant) {
    return (
      <div>
        {searchBar}
        {searchedPersons.length === 0 ? (
          <div className="church-card text-center py-12">
            <p className="text-4xl mb-3" style={{ color: "var(--gold)" }}>🕊</p>
            <p style={{ color: "var(--navy-light)" }}>لا يوجد مخدومين مسجلين</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {searchedPersons.map((p) => (
              <Link key={p.id} href={`/persons/${p.id}`} className="church-card overflow-hidden hover:shadow-lg transition-shadow block">
                <div className="p-4 flex flex-col items-center text-center">
                  <SmallPhoto src={p.photo} name={p.name} size={72} />
                  <p className="font-bold text-sm mt-3" style={{ color: "var(--navy)" }}>{p.name}</p>
                  {p.servant && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <SmallPhoto src={p.servant.photo} name={p.servant.name} size={20} />
                      <span className="text-xs" style={{ color: "var(--navy-light)" }}>{p.servant.name.split(" ")[0]}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex rounded-lg overflow-hidden flex-shrink-0" style={{ border: "2px solid var(--gold)" }}>
          <button
            onClick={() => setViewMode("table")}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: viewMode === "table" ? "var(--gold)" : "transparent",
              color: viewMode === "table" ? "white" : "var(--gold-dark)",
            }}
          >
            جدول الكل
          </button>
          <button
            onClick={() => setViewMode("byClass")}
            className="px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: viewMode === "byClass" ? "var(--gold)" : "transparent",
              color: viewMode === "byClass" ? "white" : "var(--gold-dark)",
            }}
          >
            حسب الفصل
          </button>
        </div>

        {canAdd && (
          <Link href="/persons/new" className="btn-gold text-sm flex-shrink-0">
            + إضافة مخدوم
          </Link>
        )}
      </div>

      {searchBar}

      {/* Table View */}
      {viewMode === "table" && (
        <div>
          <div className="mb-4">
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)", color: "var(--navy)" }}
            >
              <option value="">كل الفصول</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "var(--gold-pale)" }}>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>المخدوم</th>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>الفصل</th>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>الخادم</th>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>ولي الأمر</th>
                    <th className="px-3 py-3 text-right font-bold" style={{ color: "var(--navy)" }}>التليفون</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: "1px solid var(--cream-dark)",
                        background: i % 2 === 0 ? "transparent" : "var(--cream)",
                      }}
                    >
                      {/* Person */}
                      <td className="px-3 py-2.5">
                        <Link href={`/persons/${p.id}`} className="flex items-center gap-2 hover:opacity-80">
                          <SmallPhoto src={p.photo} name={p.name} size={36} />
                          <span className="font-medium" style={{ color: "var(--navy)" }}>{p.name}</span>
                        </Link>
                      </td>
                      {/* Class */}
                      <td className="px-3 py-2.5" style={{ color: "var(--navy-light)" }}>
                        {p.className || "—"}
                      </td>
                      {/* Servant */}
                      <td className="px-3 py-2.5">
                        {p.servant ? (
                          <div className="flex items-center gap-1.5">
                            <SmallPhoto src={p.servant.photo} name={p.servant.name} size={24} />
                            <span className="text-xs" style={{ color: "var(--navy-light)" }}>{p.servant.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--navy-light)" }}>—</span>
                        )}
                      </td>
                      {/* Guardian */}
                      <td className="px-3 py-2.5" style={{ color: "var(--navy-light)" }}>
                        {p.guardianName || "—"}
                      </td>
                      {/* Phone */}
                      <td className="px-3 py-2.5" style={{ color: "var(--navy-light)" }}>
                        {p.guardianPhone ? (
                          <a href={`tel:${p.guardianPhone}`} style={{ color: "var(--gold-dark)" }}>{p.guardianPhone}</a>
                        ) : p.phone ? (
                          <a href={`tel:${p.phone}`} style={{ color: "var(--gold-dark)" }}>{p.phone}</a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-8" style={{ color: "var(--navy-light)" }}>
                        لا يوجد مخدومين
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* By Class View */}
      {viewMode === "byClass" && (
        <div className="space-y-6">
          <div className="mb-2">
            <select
              value={filterClassId}
              onChange={(e) => setFilterClassId(e.target.value)}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ border: "2px solid var(--cream-dark)", background: "var(--cream)", color: "var(--navy)" }}
            >
              <option value="">كل الفصول</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {groupedByClass.map((group) => (
            <div key={group.id} className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--gold)" }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--gold-pale)" }}>
                <h3 className="font-bold font-amiri" style={{ color: "var(--navy)" }}>
                  <span style={{ color: "var(--gold-dark)" }}>📖</span> {group.name}
                </h3>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "var(--gold)", color: "white" }}>
                  {group.persons.length} مخدوم
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--cream-dark)" }}>
                {group.persons.map((p) => (
                  <Link key={p.id} href={`/persons/${p.id}`} className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--cream)] transition-colors block">
                    <SmallPhoto src={p.photo} name={p.name} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>{p.name}</p>
                      {p.guardianName && <p className="text-xs" style={{ color: "var(--navy-light)" }}>ولي الأمر: {p.guardianName}</p>}
                    </div>
                    {p.servant && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <SmallPhoto src={p.servant.photo} name={p.servant.name} size={28} />
                        <span className="text-xs" style={{ color: "var(--navy-light)" }}>{p.servant.name.split(" ")[0]}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {unassigned.length > 0 && (
            <div className="church-card overflow-hidden" style={{ borderTop: "3px solid var(--cream-dark)" }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: "var(--cream)" }}>
                <h3 className="font-bold font-amiri" style={{ color: "var(--navy-light)" }}>
                  بدون فصل
                </h3>
                <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: "var(--cream-dark)", color: "var(--navy-light)" }}>
                  {unassigned.length} مخدوم
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "var(--cream-dark)" }}>
                {unassigned.map((p) => (
                  <Link key={p.id} href={`/persons/${p.id}`} className="px-5 py-3 flex items-center gap-3 hover:bg-[var(--cream)] transition-colors block">
                    <SmallPhoto src={p.photo} name={p.name} size={44} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>{p.name}</p>
                      {p.guardianName && <p className="text-xs" style={{ color: "var(--navy-light)" }}>ولي الأمر: {p.guardianName}</p>}
                    </div>
                    {p.servant && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <SmallPhoto src={p.servant.photo} name={p.servant.name} size={28} />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {groupedByClass.length === 0 && unassigned.length === 0 && (
            <div className="church-card text-center py-12">
              <p className="text-4xl mb-3" style={{ color: "var(--gold)" }}>🕊</p>
              <p style={{ color: "var(--navy-light)" }}>لا يوجد مخدومين مسجلين</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
