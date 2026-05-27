import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-blue-400">👤 Profile</h1>
                <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                    <div className="flex items-center gap-6 mb-8">
                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-bold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{user?.name}</h2>
                            <p className="text-gray-400">{user?.email}</p>
                            <span className={`mt-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                user?.role === 'admin' ? 'bg-red-900 text-red-300' : 'bg-blue-900 text-blue-300'
                            }`}>
                                {user?.role?.toUpperCase()}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: 'Full Name', value: user?.name },
                            { label: 'Email Address', value: user?.email },
                            { label: 'Account Role', value: user?.role },
                            { label: 'User ID', value: user?._id }
                        ].map((f, i) => (
                            <div key={i} className="flex justify-between py-3 border-b border-gray-800">
                                <span className="text-gray-400">{f.label}</span>
                                <span className="font-medium">{f.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;