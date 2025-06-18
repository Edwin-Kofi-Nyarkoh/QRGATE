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
    ticketsScanned: number;
    totalIncidents: number;
  }>({
    ticketsScanned: 0,
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

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <h3 className="text-lg font-medium text-gray-900">
        Security Officer Stats
      </h3>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="bg-gray-50 rounded-lg p-4">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Tickets Scanned
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.ticketsScanned}
          </dd>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <dt className="text-sm font-medium text-gray-500 truncate">
            Total Incidents
          </dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">
            {stats.totalIncidents}
          </dd>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-500">Recent Activity</h4>
        <ul className="mt-3 divide-y divide-gray-200">
          {isLoading ? (
            <li>Loading...</li>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <li key={activity.id} className="py-2">
                <div className="flex items-center space-x-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li>No recent activity.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
