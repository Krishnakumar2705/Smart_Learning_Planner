import React from 'react';
import useStore from '../store/useStore';
import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend
} from 'recharts';

const Analytics = () => {
  const { analytics, planner, recommendations } = useStore();

  const downloadPDFReport = () => {
    if (!planner || !analytics) return;
    
    const doc = new jsPDF();
    
    doc.setFillColor(14, 17, 29);
    doc.rect(0, 0, 210, 297, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241);
    doc.text('Smart Learning Planner', 20, 25);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(156, 163, 175);
    doc.text('Your AI-Aggregated Study Analytics & Status Report', 20, 32);
    
    doc.setDrawColor(255, 255, 255, 0.1);
    doc.line(20, 38, 190, 38);
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Planner Strategy:', 20, 48);
    
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);
    doc.text(`- Target Goal: ${planner.goal}`, 20, 56);
    doc.text(`- Exam Date: ${new Date(planner.examDate).toLocaleDateString()}`, 20, 63);
    doc.text(`- Daily Study Target: ${planner.dailyHours} Hours`, 20, 70);
    doc.text(`- Preparation Status: ${planner.prepLevel}`, 20, 77);
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Weekly Aggregated Metrics:', 20, 90);
    
    doc.setFontSize(11);
    doc.setTextColor(226, 232, 240);
    doc.text(`- Syllabus Topics Completed: ${analytics.completedTopics} / ${analytics.totalTopics} (${analytics.overallCompletionPercent}%)`, 20, 98);
    doc.text(`- Cumulative Focus Hours Studied: ${analytics.totalHoursStudied} Hours`, 20, 105);
    doc.text(`- Average Daily Practice Time: ${analytics.averageDailyStudy} Hours`, 20, 112);
    doc.text(`- Active Study Streak: ${analytics.currentStreak} Days`, 20, 119);
    doc.text(`- Primary Strongest Subject: ${analytics.strongestSubject}`, 20, 126);
    doc.text(`- Needs Attention Subject: ${analytics.weakestSubject}`, 20, 133);
    
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text('Subject Syllabus Breakdown:', 20, 148);
    
    let yPos = 158;
    doc.setFillColor(31, 41, 55);
    doc.rect(20, yPos, 170, 8, 'F');
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Subject', 25, yPos + 6);
    doc.text('Completed Topics', 75, yPos + 6);
    doc.text('Total Hours Studied', 125, yPos + 6);
    doc.text('Completion Rate', 165, yPos + 6);
    
    yPos += 8;
    doc.setFont('Helvetica', 'normal');
    analytics.subjectMetrics.forEach(sm => {
      doc.setFillColor(17, 24, 39);
      doc.rect(20, yPos, 170, 8, 'F');
      doc.setTextColor(226, 232, 240);
      doc.text(String(sm.subject), 25, yPos + 6);
      doc.text(`${sm.completedTopics} / ${sm.totalTopics}`, 75, yPos + 6);
      doc.text(`${sm.hoursStudied} hrs`, 125, yPos + 6);
      doc.text(`${sm.completionPercent}%`, 165, yPos + 6);
      yPos += 8;
    });

    if (recommendations && recommendations.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text('AI Recommendation Reports:', 20, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175);
      recommendations.slice(0, 3).forEach(rec => {
        doc.text(`* ${rec.text}`, 20, yPos, { maxWidth: 170 });
        yPos += 12;
      });
    }
    
    doc.save('smart_learning_planner_report.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0d0f19]/60 backdrop-blur-sm p-4 rounded-xl border border-slate-200 dark:border-white/10">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Aggregated Placement Analytics</h3>
          <p className="text-xs text-slate-500 dark:text-gray-400">Download formatted files to showcase in placement portfolios.</p>
        </div>
        
        <button
          onClick={downloadPDFReport}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-slate-900 dark:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Strategy Report</span>
        </button>
      </div>

      {analytics ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Study Hours Log Trend (7-Day Curve)</h4>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.studyHoursTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Legend fontSize={10} />
                  <Area type="monotone" name="Logged Hours" dataKey="hours" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#hoursGrad)" />
                  <Area type="monotone" name="Daily Target" dataKey="targetHours" stroke="rgba(255,255,255,0.2)" strokeDasharray="5 5" fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Subject Syllabus Completeness (%)</h4>
            
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subjectMetrics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="subject" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#0d0f19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                  <Bar name="Completion Rate (%)" dataKey="completionPercent" radius={[4, 4, 0, 0]}>
                    {analytics.subjectMetrics.map((entry, index) => {
                      const colors = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
                      return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-xs text-slate-400 dark:text-gray-500 italic py-12">No analytics aggregations cached.</p>
      )}
    </div>
  );
};

export default Analytics;
