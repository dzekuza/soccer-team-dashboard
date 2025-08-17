'use client';
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

// Standings row type
interface Standing {
  team_key: string;
  team_name: string | null;
  position: number | null;
  played: number | null;
  won: number | null;
  drawn: number | null;
  lost: number | null;
  scored: number | null;
  conceded: number | null;
  goal_diff: string | null;
  points: number | null;
  logo: string | null;
  fingerprint: string;
}

interface Team {
  id: string;
  team_name: string;
  logo: string;
}

const isAdmin = true; // TODO: Replace with real admin check

export default function StandingsClient() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState<Standing | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<Standing>>({});
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [teamKeys, setTeamKeys] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/teams")
      .then((res) => res.json())
      .then((data) => setTeams(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch("/api/standings")
      .then((res) => res.json())
      .then((data) => {
        setStandings(Array.isArray(data) ? data : []);
        // Extract unique team_keys for filter dropdown
        const keys = Array.isArray(data) ? Array.from(new Set(data.map((row: Standing) => row.team_key))) : [];
        setTeamKeys(keys.filter(Boolean));
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedTeam) return;
    setLoading(true);
    fetch(`/api/standings?team_key=${encodeURIComponent(selectedTeam)}`)
      .then((res) => res.json())
      .then((data) => {
        setStandings(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, [selectedTeam]);

  const openEditModal = (row: Standing) => {
    setEditRow(row);
    setForm(row);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditRow(null);
    setForm({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    await fetch(`/api/standings/${editRow?.fingerprint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    // Refresh data
    const res = await fetch("/api/standings");
    setStandings(await res.json());
    closeModal();
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Standings</h1>
      <div className="mb-4 flex items-center gap-2">
        <label htmlFor="team-filter" className="text-sm">Filter by team key:</label>
        <select
          id="team-filter"
          value={selectedTeam}
          onChange={e => setSelectedTeam(e.target.value)}
          className="border border-[#5F5F71] bg-[#070F40] text-white rounded px-3 py-2"
        >
          <option value="">All Teams</option>
          {teamKeys.map(key => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0A165B] text-[#B6C1E2]">
                <TableHead className="px-3 py-2">#</TableHead>
                <TableHead className="px-3 py-2">Team</TableHead>
                <TableHead className="px-3 py-2">Played</TableHead>
                <TableHead className="px-3 py-2">W</TableHead>
                <TableHead className="px-3 py-2">D</TableHead>
                <TableHead className="px-3 py-2">L</TableHead>
                <TableHead className="px-3 py-2">GF</TableHead>
                <TableHead className="px-3 py-2">GA</TableHead>
                <TableHead className="px-3 py-2">GD</TableHead>
                <TableHead className="px-3 py-2">Pts</TableHead>
                {isAdmin && <TableHead className="px-3 py-2">Edit</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(standings) && standings.length > 0 ? (
                standings.map((row) => (
                  <TableRow key={row.fingerprint} className="border-t border-[#5F5F71]">
                    <TableCell className="px-3 py-2 text-center">{row.position}</TableCell>
                    <TableCell className="px-3 py-2 flex items-center gap-2">
                      {row.logo && <img src={row.logo} alt="logo" className="w-6 h-6 rounded" />}
                      {row.team_name}
                    </TableCell>
                    <TableCell className="px-3 py-2 text-center">{row.played}</TableCell>
                    <TableCell className="px-3 py-2 text-center">{row.won}</TableCell>
                    <TableCell className="px-3 py-2 text-center">{row.drawn}</TableCell>
                    <TableCell className="px-3 py-2 text-center">{row.lost}</TableCell>
                    <TableCell className="px-3 py-2 text-center">{row.scored}</TableCell>
                    <TableCell className="px-3 py-2 text-center">{row.conceded}</TableCell>
                    <TableCell className="px-3 py-2 text-center">{row.goal_diff}</TableCell>
                    <TableCell className="px-3 py-2 text-center font-bold">{row.points}</TableCell>
                    {isAdmin && (
                      <TableCell className="px-3 py-2 text-center">
                        <Button size="sm" onClick={() => openEditModal(row)}>
                          Edit
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 11 : 10} className="text-center py-8 text-muted-foreground">No standings found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Standing</DialogTitle>
          </DialogHeader>
          {editRow && (
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSave();
              }}
              className="space-y-3"
            >
              <div className="grid grid-cols-2 gap-2">
                <label className="text-sm">Team Name
                  <Input name="team_name" value={form.team_name ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Position
                  <Input name="position" type="number" value={form.position ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Played
                  <Input name="played" type="number" value={form.played ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Won
                  <Input name="won" type="number" value={form.won ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Drawn
                  <Input name="drawn" type="number" value={form.drawn ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Lost
                  <Input name="lost" type="number" value={form.lost ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Scored
                  <Input name="scored" type="number" value={form.scored ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Conceded
                  <Input name="conceded" type="number" value={form.conceded ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Goal Diff
                  <Input name="goal_diff" value={form.goal_diff ?? ""} onChange={handleChange} className="mt-1" />
                </label>
                <label className="text-sm">Points
                  <Input name="points" type="number" value={form.points ?? ""} onChange={handleChange} className="mt-1" />
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 