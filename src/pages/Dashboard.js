import { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Legend,
    Tooltip,
    Filler
} from 'chart.js';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FiUsers, FiPieChart, FiDollarSign, FiMap, FiFileText } from 'react-icons/fi';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Legend,
    Tooltip,
    Filler
);

// Animation variants
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('monthly');
    const [animateIn, setAnimateIn] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await API.get('/statistics');
            setStats(res.data);
        } catch (err) {
            setError("Erreur lors du chargement des statistiques.");
        } finally {
            setLoading(false);
            setTimeout(() => setAnimateIn(true), 100);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const renderUserCards = () => {
        if (!stats) return null;

        const roleIcons = {
            admin: <FiUsers className="text-2xl" />,
            user: <FiUsers className="text-2xl" />,
            agent_foncier: <FiMap className="text-2xl" />,
            citoyen: <FiUsers className="text-2xl" />
        };

        const lastUserCount =
            stats.monthlyStats?.users && stats.monthlyStats.users.length > 0
                ? stats.monthlyStats.users[stats.monthlyStats.users.length - 1].count
                : 0;

        return (
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-6"
            >
                <motion.div
                    variants={item}
                    className="p-6 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ y: -5 }}
                >
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="text-sm font-medium opacity-80">Total Utilisateurs</div>
                            <div className="text-3xl font-bold mt-2">{stats.totals.users}</div>
                        </div>
                        <div className="p-3 bg-white bg-opacity-20 rounded-full">
                            <FiUsers className="text-2xl" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs font-medium opacity-80">
                        +{lastUserCount} ce mois
                    </div>
                </motion.div>

                {stats.roles?.map((r, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        className={`p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all duration-300 ${index % 3 === 0 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                            index % 3 === 1 ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                                'bg-gradient-to-r from-green-500 to-teal-500'
                            }`}
                        whileHover={{ y: -5 }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm font-medium opacity-80 capitalize">{r.role === "agent_foncier" ? "Agents Foncier" : r.role}s</div>
                                <div className="text-2xl font-bold mt-2">{r.count}</div>
                            </div>
                            <div className="p-3 bg-white bg-opacity-20 rounded-full">
                                {roleIcons[r.role] || <FiUsers className="text-2xl" />}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    const renderUserChart = () => {
        if (!stats) return null;
        const labels = stats.monthlyStats?.users && stats.monthlyStats.users.map((item) => item.month);
        const data = stats.monthlyStats?.users && stats.monthlyStats.users.map((item) => item.count);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-10 bg-white p-6 rounded-xl shadow-lg"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Inscriptions mensuelles</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('monthly')}
                            className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'monthly' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setActiveTab('yearly')}
                            className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'yearly' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
                        >
                            Annuel
                        </button>
                    </div>
                </div>
                <Line
                    data={{
                        labels,
                        datasets: [
                            {
                                label: 'Nouveaux utilisateurs',
                                data,
                                borderColor: 'rgba(99, 102, 241, 1)',
                                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                                borderWidth: 2,
                                tension: 0.4,
                                fill: true,
                                pointBackgroundColor: 'white',
                                pointBorderColor: 'rgba(99, 102, 241, 1)',
                                pointBorderWidth: 2,
                                pointRadius: 4,
                                pointHoverRadius: 6
                            }
                        ]
                    }}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    padding: 20
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                titleFont: { size: 14, weight: 'bold' },
                                bodyFont: { size: 12 },
                                padding: 12,
                                usePointStyle: true,
                                callbacks: {
                                    label: (context) => {
                                        return ` ${context.dataset.label}: ${context.raw}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    drawBorder: false,
                                    color: 'rgba(0,0,0,0.05)'
                                },
                                ticks: {
                                    stepSize: 1
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }}
                />
            </motion.div>
        );
    };

    const renderCards = () => {
        if (!stats) return null;

        const cardData = [
            {
                label: 'Parcelles',
                count: stats.totals.parcels,
                icon: <FiMap className="text-2xl" />,
                gradient: 'from-blue-500 to-cyan-500',
                change: stats.monthlyStats.parcels[stats.monthlyStats.parcels.length - 1]?.count || 0
            },
            {
                label: 'Titres',
                count: stats.totals.titles,
                icon: <FiFileText className="text-2xl" />,
                gradient: 'from-green-500 to-teal-500',
                change: stats.monthlyStats.titles[stats.monthlyStats.titles.length - 1]?.count || 0
            },
            {
                label: 'Transactions',
                count: stats.totals.transactions,
                icon: <FiDollarSign className="text-2xl" />,
                gradient: 'from-purple-500 to-pink-500',
                change: stats.monthlyStats.transactions[stats.monthlyStats.transactions.length - 1]?.count || 0
            },
            {
                label: 'Rapport',
                count: stats.totals.reports,
                icon: <FiFileText className="text-2xl" />,
                gradient: 'from-amber-500 to-orange-600',
                change: stats.monthlyStats.reports[stats.monthlyStats.reports.length - 1]?.count || 0
            }
        ];

        return (
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-4 gap-6 mt-6"
            >
                {cardData.map((item, index) => (
                    <motion.div
                        key={index}
                        variants={item}
                        className={`p-6 rounded-xl bg-gradient-to-r ${item.gradient} text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                        whileHover={{ y: -5 }}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="text-sm font-medium opacity-80">{item.label}</div>
                                <div className="text-3xl font-bold mt-2">{item.count}</div>
                            </div>
                            <div className="p-3 bg-white bg-opacity-20 rounded-full">
                                {item.icon}
                            </div>
                        </div>
                        <div className="mt-4 text-xs font-medium opacity-80">
                            +{item.change} ce mois
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        );
    };

    const renderChart = () => {
        if (!stats) return null;

        const allMonths = [
            ...new Set([
                ...stats.monthlyStats.parcels.map(s => s.month),
                ...stats.monthlyStats.titles.map(s => s.month),
                ...stats.monthlyStats.transactions.map(s => s.month),
            ]),
        ].sort();

        const formatData = (data) =>
            allMonths.map(month => data.find(d => d.month === month)?.count || 0);

        const chartData = {
            labels: allMonths,
            datasets: [
                {
                    label: 'Parcelles',
                    data: formatData(stats.monthlyStats.parcels),
                    borderColor: 'rgba(59, 130, 246, 1)',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Titres',
                    data: formatData(stats.monthlyStats.titles),
                    borderColor: 'rgba(16, 185, 129, 1)',
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Transactions',
                    data: formatData(stats.monthlyStats.transactions),
                    borderColor: 'rgba(139, 92, 246, 1)',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 bg-white p-6 rounded-xl shadow-lg"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Évolution mensuelle</h2>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('monthly')}
                            className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'monthly' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setActiveTab('yearly')}
                            className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'yearly' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500'}`}
                        >
                            Annuel
                        </button>
                    </div>
                </div>
                <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        interaction: {
                            mode: 'index',
                            intersect: false
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    usePointStyle: true,
                                    padding: 20
                                }
                            },
                            tooltip: {
                                backgroundColor: 'rgba(0,0,0,0.8)',
                                titleFont: { size: 14, weight: 'bold' },
                                bodyFont: { size: 12 },
                                padding: 12,
                                usePointStyle: true
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                grid: {
                                    drawBorder: false,
                                    color: 'rgba(0,0,0,0.05)'
                                }
                            },
                            x: {
                                grid: {
                                    display: false
                                }
                            }
                        }
                    }}
                />
            </motion.div>
        );
    };

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`bg-gradient-to-r from-blue-700 to-blue-900 rounded-xl shadow-lg p-6 flex justify-between items-center transition-all duration-700 transform ${animateIn ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
            >
                <div>
                    <h1 className="text-3xl font-bold text-white">Tableau de Bord</h1>
                    <p className="text-blue-100 mt-1">Aperçu et gestion de vos données foncières</p>
                </div>
                <div className="flex space-x-4 items-center">
                    <button
                        onClick={fetchStats}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-2 rounded-full transition-all duration-300"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div className="text-white hidden md:block">
                            <div className="font-medium">{user?.name}</div>
                            <div className="text-xs text-blue-100 capitalize">{user?.role === "agent_foncier" ? "Agent Foncier" : user?.role}</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {loading && (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="text-white mt-4">Chargement des statistiques...</p>
                    </div>
                </div>
            )}

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg"
                >
                    {error}
                </motion.p>
            )}

            {!loading && !error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {user?.role === 'admin' ? (
                        <>
                            {renderUserCards()}
                            {renderUserChart()}
                        </>
                    ) : (
                        <>
                            {renderCards()}
                            {renderChart()}
                        </>
                    )}
                </motion.div>
            )}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }} className={`mt-8 text-center text-white text-sm transition-all duration-700 transform translate-y-4 opacity-0`} style={{ transitionDelay: '400ms' }}>
                © 2025 Gestion Foncière. Tous droits réservés.
            </motion.p>
        </div>
    );
}