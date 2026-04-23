import React from 'react';
import { HeartHandshake, CreditCard, ShieldCheck } from 'lucide-react';
import { DonationInfo } from '../types';

interface DonationPageProps {
  donation: DonationInfo;
}

const DonationPage: React.FC<DonationPageProps> = ({ donation }) => {
  return (
    <div className="py-24 bg-white min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <div className="inline-flex p-6 bg-emerald-600 text-white rounded-[2.5rem] mb-12 shadow-2xl shadow-emerald-200">
          <HeartHandshake size={64} />
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 tracking-tighter leading-none">Welfare Fund</h1>
        <p className="text-slate-500 text-xl mb-20 max-w-2xl mx-auto font-bold leading-relaxed">
          {donation.message}
        </p>

        {/* Progress Section */}
        <div className="mb-20 bg-slate-50 p-8 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-end mb-6">
            <div className="text-left">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] block mb-2">Fund Progress</span>
              <h4 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter">
                ৳{donation.current.toLocaleString()} <span className="text-slate-300 text-xl md:text-2xl font-bold">/ ৳{donation.target.toLocaleString()}</span>
              </h4>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600">{Math.round((donation.current / donation.target) * 100)}%</span>
            </div>
          </div>
          <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-600 rounded-full shadow-lg shadow-emerald-200 transition-all duration-1000"
              style={{ width: `${Math.min(100, (donation.current / donation.target) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20">
          <PaymentCard label="bKash" number={donation.bkash} color="bg-slate-900" textColor="text-emerald-500" />
          <PaymentCard label="Nagad" number={donation.nagad} color="bg-emerald-600" textColor="text-white" />
        </div>

        <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-center">
          <div className="flex items-center gap-4 text-emerald-600 font-black uppercase tracking-widest text-sm">
            <ShieldCheck size={32} />
            <span>Audit Transparent</span>
          </div>
          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
          <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em]">Professional Ledger Maintenance</p>
        </div>
      </div>
    </div>
  );
};

const PaymentCard: React.FC<{ label: string, number: string, color: string, textColor: string }> = ({ label, number, color, textColor }) => (
  <div className="bg-white p-8 md:p-12 rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-100 transition-all hover:-translate-y-3 hover:shadow-emerald-600/10">
    <div className={`w-12 h-12 md:w-16 md:h-16 ${color} ${textColor} rounded-2xl mb-6 md:mb-8 mx-auto flex items-center justify-center shadow-xl`}>
      <CreditCard size={28} />
    </div>
    <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tighter">{label}</h3>
    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-dashed border-emerald-600/10">
      <span className="text-xl md:text-3xl font-mono font-black text-slate-900 tracking-[0.1em] md:tracking-[0.2em]">{number}</span>
    </div>
    <p className="mt-6 text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] md:tracking-[0.5em]">Personal Merchant Account</p>
  </div>
);

export default DonationPage;