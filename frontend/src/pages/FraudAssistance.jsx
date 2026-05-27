const steps = {
    Low: [
        { icon: '👁️', title: 'Monitor Regularly', desc: 'Check your UPI transaction history daily.' },
        { icon: '🔒', title: 'Keep PIN Secret', desc: 'Never share your UPI PIN or OTP with anyone.' },
        { icon: '🔔', title: 'Enable Alerts', desc: 'Turn on transaction alerts in your bank app.' },
        { icon: '✅', title: 'Verify Merchants', desc: 'Always verify merchant details before paying.' },
    ],
    Medium: [
        { icon: '🔑', title: 'Change UPI PIN', desc: 'Change your UPI PIN immediately.' },
        { icon: '📋', title: 'Review Transactions', desc: 'Check all recent transactions for unauthorized activity.' },
        { icon: '🏦', title: 'Contact Bank', desc: 'Call your bank to limit transaction amounts temporarily.' },
        { icon: '🚫', title: 'Avoid Links', desc: 'Do not click on any suspicious payment links.' },
    ],
    High: [
        { icon: '🚨', title: 'Block Account NOW', desc: 'Block your bank account immediately via net banking.' },
        { icon: '📞', title: 'Call 1930', desc: 'Call the National Cybercrime Helpline: 1930 immediately.' },
        { icon: '💻', title: 'File Complaint', desc: 'Report at cybercrime.gov.in with all transaction details.' },
        { icon: '🏛️', title: 'Police Station', desc: 'Visit your nearest police station to file an FIR.' },
    ]
};

const FraudAssistance = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-blue-400">🆘 Fraud Assistance</h1>
                <p className="text-gray-400 mb-10">Recovery steps based on your fraud risk level</p>

                <div className="bg-red-900 border border-red-700 rounded-2xl p-6 mb-10 text-center">
                    <div className="text-4xl mb-3">📞</div>
                    <h2 className="text-2xl font-bold mb-2">Emergency: Call 1930</h2>
                    <p className="text-red-200">National Cybercrime Helpline — Available 24/7</p>
                    <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer"
                        className="inline-block mt-4 bg-red-700 hover:bg-red-600 px-6 py-2 rounded-lg transition">
                        Report at cybercrime.gov.in →
                    </a>
                </div>

                {Object.entries(steps).map(([tier, tierSteps]) => (
                    <div key={tier} className="mb-10">
                        <h2 className={`text-2xl font-bold mb-6 ${
                            tier === 'High' ? 'text-red-400' :
                            tier === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                        }`}>
                            {tier === 'High' ? '🔴' : tier === 'Medium' ? '🟡' : '🟢'} {tier} Risk Steps
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {tierSteps.map((step, i) => (
                                <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800 flex gap-4">
                                    <div className="text-3xl">{step.icon}</div>
                                    <div>
                                        <h3 className="font-semibold mb-1">{step.title}</h3>
                                        <p className="text-gray-400 text-sm">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FraudAssistance;