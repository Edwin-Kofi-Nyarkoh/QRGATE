"use client";

import { useState, useEffect } from "react";

interface SecurityOfficerStatsProps {
  eventId: string;
  securityId: string;
  eventData: {
    title: string;
    totalTickets: number;
    soldTickets: number;
  };
}

export function SecurityOfficerStats({
  eventId,
  securityId,
  eventData,
}: SecurityOfficerStatsProps) {
  const [stats, setStats] = useState<{
    totalVerifications: number;
    totalIncidents: number;
  }>({
    totalVerifications: 0,
    totalIncidents: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [eventId, securityId]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/security/stats?eventId=${eventId}&securityId=${securityId}`
      );
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      } else {
        console.error("Failed to fetch stats");
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render recent activity for this security officer
  const filteredActivity = recentActivity.filter(
    (activity) => activity.securityOfficerId === securityId
  );

  return (
    <div className="shadow rounded-lg p-4">
      <h3 className="text-lg font-medium">Security Officer Stats</h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-card rounded-lg p-4">
          <dt className="text-sm font-medium text-muted-foreground truncate">
            Tickets Scanned
          </dt>
          <dd className="mt-1 text-3xl font-semibold">
            {stats.totalVerifications}
          </dd>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium ">Recent Activity</h4>
        <div className="space-y-4">
          {isLoading ? (
            <p>Loading...</p>
          ) : filteredActivity.length === 0 ? (
            <p className="text-muted-foreground text-sm">No recent activity.</p>
          ) : (
            <ul className="space-y-2">
              {filteredActivity.map((activity) => (
                <li
                  key={activity.id}
                  className="bg-card rounded-lg p-3 flex flex-col sm:flex-row sm:items-center gap-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary">
                      {activity.action.replace(/_/g, " ")}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">
                      Ticket:{" "}
                      <span className="font-mono">{activity.ticket?.type}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      User: {activity.ticket?.user?.name} (
                      {activity.ticket?.user?.email})
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
