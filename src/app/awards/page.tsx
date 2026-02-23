'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Award, Trophy, Star, ChevronRight, Users, TrendingUp, Gift, Crown, Target, Zap, Shield, Gem } from 'lucide-react';

interface RankConfig {
    rank: string;
    level: number;
    minReferrals: number;
    reward: string | null;
    requiresDownlineRank: string | null;
}

interface Reward {
    rank: string;
    reward: string;
    status: string;
    createdAt: string;
}

const RANK_ICONS: Record<string, React.ReactNode> = {
    'Customer': <Users className="w-5 h-5" />,
    'Promoter': <TrendingUp className="w-5 h-5" />,
    'Partner': <Star className="w-5 h-5" />,
    'Distributor': <Zap className="w-5 h-5" />,
    'Prime Distributor': <Shield className="w-5 h-5" />,
    'Director': <Crown className="w-5 h-5" />,
    'Prime Director': <Trophy className="w-5 h-5" />,
    'Advisor': <Gem className="w-5 h-5" />,
    'Prime Advisor': <Award className="w-5 h-5" />,
    'Executive': <Crown className="w-5 h-5" />,
};

const RANK_COLORS: Record<string, string> = {
    'Customer': 'from-gray-400 to-gray-500',
    'Promoter': 'from-blue-400 to-blue-600',
    'Partner': 'from-indigo-400 to-indigo-600',
    'Distributor': 'from-purple-400 to-purple-600',
    'Prime Distributor': 'from-pink-400 to-pink-600',
    'Director': 'from-orange-400 to-orange-600',
    'Prime Director': 'from-red-400 to-red-600',
    'Advisor': 'from-emerald-400 to-emerald-600',
    'Prime Advisor': 'from-teal-400 to-teal-600',
    'Executive': 'from-yellow-400 to-yellow-600',
};

export default function AwardsPage() {
    const { isLoggedIn, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentRank, setCurrentRank] = useState('Customer');
    const [currentLevel, setCurrentLevel] = useState(0);
    const [directReferrals, setDirectReferrals] = useState(0);
    const [nextRank, setNextRank] = useState<string | null>(null);
    const [nextRankProgress, setNextRankProgress] = useState(0);
    const [nextRankTarget, setNextRankTarget] = useState('');
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [ranksConfig, setRanksConfig] = useState<RankConfig[]>([]);
    const [totalTeamSize, setTotalTeamSize] = useState(0);

    useEffect(() => {
        if (!authLoading && !isLoggedIn) { router.push('/login'); return; }
        if (user?.id) fetchAwardsData();
    }, [isLoggedIn, authLoading, user]);

    const fetchAwardsData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/awards?userId=${user?.id}`);
            const data = await res.json();
            if (data.success) {
                const d = data.data;
                setCurrentRank(d.currentRank);
                setCurrentLevel(d.currentLevel);
                setDirectReferrals(d.directPrimeReferrals);
                setNextRank(d.nextRank);
                setNextRankProgress(d.nextRankProgress);
                setNextRankTarget(d.nextRankTarget);
                setRewards(d.rewards);
                setRanksConfig(d.ranksConfig);
                setTotalTeamSize(d.totalTeamSize);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
            {/* Hero */}
            <div className={`bg-gradient-to-r ${RANK_COLORS[currentRank] || 'from-gray-400 to-gray-600'} text-white`}>
                <div className="max-w-6xl mx-auto px-4 py-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Award className="w-8 h-8" />
                        <h1 className="text-3xl font-black">Awards & Rewards</h1>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                {RANK_ICONS[currentRank] || <Star className="w-8 h-8" />}
                            </div>
                            <div>
                                <p className="text-white/70 text-sm">Your Current Rank</p>
                                <p className="text-3xl font-black">{currentRank}</p>
                                <p className="text-white/80 text-sm">Level {currentLevel}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mt-6">
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-white/60 text-xs">Direct Referrals</p>
                                <p className="text-xl font-black">{directReferrals}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-white/60 text-xs">Team Size</p>
                                <p className="text-xl font-black">{totalTeamSize}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-3 text-center">
                                <p className="text-white/60 text-xs">Rewards Earned</p>
                                <p className="text-xl font-black">{rewards.filter(r => r.status === 'DISTRIBUTED').length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
                {/* Next Rank Progress */}
                {nextRank && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-500" />
                                Progress to {nextRank}
                            </h3>
                            <span className="text-sm text-purple-600 font-bold">{Math.round(nextRankProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                            <div className={`bg-gradient-to-r ${RANK_COLORS[nextRank] || 'from-purple-400 to-purple-600'} h-4 rounded-full transition-all duration-500`}
                                style={{ width: `${nextRankProgress}%` }} />
                        </div>
                        <p className="text-sm text-gray-500">{nextRankTarget}</p>
                    </div>
                )}

                {/* Rewards */}
                {rewards.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-yellow-500" />
                            Your Rewards
                        </h3>
                        <div className="space-y-3">
                            {rewards.map((r, i) => (
                                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 bg-gradient-to-br ${RANK_COLORS[r.rank] || 'from-gray-400 to-gray-600'} rounded-full flex items-center justify-center text-white`}>
                                            {RANK_ICONS[r.rank]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">{r.reward}</p>
                                            <p className="text-xs text-gray-500">{r.rank} Reward • {new Date(r.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${r.status === 'DISTRIBUTED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {r.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Rank Hierarchy */}
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                        <Crown className="w-5 h-5 text-orange-500" />
                        Rank Hierarchy
                    </h3>
                    <div className="space-y-1">
                        {ranksConfig.map((rank, i) => {
                            const isActive = rank.rank === currentRank;
                            const isAchieved = rank.level <= currentLevel;
                            return (
                                <div key={i} className={`flex items-center gap-4 p-4 rounded-xl transition-all
                                    ${isActive ? 'bg-gradient-to-r ' + (RANK_COLORS[rank.rank] || 'from-gray-400 to-gray-600') + ' text-white shadow-lg scale-[1.02]' :
                                        isAchieved ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-white/20' : isAchieved ? 'bg-green-100' : 'bg-gray-200'}`}>
                                        {RANK_ICONS[rank.rank] || <Star className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`font-bold text-sm ${isActive ? 'text-white' : isAchieved ? 'text-green-700' : 'text-gray-700'}`}>
                                            Level {rank.level} — {rank.rank}
                                        </p>
                                        <p className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                            {rank.requiresDownlineRank
                                                ? `${rank.minReferrals} ${rank.requiresDownlineRank}s in downline`
                                                : rank.level > 0 ? `${rank.minReferrals} direct Prime referrals` : 'Starting rank'}
                                        </p>
                                    </div>
                                    {rank.reward && (
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${isActive ? 'bg-white/20 text-white' : isAchieved ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                            🎁 {rank.reward}
                                        </span>
                                    )}
                                    {isAchieved && !isActive && <span className="text-green-600 text-xs font-bold">✓</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
