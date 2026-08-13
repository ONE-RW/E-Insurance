const { Op, fn, col, literal } = require('sequelize');
const { ActivityLog, Policy, InsuranceCompany, User, sequelize } = require('../models');

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateKey(date) {
  const d = startOfDay(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Parses ActivityLog.details, which Sequelize/MySQL hands back as a JSON
// *string* rather than an auto-parsed object (confirmed via live testing).
// Rows that fail to parse are skipped rather than crashing the aggregation.
function parseDetails(raw) {
  if (raw == null) return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

async function getDashboard(req, res, next) {
  try {
    const days = parseInt(req.query.days, 10) > 0 ? parseInt(req.query.days, 10) : 30;

    const today = startOfDay(new Date());
    const rangeStart = new Date(today);
    rangeStart.setDate(rangeStart.getDate() - (days - 1));

    const rangeEnd = new Date(today);
    rangeEnd.setDate(rangeEnd.getDate() + 1); // exclusive upper bound (start of tomorrow)

    const in30Days = new Date(today);
    in30Days.setDate(in30Days.getDate() + 30);

    const searchLogs = await ActivityLog.findAll({
      where: {
        action: 'search',
        created_at: { [Op.gte]: rangeStart, [Op.lt]: rangeEnd }
      },
      attributes: ['id', 'user_id', 'details', 'created_at']
    });

    let vehiclesFound = 0;
    let vehiclesNotFound = 0;
    let insuredFound = 0;
    let notInsuredFound = 0;

    for (const log of searchLogs) {
      const details = parseDetails(log.details);
      if (!details) continue;

      if (details.found === true) {
        vehiclesFound += 1;
        if (details.insured === true) {
          insuredFound += 1;
        } else if (details.insured === false) {
          notInsuredFound += 1;
        }
      } else if (details.found === false) {
        vehiclesNotFound += 1;
      }
    }

    const [activePolicies, expiringSoonPolicies, cancelledPolicies, totalCompanies, totalOfficers] = await Promise.all([
      Policy.count({ where: { status: 'active', end_date: { [Op.gte]: today } } }),
      Policy.count({ where: { status: 'active', end_date: { [Op.gte]: today, [Op.lte]: in30Days } } }),
      Policy.count({ where: { status: 'cancelled' } }),
      InsuranceCompany.count(),
      User.count({ where: { role: 'officer' } })
    ]);

    const totals = {
      searches: searchLogs.length,
      vehicles_found: vehiclesFound,
      vehicles_not_found: vehiclesNotFound,
      insured_found: insuredFound,
      not_insured_found: notInsuredFound,
      active_policies: activePolicies,
      expiring_soon_policies: expiringSoonPolicies,
      cancelled_policies: cancelledPolicies,
      total_companies: totalCompanies,
      total_officers: totalOfficers
    };

    // searches_by_day: zero-filled for every day in the window, merged with a
    // DB-level GROUP BY DATE(created_at) for the actual counts.
    const dailyCounts = await ActivityLog.findAll({
      where: {
        action: 'search',
        created_at: { [Op.gte]: rangeStart, [Op.lt]: rangeEnd }
      },
      attributes: [[fn('DATE', col('created_at')), 'day'], [fn('COUNT', col('id')), 'count']],
      group: [literal('DATE(created_at)')],
      raw: true
    });

    const countsByDay = new Map();
    for (const row of dailyCounts) {
      const key = row.day instanceof Date ? toDateKey(row.day) : String(row.day).slice(0, 10);
      countsByDay.set(key, parseInt(row.count, 10));
    }

    const searches_by_day = [];
    for (let i = 0; i < days; i += 1) {
      const d = new Date(rangeStart);
      d.setDate(d.getDate() + i);
      const key = toDateKey(d);
      searches_by_day.push({ date: key, count: countsByDay.get(key) || 0 });
    }

    // policies_by_company: every company appears, zero-filled if it has no policies.
    const [companies, allPolicies] = await Promise.all([
      InsuranceCompany.findAll({ attributes: ['id', 'name'], order: [['name', 'ASC']] }),
      Policy.findAll({ attributes: ['insurance_company_id', 'status', 'end_date'] })
    ]);

    const policies_by_company = companies.map((company) => {
      const companyPolicies = allPolicies.filter((p) => p.insurance_company_id === company.id);
      let active = 0;
      let expiring_soon = 0;
      let cancelled = 0;

      for (const p of companyPolicies) {
        if (p.status === 'cancelled') {
          cancelled += 1;
        } else if (p.status === 'active') {
          const endDate = p.end_date ? startOfDay(new Date(p.end_date)) : null;
          if (endDate && endDate >= today) {
            active += 1;
            if (endDate <= in30Days) {
              expiring_soon += 1;
            }
          }
        }
      }

      return { company: company.name, active, expiring_soon, cancelled };
    });

    // top_officers: top 5 officers by their own search-action log count in the window.
    const officerLogs = searchLogs.filter((log) => log.user_id != null);
    const countsByUser = new Map();
    for (const log of officerLogs) {
      countsByUser.set(log.user_id, (countsByUser.get(log.user_id) || 0) + 1);
    }

    const officerIds = [...countsByUser.keys()];
    const officers = officerIds.length
      ? await User.findAll({ where: { id: officerIds, role: 'officer' }, attributes: ['id', 'full_name'] })
      : [];

    const top_officers = officers
      .map((o) => ({ full_name: o.full_name, searches: countsByUser.get(o.id) || 0 }))
      .sort((a, b) => b.searches - a.searches)
      .slice(0, 5);

    return res.status(200).json({ totals, searches_by_day, policies_by_company, top_officers });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getDashboard };
