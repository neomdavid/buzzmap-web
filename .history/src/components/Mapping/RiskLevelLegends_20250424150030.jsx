const RISK_LEVELS = ["High", "Medium", "Low"];
const RISK_COLORS = {
  High: "#e53e3e",
  Medium: "#dd6b20",
  Low: "#38a169",
};
//
function RiskLevelLegends() {
  return (
    <div className="flex flex-col shadow-sm border-1 border-gray-100 p-4">
      <strong>Risk Level</strong>
      <div>
        <span
          style={{
            backgroundColor: RISK_COLORS.High,
            display: "inline-block",
            width: 12,
            height: 12,
            marginRight: 6,
          }}
        />{" "}
        High
      </div>
      <div>
        <span
          style={{
            backgroundColor: RISK_COLORS.Medium,
            display: "inline-block",
            width: 12,
            height: 12,
            marginRight: 6,
          }}
        />{" "}
        Medium
      </div>
      <div>
        <span
          style={{
            backgroundColor: RISK_COLORS.Low,
            display: "inline-block",
            width: 12,
            height: 12,
            marginRight: 6,
          }}
        />
        Low
      </div>
    </div>
  );
}

export default RiskLevelLegends;
