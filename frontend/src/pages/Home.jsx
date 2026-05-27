import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-6xl mx-auto px-6 py-20 text-center">
                <div className="text-6xl mb-6">🛡️</div>
                <h1 className="text-5xl font-bold mb-6 text-blue-400">
                    UPI Fraud Detection System
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    AI-powered fraud detection using XGBoost ML model.
                    Detect fraudulent UPI transactions instantly with 97% accuracy.
                </p>
                <div className="flex gap-4 justify-center mb-16">
                    <Link to="/register"
                        className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl text-lg font-semibold transition">
                        Get Started
                    </Link>
                    <Link to="/login"
                        className="border border-blue-600 hover:bg-blue-600 px-8 py-4 rounded-xl text-lg font-semibold transition">
                        Login
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                    {[
                        { icon: '🤖', title: 'AI-Powered', desc: 'XGBoost ML model with 97% accuracy' },
                        { icon: '⚡', title: 'Real-time Detection', desc: 'Instant fraud probability scoring' },
                        { icon: '🚨', title: 'Smart Alerts', desc: 'Recovery steps and 1930 helpline' }
                    ].map((f, i) => (
                        <div key={i} className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                            <div className="text-4xl mb-4">{f.icon}</div>
                            <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                            <p className="text-gray-400">{f.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
                    {[
                        { val: '97.04%', label: 'Accuracy' },
                        { val: '0.9591', label: 'ROC-AUC' },
                        { val: '91.02%', label: 'F1 Score' },
                        { val: '26,393', label: 'Transactions Analyzed' }
                    ].map((s, i) => (
                        <div key={i} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                            <div className="text-3xl font-bold text-blue-400">{s.val}</div>
                            <div className="text-gray-400 mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;