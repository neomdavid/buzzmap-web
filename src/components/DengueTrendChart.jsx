const DengueTrendChart = ({ data, selectedBarangay }) => {
  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dengue Cases Trend</h3>
        {selectedBarangay && (
          <span className="text-sm text-gray-600">
            {selectedBarangay}
          </span>
        )}
      </div>
      
      {!data || data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          No data available
        </div>
      ) : (
        <div className="w-[480px] h-[270px]">
          <LineChart
            width={480}
            height={270}
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="week" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `Week ${value}`}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ 
                value: 'Cases', 
                angle: -90, 
                position: 'insideLeft',
                style: { fontSize: 12 }
              }}
            />
            <Tooltip 
              formatter={(value) => [`${value} cases`, 'Cases']}
              labelFormatter={(label) => `Week ${label}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cases" 
              stroke="#8884d8" 
              activeDot={{ r: 8 }} 
              name="Dengue Cases"
            />
          </LineChart>
        </div>
      )}
    </div>
  );
};

export default DengueTrendChart; 