import React, { useState } from 'react';
import { Activity, TrendingUp, Calendar, Target, Flame, Timer, Dumbbell, Bike } from 'lucide-react';

interface WorkoutSession {
  id: string;
  date: string;
  type: 'treadmill' | 'rowing' | 'weights' | 'cycling';
  duration: number; // minutes
  calories: number;
  distance?: number; // km for cardio
  notes: string;
}

interface FitnessGoal {
  id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
}

const mockWorkouts: WorkoutSession[] = [
  { id: '1', date: '2025-02-20', type: 'treadmill', duration: 30, calories: 280, distance: 3.2, notes: 'Morning run' },
  { id: '2', date: '2025-02-19', type: 'rowing', duration: 20, calories: 180, distance: 2.5, notes: 'Interval training' },
  { id: '3', date: '2025-02-18', type: 'weights', duration: 45, calories: 150, notes: 'Upper body focus' },
];

const mockGoals: FitnessGoal[] = [
  { id: '1', name: 'Weekly Cardio', target: 150, current: 110, unit: 'minutes', deadline: '2025-02-23' },
  { id: '2', name: 'Monthly Distance', target: 50, current: 32, unit: 'km', deadline: '2025-02-28' },
  { id: '3', name: 'Calories Burned', target: 2000, current: 1450, unit: 'kcal', deadline: '2025-02-23' },
];

const typeIcons: Record<string, React.ReactNode> = {
  treadmill: <Activity className="w-5 h-5" />,
  rowing: <Timer className="w-5 h-5" />,
  weights: <Dumbbell className="w-5 h-5" />,
  cycling: <Bike className="w-5 h-5" />,
};

const typeColors: Record<string, string> = {
  treadmill: 'text-green-400 bg-green-400/10',
  rowing: 'text-blue-400 bg-blue-400/10',
  weights: 'text-orange-400 bg-orange-400/10',
  cycling: 'text-purple-400 bg-purple-400/10',
};

export const FitnessTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'log' | 'goals' | 'stats'>('log');
  const [selectedType, setSelectedType] = useState<string | 'all'>('all');

  const filteredWorkouts = selectedType === 'all' 
    ? mockWorkouts 
    : mockWorkouts.filter(w => w.type === selectedType);

  const totalWorkouts = mockWorkouts.length;
  const totalDuration = mockWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const totalCalories = mockWorkouts.reduce((sum, w) => sum + w.calories, 0);
  const currentStreak = 3; // Mock streak

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white font-display">Fitness Tracker</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-cosmic-cyan/10 rounded-full">
          <Flame className="w-4 h-4 text-cosmic-cyan" />
          <span className="text-sm text-cosmic-cyan">{currentStreak} day streak</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-cosmic-panel/50 rounded-xl p-4 border border-cosmic-purple/20">
          <p className="text-xs text-gray-400 mb-1">Workouts</p>
          <p className="text-2xl font-bold text-white">{totalWorkouts}</p>
        </div>
        <div className="bg-cosmic-panel/50 rounded-xl p-4 border border-cosmic-blue/20">
          <p className="text-xs text-gray-400 mb-1">Duration</p>
          <p className="text-2xl font-bold text-white">{totalDuration}m</p>
        </div>
        <div className="bg-cosmic-panel/50 rounded-xl p-4 border border-cosmic-pink/20">
          <p className="text-xs text-gray-400 mb-1">Calories</p>
          <p className="text-2xl font-bold text-white">{totalCalories}</p>
        </div>
        <div className="bg-cosmic-panel/50 rounded-xl p-4 border border-cosmic-cyan/20">
          <p className="text-xs text-gray-400 mb-1">Streak</p>
          <p className="text-2xl font-bold text-cosmic-cyan">{currentStreak}d</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(['log', 'goals', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
              activeTab === tab 
                ? 'bg-cosmic-purple text-white' 
                : 'bg-cosmic-panel/50 text-gray-400 hover:bg-cosmic-panel'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Workout Log */}
      {activeTab === 'log' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
                selectedType === 'all' 
                  ? 'bg-cosmic-purple text-white' 
                  : 'bg-cosmic-panel/50 text-gray-400'
              }`}
            >
              All Types
            </button>
            {Object.keys(typeIcons).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all ${
                  selectedType === type 
                    ? typeColors[type] 
                    : 'bg-cosmic-panel/50 text-gray-400'
                }`}
              >
                {typeIcons[type]}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>

          {/* Workout List */}
          <div className="space-y-3">
            {filteredWorkouts.map((workout) => (
              <div 
                key={workout.id}
                className="bg-cosmic-panel/30 rounded-xl p-4 border border-cosmic-purple/10 hover:border-cosmic-purple/30 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[workout.type]}`}>
                      {typeIcons[workout.type]}
                    </div>
                    <div>
                      <p className="font-medium text-white capitalize">{workout.type}</p>
                      <p className="text-xs text-gray-400">{workout.notes}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(workout.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-6 mt-3 ml-13">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Timer className="w-4 h-4 text-cosmic-cyan" />
                    <span className="text-gray-300">{workout.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-gray-300">{workout.calories} kcal</span>
                  </div>
                  {workout.distance && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{workout.distance} km</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredWorkouts.length === 0 && (
              <p className="text-center text-gray-500 py-8">No workouts found</p>
            )}
          </div>
        </div>
      )}

      {/* Goals */}
      {activeTab === 'goals' && (
        <div className="space-y-4">
          {mockGoals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            return (
              <div key={goal.id} className="bg-cosmic-panel/30 rounded-xl p-4 border border-cosmic-purple/10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-cosmic-cyan" />
                    <span className="font-medium text-white">{goal.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    Due {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-400">{goal.current} / {goal.target} {goal.unit}</span>
                  <span className={`font-medium ${progress >= 100 ? 'text-green-400' : 'text-cosmic-cyan'}`}>
                    {Math.round(progress)}%
                  </span>
                </div>
                <div className="w-full bg-cosmic-dark/50 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      progress >= 100 ? 'bg-green-400' : 'bg-cosmic-cyan'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats View */}
      {activeTab === 'stats' && (
        <div className="bg-cosmic-panel/30 rounded-xl p-6 border border-cosmic-purple/10">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Overview</h3>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="text-center">
                <div 
                  className={`h-20 rounded-lg flex items-end justify-center p-1 ${
                    i < 3 ? 'bg-cosmic-purple/40' : 'bg-cosmic-panel/50'
                  }`}
                >
                  <div 
                    className="w-full bg-cosmic-cyan rounded"
                    style={{ height: i < 3 ? `${(i + 1) * 30}%` : '0%' }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">{day}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-cosmic-dark/30 rounded-lg">
              <p className="text-2xl font-bold text-white">4.2</p>
              <p className="text-xs text-gray-400">Avg workouts/week</p>
            </div>
            <div className="text-center p-4 bg-cosmic-dark/30 rounded-lg">
              <p className="text-2xl font-bold text-white">32m</p>
              <p className="text-xs text-gray-400">Avg duration</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
