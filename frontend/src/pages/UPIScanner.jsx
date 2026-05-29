import { useState } from 'react';

const suspiciousKeywords = [
    'free', 'gift', 'prize', 'win', 'lottery', 'scheme', 'offer',
    'lucky', 'reward', 'cashback', 'refund', 'claim', 'govt', 'gov',
    'modi', 'pm', 'helpline', 'support', 'kyc', 'verify', 'urgent',
    'block', 'suspend', 'expire', 'update', 'hack', 'test123'
];

const validHandles = [
    'okaxis', 'okhdfcbank', 'okicici', 'oksbi', 'ybl', 'ibl',
    'axl', 'upi', 'paytm', 'apl', 'rajgovnhe', 'barodampay',
    'cnrb', 'unionbank', 'pnb', 'kotak', 'indus', 'federal'
];

const analyzeUPI = (upiId) => {
    const lower = upiId.toLowerCase();
    const issues = [];
    let riskScore = 0;

    // Check format
    if (!upiId.includes('@')) {
        return { valid: false, error: 'Invalid UPI ID format. Must contain @' };
    }

    const [username, handle] = lower.split('@');

    // Check username patterns
    suspiciousKeywords.forEach(keyword => {
        if (username.includes(keyword)) {
            issues.push(`Contains suspicious keyword: "${keyword}"`);
            riskScore += 25;
        }
    });

    // Check handle
    if (!validHandles.includes(handle)) {
        issues.push(`Unknown UPI handle: @${handle}`);
        riskScore += 15;
    }

    // Check username length
    if (username.length < 3) {
        issues.push('Username too short — possibly fake');
        riskScore += 20;
    }

    // Check for too many numbers
    const numbers = username.replace(/\D/g, '');
    if (numbers.length > 8) {
        issues.push('Too many numbers in username — possibly auto-generated');
        riskScore += 10;
    }

    // Check for special characters
    if (/[^a-z0-9._-]/.test(username)) {
        issues.push('Contains unusual special characters');
        riskScore += 20;
    }

    // Cap at 100
    riskScore = Math.min(riskScore, 100);

    const tier = riskScore >= 70 ? 'High' :
                 riskScore >= 30 ? 'Medium' : 'Low';

    return { valid: true, riskScore, tier, issues, username, handle };
};

const UPIScanner = () => {
    const [upiId, setUpiId] = useState('');
    const [result, setResult] = useState(null);

    const handleScan = (e) => {
        e.preventDefault();
        if (!upiId.trim()) return;
        const analysis = analyzeUPI(upiId.trim());
        setResult(analysis);
    };

    const tierColors = {
        Low: 'border-green-600 bg-green-900',
        Medium: 'border-yellow-600 bg-yellow-900',
        High: 'border-red-600 bg-red-900'
    };

    const tierIcons = { Low: '✅', Medium: '⚠️', High: '🚨' };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-blue-400">
                    🔎 UPI ID Scanner
                </h1>
                <p className="text-gray-400 mb-8">
                    Check if a UPI ID looks suspicious before sending money
                </p>

                <form onSubmit={handleScan} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 mb-6">
                    <label className="text-gray-300 text-sm mb-2 block">
                        Enter UPI ID to scan
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="example@okaxis"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500"
                            required
                        />
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
                        >
                            Scan
                        </button>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">
                        Example: 9876543210@ybl or name@okicici
                    </p>
                </form>

                {result && (
                    <>
                        {!result.valid ? (
                            <div className="bg-red-900 border border-red-700 rounded-2xl p-6">
                                <p className="text-red-300">❌ {result.error}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className={`rounded-2xl p-6 border-2 ${tierColors[result.tier]} text-center`}>
                                    <div className="text-5xl mb-3">{tierIcons[result.tier]}</div>
                                    <div className="text-2xl font-bold mb-1">
                                        {result.tier === 'Low' ? 'Looks Safe' :
                                         result.tier === 'Medium' ? 'Proceed with Caution' :
                                         'HIGH RISK — Do Not Pay!'}
                                    </div>
                                    <div className="text-gray-300 text-sm">{upiId}</div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
                                        <div className="text-3xl font-bold text-blue-400">{result.riskScore}</div>
                                        <div className="text-gray-400 text-sm">Risk Score</div>
                                    </div>
                                    <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
                                        <div className="text-lg font-bold text-yellow-400">@{result.handle}</div>
                                        <div className="text-gray-400 text-sm">Bank Handle</div>
                                    </div>
                                    <div className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
                                        <div className="text-lg font-bold text-green-400">{result.username}</div>
                                        <div className="text-gray-400 text-sm">Username</div>
                                    </div>
                                </div>

                                {result.issues.length > 0 ? (
                                    <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                                        <h3 className="font-semibold mb-3 text-red-400">⚠️ Issues Found:</h3>
                                        <ul className="space-y-2">
                                            {result.issues.map((issue, i) => (
                                                <li key={i} className="flex gap-2 text-sm text-gray-300">
                                                    <span className="text-red-400">•</span> {issue}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-gray-900 rounded-2xl p-6 border border-green-800">
                                        <p className="text-green-400">✅ No suspicious patterns found in this UPI ID.</p>
                                    </div>
                                )}

                                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                                    <h3 className="font-semibold mb-3 text-blue-400">💡 Safety Tips:</h3>
                                    <ul className="space-y-2 text-sm text-gray-300">
                                        <li>• Always verify the receiver's name shown after entering UPI ID</li>
                                        <li>• Never pay to UPI IDs shared via WhatsApp or unknown links</li>
                                        <li>• Government schemes never ask for UPI payments</li>
                                        <li>• If unsure, send ₹1 first to verify the receiver</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default UPIScanner;