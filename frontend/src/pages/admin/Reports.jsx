import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Car, Clock, FileText, Search, ShieldCheck, Trophy, XCircle } from "lucide-react";
import { getReportsDashboard } from "../../api/reports";
import Spinner from "../../components/Spinner";
import StatCard from "../../components/StatCard";
import DataTable from "../../components/DataTable";
import FormField from "../../components/FormField";

// Colors follow the dataviz skill's reference palette (references/palette.md).
// This app has no dark-mode support anywhere else (StatCard, Spinner, every
// existing page render light-only), so these charts intentionally stay
// light-only too rather than introducing dark-mode handling in isolation.
const COLOR_SERIES_1 = "#2a78d6"; // categorical slot 1 (blue) - single-series searches line
const COLOR_GOOD = "#0ca30c"; // status: active policies
const COLOR_WARNING = "#fab219"; // status: expiring-soon policies
const COLOR_CRITICAL = "#d03b3b"; // status: cancelled policies
const COLOR_GRID = "#e1e0d9"; // hairline gridline, one step off the white surface
const COLOR_AXIS = "#c3c2b7"; // baseline/axis
const COLOR_MUTED = "#898781"; // axis tick text
const COLOR_SURFACE = "#ffffff"; // chart surface (matches card bg-white)

const DAY_OPTIONS = [
  { value: 7, label: "Last 7 days" },
  { value: 30, label: "Last 30 days" },
  { value: 90, label: "Last 90 days" },
];

function formatShortDate(value) {
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Shared tooltip: values lead (bold, high-contrast), series name follows,
// and each row is keyed with a short stroke of the series color rather than
// a filled swatch box (per dataviz skill's interaction guidance).
function ChartTooltip({ active, payload, label, labelFormatter }) {
  if (!active || !payload || !payload.length) return null;
  const displayLabel = labelFormatter ? labelFormatter(label) : label;
  return (
    <div className="rounded-md border border-gray-200 bg-white px-3 py-2 text-xs shadow-md">
      <p className="mb-1 font-medium text-gray-500">{displayLabel}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-3 shrink-0" style={{ backgroundColor: entry.color }} />
          <span className="font-semibold text-navy-900">{entry.value}</span>
          <span className="text-gray-500">{entry.name}</span>
        </p>
      ))}
    </div>
  );
}

// Status legend rendered below the chart: each swatch is paired with an icon
// and a label (never color alone), per the dataviz skill's status-color rule.
function StatusLegend({ items }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-600">
      {items.map(({ label, color, Icon }) => (
        <span key={label} className="inline-flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold text-navy-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function Reports() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["reportsDashboard", days],
    queryFn: () => getReportsDashboard(days),
  });

  const totals = data?.totals;
  const searchesByDay = data?.searches_by_day || [];
  const policiesByCompany = data?.policies_by_company || [];
  const topOfficers = data?.top_officers || [];

  const searches = totals?.searches ?? 0;
  const foundRate = totals && searches > 0 ? Math.round((totals.vehicles_found / searches) * 100) : 0;
  const foundTotal = totals ? totals.insured_found + totals.not_insured_found : 0;
  const insuredRate = totals && foundTotal > 0 ? Math.round((totals.insured_found / foundTotal) * 100) : 0;

  const officerRows = topOfficers.map((o, i) => ({ ...o, rank: i + 1 }));
  const officerColumns = [
    { key: "rank", header: "#", sortable: false },
    { key: "full_name", header: "Officer", sortable: false },
    { key: "searches", header: "Searches", sortable: false },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-navy-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-500">System-wide activity and policy summary.</p>
          </div>
        </div>

        <FormField
          as="select"
          label="Date range"
          id="days"
          wrapperClassName="mb-0 w-48"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          {DAY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </FormField>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className={isFetching ? "opacity-60 transition" : ""}>
          <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Searches" value={searches} icon={Search} />
            <StatCard label="Vehicles Found Rate" value={`${foundRate}%`} icon={Car} />
            <StatCard
              label="Insured Rate (of Found)"
              value={`${insuredRate}%`}
              accent="text-green-700"
              icon={ShieldCheck}
            />
            <StatCard
              label="Active Policies"
              value={totals?.active_policies ?? 0}
              accent="text-green-700"
              icon={FileText}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ChartCard title="Searches by day" subtitle={`Search volume over the last ${days} days.`}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={searchesByDay} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={COLOR_GRID} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    tick={{ fill: COLOR_MUTED, fontSize: 12 }}
                    axisLine={{ stroke: COLOR_AXIS }}
                    tickLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: COLOR_MUTED, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip labelFormatter={formatShortDate} />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Searches"
                    stroke={COLOR_SERIES_1}
                    strokeWidth={2}
                    dot={{ r: 4, fill: COLOR_SERIES_1, stroke: COLOR_SURFACE, strokeWidth: 2 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Policies by company" subtitle="Active, expiring-soon and cancelled policies per insurer.">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={policiesByCompany}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                  barCategoryGap="24%"
                  barGap={2}
                >
                  <CartesianGrid stroke={COLOR_GRID} vertical={false} />
                  <XAxis
                    dataKey="company"
                    tick={{ fill: COLOR_MUTED, fontSize: 11 }}
                    axisLine={{ stroke: COLOR_AXIS }}
                    tickLine={false}
                    interval={0}
                    angle={policiesByCompany.length > 4 ? -25 : 0}
                    textAnchor={policiesByCompany.length > 4 ? "end" : "middle"}
                    height={policiesByCompany.length > 4 ? 56 : 30}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: COLOR_MUTED, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(11,11,11,0.04)" }} />
                  <Bar dataKey="active" name="Active" fill={COLOR_GOOD} radius={[4, 4, 0, 0]} maxBarSize={24} />
                  <Bar
                    dataKey="expiring_soon"
                    name="Expiring soon"
                    fill={COLOR_WARNING}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                  <Bar
                    dataKey="cancelled"
                    name="Cancelled"
                    fill={COLOR_CRITICAL}
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
              <StatusLegend
                items={[
                  { label: "Active", color: COLOR_GOOD, Icon: ShieldCheck },
                  { label: "Expiring soon", color: COLOR_WARNING, Icon: Clock },
                  { label: "Cancelled", color: COLOR_CRITICAL, Icon: XCircle },
                ]}
              />
            </ChartCard>
          </div>

          <div className="mt-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-navy-700" />
                <h2 className="text-sm font-semibold text-navy-900">Top Officers</h2>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                Officers with the most vehicle searches in the last {days} days.
              </p>
              <div className="mt-4">
                <DataTable
                  columns={officerColumns}
                  data={officerRows}
                  rowKey={(row) => row.rank}
                  pageSize={5}
                  emptyMessage="No search activity in this period."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
