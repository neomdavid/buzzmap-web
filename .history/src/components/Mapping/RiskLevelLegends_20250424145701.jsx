const RISK_LEVELS = ["High", "Medium", "Low"];
const RISK_COLORS = {
  High: "#e53e3e",
  Medium: "#dd6b20",
  Low: "#38a169",
};
function RiskLevelLegends() {
  return (
    <div
      style={{
        position: "absolute",
        top: 10,
        right: 10,
        backgroundColor: "white",
        padding: "8px 12px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
        fontSize: "14px",
        zIndex: 1000,
      }}
    >
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
