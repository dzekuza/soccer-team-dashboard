"use client";

import React, { useEffect, useState } from "react";
import { saveAs } from "file-saver";

interface Fan {
  id: string;
  name: string;
  email: string;
  eventsAttended: number;
  moneySpent: number;
}

export default function FansPage() {
  const [fans, setFans] = useState<Fan[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fans")
      .then((res) => res.json())
      .then((data) => setFans(data))
      .finally(() => setLoading(false));
  }, []);

  const filteredFans = fans.filter(
    (fan) =>
      fan.name.toLowerCase().includes(filter.toLowerCase()) ||
      fan.email.toLowerCase().includes(filter.toLowerCase())
  );

  const exportEmails = () => {
    const emails = filteredFans.map((fan) => fan.email).join(",\n");
    const blob = new Blob([emails], { type: "text/csv" });
    saveAs(blob, "fan-emails.csv");
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fans</h1>
        <button
          onClick={exportEmails}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold"
        >
          Export Emails (CSV)
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filter by name or email..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Name</th>
              <th className="px-4 py-2 border-b">Email</th>
              <th className="px-4 py-2 border-b">Events Attended</th>
              <th className="px-4 py-2 border-b">Money Spent (€)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">Loading...</td>
              </tr>
            ) : filteredFans.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">No fans found.</td>
              </tr>
            ) : (
              filteredFans.map((fan) => (
                <tr key={fan.id}>
                  <td className="px-4 py-2 border-b">{fan.name}</td>
                  <td className="px-4 py-2 border-b">{fan.email}</td>
                  <td className="px-4 py-2 border-b text-center">{fan.eventsAttended}</td>
                  <td className="px-4 py-2 border-b text-right">{fan.moneySpent.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 