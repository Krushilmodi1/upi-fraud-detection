const RiskBadge = ({ tier }) => {
    const colors = {
        Low: 'bg-green-100 text-green-800 border-green-300',
        Medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        High: 'bg-red-100 text-red-800 border-red-300'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${colors[tier] || colors.Low}`}>
            {tier} Risk
        </span>
    );
};

export default RiskBadge;