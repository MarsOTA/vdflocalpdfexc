import React, { useState, useRef, useEffect } from 'react';
import { OperationalEvent, EventStatus, PersonnelRequirement } from '../types';

interface TemplateCreatorProps {
  onSave: (event: OperationalEvent) => void;
  defaultDate: string;
}

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const MessageCircleWarningIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/><path d="M12 8v4"/><path d="M12 16h.01"/>
  </svg>
);

const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

const CustomCalendar: React.FC<{ selectedDate: string, minDate: string, onSelect: (date: string) => void }> = ({ selectedDate, minDate, onSelect }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate + 'T00:00:00' || new Date()));
  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: (firstDayOfMonth + 6) % 7 }, (_, i) => null);
  
  const isSelected = (day: number) => {
    const d = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d === selectedDate;
  };
  
  const isBeforeMin = (day: number) => {
    const d = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return d < minDate;
  };
  
  const monthNames = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
  
  return (
    <div className="p-3 w-64 bg-white border border-slate-200 shadow-2xl rounded-2xl animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={() => setViewDate(new Date(currentYear, currentMonth - 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronLeft /></button>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">{monthNames[currentMonth]} {currentYear}</span>
        <button type="button" onClick={() => setViewDate(new Date(currentYear, currentMonth + 1, 1))} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map(d => <span key={d} className="text-[8px] font-black text-slate-300 mb-1">{d}</span>)}
        {padding.map((_, i) => <div key={`p-${i}`} />)}
        {days.map(d => {
          const disabled = isBeforeMin(d);
          const localISO = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          return (
            <button key={d} type="button" disabled={disabled} onClick={() => onSelect(localISO)} className={`h-8 w-8 text-[10px] font-bold rounded-lg transition-all ${disabled ? 'text-slate-200 cursor-not-allowed' : isSelected(d) ? 'bg-[#720000] text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const TemplateCreator: React.FC<TemplateCreatorProps> = ({ onSave }) => {
  const currentYear = new Date().getFullYear();
  const today = new Date().toISOString().split('T')[0];
  const minDate = `${currentYear}-01-01`;
  
  const [formData, setFormData] = useState({
    code: '',
    location: '',
    date: today,
    start: '08:00',
    end: '16:00',
    isOlympic: false,
    vehicles: { APS: 0, AS: 0, ABP: 0 }
  });

  const [errors, setErrors] = useState<Record<string, boolean>>({ code: false, location: false, date: false });
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const [reqs, setReqs] = useState<{role: 'DIR' | 'CP' | 'VIG' | 'AUT' | 'ALTRO', qty: number}[]>([
    { role: 'DIR', qty: 1 },
    { role: 'CP', qty: 1 },
    { role: 'VIG', qty: 1 },
    { role: 'ALTRO', qty: 0 }
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) setShowCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: false }));
    if (globalError) setGlobalError(null);
  };

  const handleSave = () => {
    const newErrors = {
      code: !formData.code.trim(),
      location: !formData.location.trim(),
      date: !formData.date
    };
    if (newErrors.code || newErrors.location || newErrors.date) {
      setErrors(newErrors);
      setGlobalError("Compila tutti i campi obbligatori per salvare il servizio.");
      return;
    }
    if (new Date(formData.date + 'T00:00:00').getFullYear() < currentYear) {
      setErrors(prev => ({ ...prev, date: true }));
      setGlobalError("Non è possibile inserire un servizio per anni precedenti a quello corrente.");
      return;
    }
    const newEvent: OperationalEvent = {
      id: `EV-${Math.floor(Math.random() * 9000) + 1000}`,
      code: formData.code.toUpperCase(),
      location: formData.location.toUpperCase(),
      date: formData.date,
      timeWindow: `${formData.start} - ${formData.end}`,
      status: EventStatus.IN_COMPILAZIONE, 
      vehicles: formData.vehicles,
      isOlympic: formData.isOlympic,
      requirements: reqs.map(r => ({
        role: r.role,
        qty: r.qty,
        assignedIds: Array(r.qty).fill(null),
        entrustedGroups: Array(r.qty).fill(null)
      })) as PersonnelRequirement[]
    };
    onSave(newEvent);
  };

  const inputClass = (field: string, base: string) => {
    const isError = errors[field];
    return `${base} ${isError ? 'border-red-600 ring-2 ring-red-100 border-2 bg-red-50/5' : 'border-slate-200'} transition-all duration-200`;
  };

  const getRoleLabel = (role: string) => {
    switch(role) {
        case 'DIR': return 'Dirigente';
        case 'CP': return 'CAPO POSTAZIONE';
        case 'VIG': return 'Vigile del Fuoco';
        case 'AUT': return 'Autista';
        case 'ALTRO': return 'Altro';
        default: return role;
    }
  }

  return (
    <div className="p-3 md:p-4 lg:px-6 lg:py-4 max-w-[1500px] mx-auto space-y-3 animate-in fade-in duration-500 pb-16 h-full flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-200 pb-3 shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-none">Nuova Pianificazione</h1>
          <p className="text-slate-400 font-bold text-[8px] mt-1 uppercase tracking-widest leading-none">Compilazione assetti e logistica operativa</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
                <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Modello</span>
                <span className="text-[10px] font-mono font-bold text-slate-800">MOD-OP-25-P1</span>
            </div>
            <div className="w-10 h-10 bg-[#720000] rounded-xl flex items-center justify-center text-amber-400 font-black text-lg shadow-lg">V1</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1 overflow-visible">
        {/* Sinistra: Anagrafica */}
        <div className="lg:col-span-7 space-y-4">
          <div className="diamond-card p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-[10px]">1</div>
                <h3 className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Anagrafica Intervento</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">NOME DEL SERVIZIO <span className="text-red-500">*</span></label>
                <input type="text" value={formData.code} onChange={e => handleInputChange('code', e.target.value.toUpperCase())} placeholder="ES: VIGILANZA EVENTO SPORTIVO" className={inputClass('code', "w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-black uppercase placeholder:text-slate-200 focus:outline-none")} />
              </div>
              <div className="relative" ref={calendarRef}>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">DATA SERVIZIO <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setShowCalendar(!showCalendar)} className={inputClass('date', "w-full flex items-center gap-3 bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-black text-left uppercase transition-all")}>
                  <CalendarIcon className="text-blue-500 shrink-0" />
                  <span className={formData.date ? 'text-slate-800' : 'text-slate-300'}>
                    {formData.date ? new Date(formData.date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Seleziona data'}
                  </span>
                </button>
                {showCalendar && <div className="absolute top-full left-0 z-50 mt-1 shadow-2xl"><CustomCalendar selectedDate={formData.date} minDate={minDate} onSelect={(d) => { handleInputChange('date', d); setShowCalendar(false); }} /></div>}
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">TIPO VIGILANZA</label>
                <select value={formData.isOlympic ? 'olympiadi' : 'standard'} onChange={e => handleInputChange('isOlympic', e.target.value === 'olympiadi')} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-black uppercase shadow-sm focus:outline-none appearance-none cursor-pointer">
                  <option value="standard">Standard</option>
                  <option value="olympiadi">Olimpiadi</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">ORA INIZIO</label>
                  <input type="time" value={formData.start} onChange={e => handleInputChange('start', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold" />
                </div>
                <div>
                  <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">ORA FINE</label>
                  <input type="time" value={formData.end} onChange={e => handleInputChange('end', e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold" />
                </div>
              </div>
              <div>
                <label className="block text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">UBICAZIONE <span className="text-red-500">*</span></label>
                <input type="text" value={formData.location} onChange={e => handleInputChange('location', e.target.value.toUpperCase())} placeholder="LUOGO INTERVENTO" className={inputClass('location', "w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-xs font-bold uppercase shadow-sm focus:outline-none")} />
              </div>
            </div>
          </div>
        </div>

        {/* Destra: Logistica e Assetti */}
        <div className="lg:col-span-5 space-y-4">
          <div className="diamond-card p-5 bg-[#720000]/5 border border-[#720000]/10 rounded-[1.5rem] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-[#720000] flex items-center justify-center text-white font-black text-[10px]">2</div>
                <h3 className="text-[10px] font-black text-[#720000] tracking-widest uppercase">Assetto Automezzi</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['APS', 'AS', 'ABP'] as const).map(type => (
                <div key={type} className="flex flex-col">
                  <label className="block text-[7px] font-black text-slate-400 uppercase mb-1 tracking-widest text-center">{type}</label>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1.5 shadow-sm">
                    <button type="button" onClick={() => handleInputChange('vehicles', { ...formData.vehicles, [type]: Math.max(0, formData.vehicles[type] - 1) })} className="w-6 h-6 flex items-center justify-center bg-slate-100 rounded-lg font-black text-slate-600 text-[10px]">-</button>
                    <span className="flex-1 text-center font-mono font-black text-sm">{formData.vehicles[type]}</span>
                    <button type="button" onClick={() => handleInputChange('vehicles', { ...formData.vehicles, [type]: formData.vehicles[type] + 1 })} className="w-6 h-6 flex items-center justify-center bg-[#720000] text-white rounded-lg font-black text-[10px]">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="diamond-card p-5 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-black text-[10px]">3</div>
                <h3 className="text-[10px] font-black text-slate-700 tracking-widest uppercase">Assetto Personale</h3>
            </div>
            <div className="space-y-2">
              {reqs.map((r, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between shadow-sm">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    {getRoleLabel(r.role)}
                  </span>
                  <div className="flex items-center gap-3">
                      <button type="button" onClick={() => { const n = [...reqs]; n[i].qty = Math.max(0, n[i].qty - 1); setReqs(n); }} className="w-6 h-6 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-400 text-[10px]">-</button>
                      <span className="w-5 text-center font-mono font-black text-xs">{r.qty}</span>
                      <button type="button" onClick={() => { const n = [...reqs]; n[i].qty += 1; setReqs(n); }} className="w-6 h-6 flex items-center justify-center bg-[#720000] text-white rounded-lg text-[10px]">+</button>
                  </div>
                </div>
              ))}
              <div className="mt-2 text-center">
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Asset Totale: {reqs.reduce((a, b) => a + b.qty, 0)} Unità</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer ultra-compatto */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 sticky bottom-0 bg-[#f4f7f9] z-40 shrink-0">
        {globalError && (
          <div className="bg-red-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-4 animate-in slide-in-from-bottom-2 shadow-lg border border-red-700">
            <MessageCircleWarningIcon />
            <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-widest leading-none">Errore Validazione</span>
                <span className="text-[10px] font-medium tracking-tight opacity-95">{globalError}</span>
            </div>
            <button onClick={() => setGlobalError(null)} className="ml-auto text-white/50 hover:text-white transition-colors text-xl font-light leading-none">×</button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-end gap-3 items-center py-1">
            <div className="hidden lg:block text-slate-400 text-[8px] font-black uppercase tracking-[0.2em] mr-auto">
                PROTOCOLLO 2025 • MILANO OPERATIVA
            </div>
            <button type="button" onClick={() => window.history.back()} className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 text-[9px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                Annulla
            </button>
            <button type="button" onClick={handleSave} className="w-full sm:w-auto px-8 py-3 bg-[#720000] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-xl transition-all hover:bg-slate-900 active:scale-95 shadow-red-200">
                Pubblica Servizio
            </button>
        </div>
      </div>
    </div>
  );
};