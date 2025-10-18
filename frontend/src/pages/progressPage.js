
import { useEffect, useRef, useState } from "react";
import { useWorkoutsContext } from "../hooks/useWorkoutsContext";
import { useAuthStore } from "../hooks/useAuth";
import UserNavbar from "../components/UserNavbar";
import Chart from "chart.js/auto";
import { Dumbbell, Clock, TrendingUp } from "lucide-react";
import { FaChartLine } from "react-icons/fa";

const ProgressPage = () => {
    const { workouts, dispatch } = useWorkoutsContext();
    const { user } = useAuthStore();
    const chartRef = useRef(null);
    const [chartInstance, setChartInstance] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchWorkouts = async () => {
        if (!user?.token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/workouts", {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            const json = await response.json();
            if (response.ok) {
                dispatch({ type: "SET_WORKOUTS", payload: json });
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Error fetching workouts:", error);
            setIsLoading(false);
        }
    };

    const processData = () => {
        if (!workouts || workouts.length === 0) {
            return { labels: [], data: [] };
        }

        const workoutCounts = {};
        workouts.forEach((workout) => {
            const date = new Date(workout.createdAt);
            const hour = date.getHours();
            workoutCounts[hour] = (workoutCounts[hour] || 0) + 1;
        });

        const labels = Array.from({ length: 24 }, (_, index) => `${index}:00`);
        const data = labels.map((label, index) => workoutCounts[index] || 0);

        return { labels, data };
    };

    useEffect(() => {
        if (!chartRef.current || !workouts || workouts.length === 0) return;

        if (chartInstance) {
            chartInstance.destroy();
        }

        const { labels, data } = processData();

        const ctx = chartRef.current.getContext("2d");
        ctx.clearRect(0, 0, chartRef.current.width, chartRef.current.height);

        const gradientBg = ctx.createLinearGradient(0, 0, 0, 400);
        gradientBg.addColorStop(0, 'rgba(79, 209, 197, 0.7)');
        gradientBg.addColorStop(1, 'rgba(79, 209, 197, 0.2)');

        const newChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Workouts Per Hour",
                    data,
                    backgroundColor: gradientBg,
                    borderColor: '#4FD1C5',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#4FD1C5',
                    pointBorderColor: 'white',
                    pointHoverBackgroundColor: 'white',
                    pointHoverBorderColor: '#4FD1C5',
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    title: {
                        display: true,
                        text: "Workout Activity Over the Day",
                        font: { size: 18 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.05)',
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                        }
                    }
                }
            },
        });

        setChartInstance(newChart);

        return () => {
            if (newChart) {
                newChart.destroy();
            }
        };
    }, [workouts]);

    useEffect(() => {
        fetchWorkouts();
    }, [user?.token]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-pulse w-16 h-16 bg-teal-500 rounded-full"></div>
            </div>
        );
    }

    const totalWorkouts = workouts?.length || 0;
    const averagePerDay = totalWorkouts > 0 
    ? (totalWorkouts / 24).toFixed(1) 
    : '0';

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-1">
                <div className="w-64 bg-white/10 backdrop-blur-lg shadow-lg fixed left-0 h-full p-6">
                    <UserNavbar />
                </div>

                <div className="w-full sm:ml-64 p-4 sm:p-8">
                    <h1 className="text-3xl font-bold text-teal-900 mb-6 flex items-center">
                        <FaChartLine className="mr-2 text-teal-600" size={30} />
                        Workout Progress
                    </h1>

                    <div className="max-w-6xl mx-auto space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex items-center">
                                <Clock className="text-teal-600 mr-4" size={36} />
                                <div>
                                    <p className="text-gray-600">Total Workouts</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-teal-900">{totalWorkouts}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg flex items-center">
                                <TrendingUp className="text-teal-600 mr-4" size={36} />
                                <div>
                                    <p className="text-gray-600">Avg per Hour</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-teal-900">{averagePerDay}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg h-[300px] sm:h-[500px]">
                            <canvas ref={chartRef}></canvas>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage;