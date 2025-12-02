import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const AreaChartCard = ({
  data = [],
  title = 'Biểu đồ',
  dataKey = 'count',
  color = '#0d6efd',
  unit = '',
}) => {
  // format ngày từ "2025-12-01" sang "01/12"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  // fallback color
  const strokeColor = color || '#0d6efd';

  // deterministic gradient id derived from title+color to avoid impure calls
  const gradientId = useMemo(() => {
    const s = `${title}_${strokeColor}`;
    let h = 0;
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return `colorCount_${Math.abs(h)}`;
  }, [title, strokeColor]);

  return (
    <div className="card shadow-sm border-0 h-100">
      <div className="card-body">
        <h5 className="card-title text-muted mb-4 fw-bold">
          <i className="fas fa-chart-line me-2"></i>
          {title}
        </h5>

        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />

              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                stroke="#6c757d"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              <YAxis stroke="#6c757d" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  borderRadius: '0.375rem',
                  border: '1px solid #dee2e6',
                  boxShadow: '0 .5rem 1rem rgba(0,0,0,.15)',
                }}
                itemStyle={{ color: strokeColor, fontWeight: 'bold' }}
                formatter={(value) => [`${value} ${unit}`.trim(), unit ? unit : '']}
                labelFormatter={(label) => `Ngày: ${formatDate(label)}`}
              />

              <Area type="monotone" dataKey={dataKey} stroke={strokeColor} fillOpacity={1} fill={`url(#${gradientId})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AreaChartCard;