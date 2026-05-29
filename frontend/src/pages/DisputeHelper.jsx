import { useState } from 'react';

const steps = {
    pending: [
        { icon: '⏳', title: 'Wait 48 Hours', desc: 'Most pending transactions auto-reverse within 48 hours. Check your bank app for status.' },
        { icon: '📱', title: 'Check UPI App', desc: 'Open your UPI app (GPay/PhonePe/Paytm) → Transaction History → Check status of the payment.' },
        { icon: '📋', title: 'Note UTR Number', desc: 'Find and note the UTR/Reference number from the transaction. You will need this for all complaints.' },
        { icon: '🏦', title: 'Contact Your Bank', desc: 'Call your bank helpline with the UTR number. Ask them to check if money is stuck in transit.' },
    ],
    failed: [
        { icon: '📋', title: 'Collect Evidence', desc: 'Take screenshot of the failed transaction showing UTR number, amount, date, and receiver UPI ID.' },
        { icon: '📱', title: 'Raise In-App Complaint', desc: 'Go to your UPI app → Transaction → Report Issue → Money Deducted but not credited.' },
        { icon: '🏦', title: 'Contact Bank (24-48 hrs)', desc: 'If no resolution, call your bank helpline. They must resolve within 5 business days as per RBI rules.' },
        { icon: '💻', title: 'NPCI Complaint Portal', desc: 'Visit npci.org.in → Dispute Redressal → File complaint with UTR number.' },
        { icon: '📞', title: 'Call 1800-120-1740', desc: 'NPCI helpline for UPI transaction disputes. Available Monday-Saturday 9AM-6PM.' },
        { icon: '⚖️', title: 'Banking Ombudsman', desc: 'If bank doesn\'t resolve in 30 days, escalate to RBI Banking Ombudsman at bankingombudsman.rbi.org.in' },
    ],
    fraud: [
        { icon: '🚨', title: 'Call 1930 Immediately', desc: 'Call National Cybercrime Helpline 1930 within the first hour. Early reporting increases recovery chances.' },
        { icon: '🔒', title: 'Block Your Account', desc: 'Immediately block your bank account and UPI ID via net banking or bank helpline to prevent further loss.' },
        { icon: '💻', title: 'File at cybercrime.gov.in', desc: 'Register complaint at cybercrime.gov.in with all transaction details, screenshots, and fraudster UPI ID.' },
        { icon: '🏦', title: 'Bank Fraud Department', desc: 'Visit your bank branch with written complaint. Ask them to flag the transaction as fraudulent.' },
        { icon: '🚔', title: 'File Police FIR', desc: 'Visit nearest police station and file FIR under IT Act Section 66C and 66D.' },
        { icon: '📰', title: 'Keep All Evidence', desc: 'Save all SMS, screenshots, chat history, and transaction records. Do not delete anything.' },
    ]
};

const DisputeHelper = () => {
    const [selected, setSelected] = useState(null);

    const options = [
        {
            id: 'pending',
            icon: '⏳',
            title: 'Money Deducted, Not Received',
            desc: 'Transaction shows pending or money cut but receiver didn\'t get it',
            color: 'border-yellow-600 hover:bg-yellow-900'
        },
        {
            id: 'failed',
            icon: '❌',
            title: 'Transaction Failed But Money Cut',
            desc: 'UPI showed failed/error but amount was deducted from account',
            color: 'border-red-600 hover:bg-red-900'
        },
        {
            id: 'fraud',
            icon: '🚨',
            title: 'I Was Scammed / Fraud Happened',
            desc: 'I was tricked into sending money or someone accessed my account',
            color: 'border-red-800 hover:bg-red-950'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-2 text-blue-400">
                    🆘 Transaction Dispute Helper
                </h1>
                <p className="text-gray-400 mb-8">
                    Select your problem and get step-by-step help
                </p>

                <div className="bg-red-900 border border-red-700 rounded-2xl p-4 mb-8 flex gap-4 items-center">
                    <div className="text-3xl">📞</div>
                    <div>
                        <div className="font-bold">Emergency Helplines</div>
                        <div className="text-sm text-red-200">
                            Cybercrime: <strong>1930</strong> &nbsp;|&nbsp;
                            NPCI: <strong>1800-120-1740</strong> &nbsp;|&nbsp;
                            RBI: <strong>14448</strong>
                        </div>
                    </div>
                </div>

                {!selected ? (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">What happened?</h2>
                        {options.map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => setSelected(opt.id)}
                                className={`w-full text-left bg-gray-900 rounded-2xl p-6 border-2 ${opt.color} transition`}
                            >
                                <div className="flex gap-4 items-start">
                                    <div className="text-4xl">{opt.icon}</div>
                                    <div>
                                        <div className="font-bold text-lg mb-1">{opt.title}</div>
                                        <div className="text-gray-400 text-sm">{opt.desc}</div>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div>
                        <button
                            onClick={() => setSelected(null)}
                            className="mb-6 text-blue-400 hover:text-blue-300 flex items-center gap-2"
                        >
                            ← Back to options
                        </button>

                        <h2 className="text-2xl font-bold mb-6">
                            {options.find(o => o.id === selected)?.title}
                        </h2>

                        <div className="space-y-4">
                            {steps[selected].map((step, i) => (
                                <div key={i} className="bg-gray-900 rounded-2xl p-6 border border-gray-800 flex gap-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center font-bold text-blue-300">
                                            {i + 1}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xl mr-2 inline">{step.icon}</div>
                                        <span className="font-semibold">{step.title}</span>
                                        <p className="text-gray-400 text-sm mt-1">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 bg-blue-900 border border-blue-700 rounded-2xl p-6">
                            <h3 className="font-bold mb-2">📋 What to keep ready:</h3>
                            <ul className="text-sm text-blue-200 space-y-1">
                                <li>• UTR / Transaction Reference Number</li>
                                <li>• Screenshot of the transaction</li>
                                <li>• Receiver's UPI ID</li>
                                <li>• Date, time and exact amount</li>
                                <li>• Your bank account number</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DisputeHelper;