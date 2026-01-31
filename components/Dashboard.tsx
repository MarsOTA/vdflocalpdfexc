import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MOCK_OPERATORS, ALL_SPECIALIZATIONS, ALL_SEDI, ALL_PATENTI } from '../constants';
import { OperationalEvent, EventStatus, UserRole, Operator, PersonnelRequirement } from '../types';
import { getMainDayCode, getPriorityChain, selectableForVigilanza } from '../utils/turnarioLogic';
import ExcelJS from 'exceljs/dist/exceljs.min.js';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Icone file-type (più compatte in barra azioni)
import excelFileIcon from '../assets/icons/excel-file-type-svgrepo-com.svg';
import pdfFileIcon from '../assets/icons/file-pdf-svgrepo-com.svg';

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
  </svg>
);

const UserPlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" x2="19" y1="8" y2="14" />
    <line x1="22" x2="16" y1="11" y2="11" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6m4-11v6" />
  </svg>
);

const PanelBottomOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 15h18"/><path d="m9 10 3-3 3 3"/>
  </svg>
);

const PanelTopOpenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="m15 14-3 3-3-3"/>
  </svg>
);

const ZoomIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/><line x1="11" x2="11" y1="8" y2="14"/><line x1="8" x2="14" y1="11" y2="11"/>
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const PdfIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" x2="8" y1="13" y2="13"></line>
    <line x1="16" x2="8" y1="17" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const FileSpreadsheetIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
    <polyline points="14 2 14 8 20 8"/>
    <path d="M8 13h2"/>
    <path d="M8 17h2"/>
    <path d="M14 13h2"/>
    <path d="M14 17h2"/>
  </svg>
);

const BellIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

// --- Custom Calendar Component ---
const CustomCalendar: React.FC<{ selectedDate: string, onSelect: (date: string) => void }> = ({ selectedDate, onSelect }) => {
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
          return (
            <button key={d} type="button" onClick={() => onSelect(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)} className={`h-8 w-8 text-[10px] font-bold rounded-lg transition-all ${isSelected(d) ? 'bg-[#720000] text-white shadow-lg shadow-red-100' : 'text-slate-600 hover:bg-slate-100'}`}>
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const PieChart: React.FC<{ percent: number; color: string }> = ({ percent, color }) => {
  const radius = 15; // Leggermente ridotto come richiesto
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-12 h-12 shrink-0">
      <svg className="w-12 h-12 transform -rotate-90 block">
        <circle cx="24" cy="24" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="rgba(0,0,0,0.15)" />
        <circle cx="24" cy="24" r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={circumference} style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none text-white pointer-events-none">
          <span data-pdf-percent="true" className="text-[10px] font-black tracking-tighter block">{percent}</span>
          <span className="text-[6px] font-black opacity-80 block -mt-0.5">%</span>
      </div>
    </div>
  );
};

interface DeleteConfirmationModalProps {
    count: number;
    onConfirm: () => void;
    onCancel: () => void;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ count, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onCancel}></div>
        <div className="w-full max-w-md bg-white p-8 relative z-10 shadow-2xl rounded-[2.5rem] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <TrashIcon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-900 text-center uppercase tracking-tight leading-none mb-2">Conferma Eliminazione</h3>
            <p className="text-slate-500 text-sm text-center mb-8">
                Sei sicuro di voler eliminare {count === 1 ? 'questo servizio' : `${count} servizi`}? 
                <br /><strong className="text-red-600 font-black">L’operazione non è reversibile.</strong>
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={onCancel}
                    className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors"
                >
                    Annulla
                </button>
                <button 
                    onClick={onConfirm}
                    className="px-6 py-4 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                    Elimina ora
                </button>
            </div>
        </div>
    </div>
);

interface DashboardProps {
  events: OperationalEvent[];
  setEvents: React.Dispatch<React.SetStateAction<OperationalEvent[]>>;
  role: UserRole;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ events, setEvents, role, selectedDate, setSelectedDate }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [assignmentModal, setAssignmentModal] = useState<{ eventId: string, roleName: string, reqIndex: number, slotIndex: number } | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<string[] | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const displayEvents = useMemo(() => {
    return [...events]
      .filter(ev => ev.date === selectedDate)
      .sort((a, b) => a.timeWindow.split(' - ')[0].localeCompare(b.timeWindow.split(' - ')[0]));
  }, [events, selectedDate]);

  const summary = useMemo(() => {
    const stats: Record<string, { assigned: number; total: number }> = { 
      DIR: { assigned: 0, total: 0 }, 
      CP: { assigned: 0, total: 0 }, 
      VIG: { assigned: 0, total: 0 },
      ALTRO: { assigned: 0, total: 0 }
    };
    displayEvents.forEach(ev => {
      ev.requirements.forEach(req => {
        if (req.role in stats) {
          stats[req.role].assigned += req.assignedIds.filter(Boolean).length;
          stats[req.role].total += req.qty;
        }
      });
    });
    return stats;
  }, [displayEvents]);

  const uniqueEventDates = useMemo(() => {
    return Array.from(new Set(events.map(e => e.date))).sort();
  }, [events]);

  const toggleExpandAll = (expand: boolean) => {
    setExpandedIds(expand ? displayEvents.map(ev => ev.id) : []);
  };

  const confirmDelete = () => {
    if (!deleteRequest) return;
    setEvents(prev => prev.filter(ev => !deleteRequest.includes(ev.id)));
    setExpandedIds(prev => prev.filter(id => !deleteRequest.includes(id)));
    if (assignmentModal && deleteRequest.includes(assignmentModal.eventId)) setAssignmentModal(null);
    setDeleteRequest(null);
  };

  const handleDownloadPDF = async () => {
    if (!gridRef.current) return;
    setIsPdfLoading(true);

    const previousZoom = zoomLevel;
    const previousExpanded = [...expandedIds];
    const container = gridRef.current;

    const originalStyle = container.getAttribute('style') || '';
    const originalClassName = container.className;

    // Espandi tutto e porta zoom a 100% per cattura consistente
    toggleExpandAll(true);
    setZoomLevel(1);

    // PDF layout fisso: 3 colonne x 2 righe per pagina (evita card tagliate tra pagine)
    const cols = 3;
    const rowsPerPage = 2;
    const perPage = cols * rowsPerPage;

    // Larghezza export (px): aumenta un filo per far entrare 2 righe in A3 senza tagli
    const cardMinWidth = 520;
    const gap = 24;
    const padding = 40;
    const exportWidth = cols * cardMinWidth + (cols - 1) * gap + padding * 2;

    const totalPages = Math.max(1, Math.ceil(displayEvents.length / perPage));
await new Promise(resolve => setTimeout(resolve, 900));

    try {
      // Layout stabile per la stampa
      container.style.cssText = `
        display: grid !important;
        grid-template-columns: repeat(${cols}, 1fr) !important;
        gap: ${gap}px !important;
        width: ${exportWidth}px !important;
        background: white !important;
        padding: ${padding}px !important;
        transform: none !important;
        overflow: visible !important;
      `;
      container.classList.add('forced-pdf-grid');

      // Header
      const headerDiv = document.createElement('div');
      headerDiv.style.cssText = `
        grid-column: span ${cols} !important;
        margin-bottom: 40px !important;
        border-bottom: 5px solid black !important;
        padding-bottom: 20px !important;
        display: flex !important;
        justify-content: space-between !important;
        align-items: flex-end !important;
        background: white !important;
      `;
      headerDiv.innerHTML = `
        <div style="flex: 1">
          <h1 style="font-size: 40px; font-weight: 900; text-transform: uppercase; margin: 0; color: black; letter-spacing: -1px;">VVF MILANO • REPORT OPERATIVO</h1>
          <p style="font-size: 18px; font-weight: 700; text-transform: uppercase; margin: 10px 0 0 0; color: #333;">Comando Provinciale Vigili del Fuoco</p>
        </div>
        <div style="text-align: right">
          <h2 style="font-size: 56px; font-weight: 900; margin: 0; line-height: 0.8; color: black;">${formatDate(selectedDate)}</h2>
          <p style="font-size: 13px; font-weight: 700; text-transform: uppercase; margin-top: 12px; color: #555;">Documento generato il ${new Date().toLocaleString()}</p>
        </div>
      `;
      container.prepend(headerDiv);

      // PDF: A3 landscape con paginazione per "griglia" (3x2) per evitare card tagliate
      const pdf = new jsPDF('l', 'mm', 'a3');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const cards = Array.from(container.querySelectorAll('.print-card-break')) as HTMLElement[];
      const originalDisplays = cards.map(c => c.style.display);

      for (let page = 0; page < totalPages; page++) {
        const from = page * perPage;
        const to = from + perPage;

        // Mostra solo le card della pagina corrente
        cards.forEach((c, i) => { c.style.display = (i >= from && i < to) ? '' : 'none'; });

        await new Promise(resolve => setTimeout(resolve, 200));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: exportWidth,
          onclone: (clonedDoc) => {
            const clonedEl = clonedDoc.querySelector('.forced-pdf-grid') as HTMLElement;
            if (!clonedEl) return;

            clonedEl.style.display = 'grid';
            clonedEl.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            clonedEl.style.gap = `${gap}px`;
            clonedEl.style.width = `${exportWidth}px`;
            clonedEl.style.padding = `${padding}px`;
            clonedEl.style.overflow = 'visible';

            // Evita tagli: niente truncate/overflow hidden in PDF
            clonedDoc.querySelectorAll('.truncate').forEach((el: any) => {
              el.style.whiteSpace = 'normal';
              el.style.overflow = 'visible';
              el.style.textOverflow = 'clip';
            });

            // Allunga le card in PDF
            clonedDoc.querySelectorAll('.print-card-break').forEach((el: any) => {
              el.style.overflow = 'visible';
              el.style.minHeight = '320px';
            });

            // Righe requisiti più alte
            clonedDoc.querySelectorAll('[data-requirement-row="true"]').forEach((el: any) => {
              el.style.height = '44px';
            });

            // Badge/percentuale più grandi + anti-taglio qualifiche
            clonedDoc.querySelectorAll('[data-pdf-badge="true"]').forEach((el: any) => {
              el.style.fontSize = '10px';
              el.style.whiteSpace = 'normal';
              el.style.overflow = 'visible';
              el.style.textOverflow = 'clip';
              el.style.wordBreak = 'break-word';
              el.style.lineHeight = '1.05';

              const parent = el.parentElement as HTMLElement | null;
              if (parent) {
                parent.style.overflow = 'visible';
                parent.style.width = '160px';
                parent.style.flex = '0 0 160px';
              }
            });
            clonedDoc.querySelectorAll('[data-pdf-percent="true"]').forEach((el: any) => {
              el.style.fontSize = '12px';
            });
          }
        });

        const imgData = canvas.toDataURL('image/png');
        const imgW = canvas.width;
        const imgH = canvas.height;
        const ratio = imgW / imgH;

        let w = pdfWidth;
        let h = w / ratio;
        let x = 0;
        let y = 0;

        if (h > pdfHeight) {
          h = pdfHeight;
          w = h * ratio;
          x = (pdfWidth - w) / 2;
        }

        if (page > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', x, y, w, h, undefined, 'FAST');
      }

      // Ripristina display card
      cards.forEach((c, i) => { c.style.display = originalDisplays[i]; });
// Ripristina DOM
      container.removeChild(headerDiv);
      container.className = originalClassName;
      container.style.cssText = originalStyle;
      container.classList.remove('forced-pdf-grid');
      setZoomLevel(previousZoom);
      setExpandedIds(previousExpanded);

      // Salva PDF
      pdf.save(`Report_Servizi_VVF_MILANO_${selectedDate}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Si è verificato un errore durante l'esportazione del PDF.");
    } finally {
      setIsPdfLoading(false);
    }
  };

  /**
   * Excel export A3 LANDSCAPE con layout "a card" come la reference fornita:
   * - 3 colonne
   * - fino a 3 righe per pagina (9 card)
   * - bordi marcati (medium) per delimitare ogni servizio
   * - focus su TITOLO / ORARI / NOMINATIVI (nessuna % completamento)
   */
  
  const handleDownloadExcel = async () => {
    try {
      const wb = new (ExcelJS as any).Workbook();

      const EVENTS_PER_PAGE = 9; // 3x3
      const totalPages = Math.max(1, Math.ceil(displayEvents.length / EVENTS_PER_PAGE));

      // Layout richiesto:
      // - A3 landscape
      // - 3 colonne di card
      // - ogni card = 6 colonne (1 qualifica + 5 nominativo)
      // - 2 colonne vuote tra una card e l'altra
      const CARD_COLS = 6;
      const GAP_COLS = 2;
      const CARDS_PER_ROW = 3;
      const CARD_ROWS = 11; // titolo, orario, 6 righe nominativi, APS, 2 righe area %, box % in basso a dx
      const GAP_ROWS = 1;
      const CARDS_PER_COL = 3;

      const colStarts = [1, 1 + CARD_COLS + GAP_COLS, 1 + (CARD_COLS + GAP_COLS) * 2]; // A, I, Q
      const rowStarts = [2, 2 + CARD_ROWS + GAP_ROWS, 2 + (CARD_ROWS + GAP_ROWS) * 2];

      const formatDateHeader = (iso: string) => {
        const [y, m, d] = iso.split('-');
        return `${d}-${m}-${y}`;
      };

      const calcDurationHours = (timeWindow: string) => {
        const [a, b] = timeWindow.split(' - ').map(s => s.trim());
        if (!a || !b) return '';
        const [ah, am] = a.split(':').map(Number);
        const [bh, bm] = b.split(':').map(Number);
        if ([ah, am, bh, bm].some(n => Number.isNaN(n))) return '';
        let start = ah * 60 + am;
        let end = bh * 60 + bm;
        if (end < start) end += 24 * 60;
        const mins = end - start;
        const hrs = mins / 60;
        return Math.abs(hrs - Math.round(hrs)) < 1e-6 ? `${Math.round(hrs)}h.` : `${hrs.toFixed(1)}h.`;
      };

      const computeCompletionPercent = (ev: OperationalEvent) => {
        const totalRequired = ev.requirements.reduce((acc, r) => acc + (r.qty || 0), 0);
        const totalFilled = ev.requirements.reduce((acc, r) => acc + (r.assignedIds?.filter(Boolean).length || 0), 0);
        return totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;
      };

      // Ritorna righe (qualifica, nominativo) con una riga per ogni slot richiesto.
      // Regole:
      // - Ogni nominativo su una riga (mai insieme)
      // - Qualifica su colonna dedicata (non unita al nominativo)
      // - ALT: solo qualifica "ALT" e nominativo, senza ripetere "(altro)" o altre etichette nel nominativo
      const buildNameRows = (ev: OperationalEvent) => {
        const rows: { q: string; n: string }[] = [];

        const pushRole = (role: string, label: string) => {
          const req = ev.requirements.find(r => r.role === role);
          if (!req || !req.qty) {
            rows.push({ q: label, n: '' });
            return;
          }
          for (let i = 0; i < req.qty; i++) {
            const assignedId = req.assignedIds?.[i];
            const operator = assignedId ? MOCK_OPERATORS.find(o => o.id === assignedId) : null;
            const entrustedTo = req.entrustedGroups?.[i];
            const name = operator ? operator.name : (entrustedTo ? `AFFIDATO ${entrustedTo}` : '');
            rows.push({ q: label, n: name });
          }
        };

        // Principali
        pushRole('DIR', 'DIR');
        pushRole('CP', 'CP');

        // VIG: una riga per ogni slot
        const vigReq = ev.requirements.find(r => r.role === 'VIG');
        if (!vigReq || !vigReq.qty) {
          rows.push({ q: 'VIG', n: '' });
        } else {
          for (let i = 0; i < vigReq.qty; i++) {
            const assignedId = vigReq.assignedIds?.[i];
            const operator = assignedId ? MOCK_OPERATORS.find(o => o.id === assignedId) : null;
            const entrustedTo = vigReq.entrustedGroups?.[i];
            const name = operator ? operator.name : (entrustedTo ? `AFFIDATO ${entrustedTo}` : '');
            rows.push({ q: 'VIG', n: name });
          }
        }

        // ALT: qualsiasi requisito diverso da DIR/CP/VIG
        const main = new Set(['DIR', 'CP', 'VIG']);
        ev.requirements.forEach(req => {
          if (!req.qty || req.qty === 0) return;
          if (main.has(req.role)) return;

          for (let i = 0; i < req.qty; i++) {
            const assignedId = req.assignedIds?.[i];
            const operator = assignedId ? MOCK_OPERATORS.find(o => o.id === assignedId) : null;
            const entrustedTo = req.entrustedGroups?.[i];
            const name = operator ? operator.name : (entrustedTo ? `AFFIDATO ${entrustedTo}` : '');
            // Evita righe completamente vuote
            if (name) rows.push({ q: 'ALT', n: name });
          }
        });

        return rows;
      };

      const applyCellStyle = (cell: any, fontSize: number, bold: boolean, align: 'left' | 'center' = 'left') => {
        cell.font = { name: 'Calibri', size: fontSize, bold };
        cell.alignment = { vertical: 'middle', horizontal: align, wrapText: true };
      };

      const applyThinGrid = (ws: any, r0: number, c0: number, r1: number, c1: number) => {
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            ws.getCell(r, c).border = {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            };
          }
        }
      };

      const applyOutlineMedium = (ws: any, r0: number, c0: number, r1: number, c1: number) => {
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const cell = ws.getCell(r, c);
            const b = cell.border || {};
            cell.border = {
              ...b,
              top: r === r0 ? { style: 'medium' } : b.top,
              bottom: r === r1 ? { style: 'medium' } : b.bottom,
              left: c === c0 ? { style: 'medium' } : b.left,
              right: c === c1 ? { style: 'medium' } : b.right,
            };
          }
        }
      };

      // Colonne: card(6) + gap(2) + card(6) + gap(2) + card(6) = 22
      // Un filo più larga la colonna qualifica per leggibilità in stampa
      const cardWidths = [6.5, 12, 12, 12, 12, 12]; // qualifica + 5 celle nominativo
      const gapWidths = [2.5, 2.5];
      const widths: number[] = [
        ...cardWidths, ...gapWidths,
        ...cardWidths, ...gapWidths,
        ...cardWidths,
      ];

      for (let page = 0; page < totalPages; page++) {
        const sheetName = totalPages === 1 ? 'A3' : `A3_${page + 1}`;
        const ws = wb.addWorksheet(sheetName);

        ws.pageSetup = {
          paperSize: 8, // A3
          orientation: 'landscape',
          fitToPage: true,
          fitToWidth: 1,
          fitToHeight: 0,
          horizontalCentered: false,
          verticalCentered: false,
          margins: { left: 0.3, right: 0.3, top: 0.3, bottom: 0.3, header: 0.2, footer: 0.2 },
        };

        ws.columns = widths.map((w: number, idx: number) => ({ key: `c${idx + 1}`, width: w }));

        // Altezza righe (header + 3 blocchi)
        for (let r = 1; r <= 39; r++) ws.getRow(r).height = 18;

        ws.getRow(1).height = 32;

        // Intestazione (come reference)
        ws.mergeCells(1, 1, 1, 22); // A1:V1
        const headerCell = ws.getCell(1, 1);
        headerCell.value = {
          richText: [
            { text: 'DATA GIORNO  ', font: { name: 'Calibri', size: 24, bold: true } },
            { text: `Data: ${formatDateHeader(selectedDate)}`, font: { name: 'Calibri', size: 20, bold: true } },
          ],
        };
        headerCell.alignment = { vertical: 'middle', horizontal: 'left' };

        // Footer
        ws.mergeCells(39, 1, 39, 22);
        const footerCell = ws.getCell(39, 1);
        footerCell.value = `DATA: ${selectedDate}`;
        footerCell.font = { name: 'Calibri', size: 12, bold: false };
        footerCell.alignment = { vertical: 'middle', horizontal: 'left' };

        // Eventi della pagina
        const pageEvents = displayEvents.slice(page * EVENTS_PER_PAGE, (page + 1) * EVENTS_PER_PAGE);
        pageEvents.forEach((ev, i) => {
          const gridR = Math.floor(i / CARDS_PER_ROW);
          const gridC = i % CARDS_PER_ROW;
          const r0 = rowStarts[gridR];
          const c0 = colStarts[gridC];
          const r1 = r0 + CARD_ROWS - 1;
          const c1 = c0 + CARD_COLS - 1;

          // Card: griglia thin + contorno medium (contorno medio su tutta la card)
          applyThinGrid(ws, r0, c0, r1, c1);
          applyOutlineMedium(ws, r0, c0, r1, c1);

          // Titolo (18pt bold)
          ws.mergeCells(r0, c0, r0, c1);
          const titleCell = ws.getCell(r0, c0);
          titleCell.value = `${ev.location} — ${ev.code}`;
          applyCellStyle(titleCell, 18, true, 'left');

          // Orario + durata (18pt bold)
          ws.mergeCells(r0 + 1, c0, r0 + 1, c1);
          const dur = calcDurationHours(ev.timeWindow);
          const orarioCell = ws.getCell(r0 + 1, c0);
          orarioCell.value = `ORARIO: ${ev.timeWindow}${dur ? ` - DURATA: ${dur}` : ''}`;
          applyCellStyle(orarioCell, 18, true, 'left');

          // Righe nominativi
          const rows = buildNameRows(ev);
          const maxNameRows = 6;
          for (let k = 0; k < maxNameRows; k++) {
            const rr = r0 + 2 + k;
            const qCell = ws.getCell(rr, c0);
            const nStart = c0 + 1;
            const nEnd = c1;

            // Merge nominativo su 5 colonne
            ws.mergeCells(rr, nStart, rr, nEnd);

            const item = rows[k];
            qCell.value = item ? item.q : '';
            applyCellStyle(qCell, 16, true, 'left');

            const nCell = ws.getCell(rr, nStart);
            nCell.value = item ? item.n : '';
            applyCellStyle(nCell, 16, false, 'left');

            // Separatore verticale tra qualifica e nominativo (thin)
            qCell.border = { ...(qCell.border || {}), right: { style: 'thin' } };
            nCell.border = { ...(nCell.border || {}), left: { style: 'thin' } };
          }

          // APS code (13pt)
          const dayCode = getMainDayCode(new Date(ev.date + 'T00:00:00'));
          ws.mergeCells(r0 + 8, c0, r0 + 8, c1);
          const apsCell = ws.getCell(r0 + 8, c0);
          apsCell.value = `APS- ${dayCode}`;
          apsCell.font = { name: 'Calibri', size: 13, bold: false };
          apsCell.alignment = { vertical: 'middle', horizontal: 'left' };

          // Box % completamento in basso a destra (come reference immagine)
          const pct = computeCompletionPercent(ev);
          const boxR0 = r0 + 9;
          const boxR1 = r0 + 10;
          const boxC0 = c0 + 4; // ultime 2 colonne della card
          const boxC1 = c0 + 5;

          ws.mergeCells(boxR0, boxC0, boxR1, boxC1);
          const pctCell = ws.getCell(boxR0, boxC0);
          pctCell.value = `${pct}%`;
          applyCellStyle(pctCell, 16, true, 'center');

          // Bordo medium del box
          for (let r = boxR0; r <= boxR1; r++) {
            for (let c = boxC0; c <= boxC1; c++) {
              const cell = ws.getCell(r, c);
              const b = cell.border || {};
              cell.border = {
                ...b,
                top: r === boxR0 ? { style: 'medium' } : b.top,
                bottom: r === boxR1 ? { style: 'medium' } : b.bottom,
                left: c === boxC0 ? { style: 'medium' } : b.left,
                right: c === boxC1 ? { style: 'medium' } : b.right,
              };
            }
          }
        });
      }


      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Servizi_VVF_A3_${selectedDate}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Excel Export Error:', err);
      alert("Si è verificato un errore durante l'esportazione dell'Excel.");
    }
  };


  const updateAssignment = (eventId: string, reqIndex: number, slotIndex: number, operatorId: string | null) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const newReqs = [...ev.requirements];
      const targetReq = { ...newReqs[reqIndex] };


  const clearEntrust = (eventId: string, reqIndex: number, slotIndex: number) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const newReqs = [...ev.requirements];
      const targetReq = { ...newReqs[reqIndex] };
      if (!targetReq.entrustedGroups) targetReq.entrustedGroups = Array(targetReq.qty).fill(null);
      const newEntrusted = [...targetReq.entrustedGroups];
      newEntrusted[slotIndex] = null;
      targetReq.entrustedGroups = newEntrusted;

      // Non tocchiamo assegnazioni qui (di norma è già null quando c'è affidamento)
      newReqs[reqIndex] = targetReq;
      return { ...ev, requirements: newReqs };
    }));
  };
      
      const newAssigned = [...targetReq.assignedIds];
      newAssigned[slotIndex] = operatorId;
      targetReq.assignedIds = newAssigned;
      
      if (!targetReq.entrustedGroups) targetReq.entrustedGroups = Array(targetReq.qty).fill(null);
      const newEntries = [...targetReq.entrustedGroups];
      // Se assegno un operatore, annullo eventuale "affidamento" precedente sullo slot
      if (operatorId) newEntries[slotIndex] = null;
      targetReq.entrustedGroups = newEntries;

      newReqs[reqIndex] = targetReq;

      const totalUnits = newReqs.reduce((sum, r) => sum + r.qty, 0);
      const filledUnits = newReqs.reduce((sum, r) => sum + r.assignedIds.filter(Boolean).length, 0);
      
      let newStatus = ev.status;
      if (filledUnits === totalUnits && totalUnits > 0) {
        newStatus = EventStatus.COMPLETATO;
      } else if (filledUnits > 0) {
        newStatus = EventStatus.IN_COMPILAZIONE;
      }

      return { ...ev, requirements: newReqs, status: newStatus };
    }));
  };

  const handleEntrust = (eventId: string, reqIndex: number, slotIndex: number, currentOwner: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    const dayCode = getMainDayCode(new Date(event.date + 'T00:00:00'));
    const priorityChain = getPriorityChain(dayCode);
    const currentIndex = priorityChain.indexOf(currentOwner);
    const nextGroup = priorityChain[(currentIndex + 1) % priorityChain.length];

    setEvents(prev => prev.map(ev => {
      if (ev.id !== eventId) return ev;
      const newReqs = [...ev.requirements];
      const targetReq = { ...newReqs[reqIndex] };
      if (!targetReq.entrustedGroups) targetReq.entrustedGroups = Array(targetReq.qty).fill(null);
      const newEntrusted = [...targetReq.entrustedGroups];
      newEntrusted[slotIndex] = nextGroup;
      targetReq.entrustedGroups = newEntrusted;
      const newAssigned = [...targetReq.assignedIds];
      newAssigned[slotIndex] = null;
      targetReq.assignedIds = newAssigned;
      newReqs[reqIndex] = targetReq;
      return { ...ev, requirements: newReqs };
    }));
    setAssignmentModal(null);
  };

  const handleToggleNotifications = () => {
     setShowNotifications(!showNotifications);
  }

  const navigateDay = (direction: number) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + direction);
    const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    setSelectedDate(formatted);
  };

  return (
    <div className="mx-auto p-3 lg:p-4 space-y-4 pb-32 transition-all duration-500 relative">
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-3 rounded-[1.5rem] border border-slate-200 shadow-sm no-print relative z-30">
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => navigateDay(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-[#720000] transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg></button>
          
          <div className="relative" ref={datePickerRef}>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-3 text-[#720000] min-w-[200px] justify-center cursor-pointer hover:bg-slate-50 rounded-2xl transition-all p-2 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black tracking-tighter leading-none group-hover:scale-105 transition-transform">{formatDate(selectedDate).split('/')[0]}</span>
                <div className="flex flex-col">
                  <span className="text-[9px] font-light uppercase tracking-[0.2em] text-slate-500">{new Date(selectedDate + 'T00:00:00').toLocaleString('it-IT', { weekday: 'long' }).toUpperCase()}</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-black uppercase tracking-widest leading-none">{new Date(selectedDate + 'T00:00:00').toLocaleString('it-IT', { month: 'long' }).toUpperCase()}</span>
                    <span className="text-[10px] font-black opacity-30 tracking-widest">{new Date(selectedDate + 'T00:00:00').getFullYear()}</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-[#720000] group-hover:w-1/2 transition-all duration-300"></div>
            </button>
            {showDatePicker && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 z-[70] mt-2 shadow-2xl">
                <CustomCalendar 
                  selectedDate={selectedDate} 
                  onSelect={(d) => { setSelectedDate(d); setShowDatePicker(false); }} 
                />
              </div>
            )}
          </div>

          <button onClick={() => navigateDay(1)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200 text-slate-400 hover:text-[#720000] transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg></button>
        </div>
        <div className="h-8 w-px bg-slate-100 hidden lg:block"></div>
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-1.5 rounded-2xl shrink-0">
          <div className="flex items-center gap-1">
            <button onClick={() => toggleExpandAll(true)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-[#720000] text-slate-400 transition-all"><PanelBottomOpenIcon /></button>
            <button onClick={() => toggleExpandAll(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-[#720000] text-slate-400 transition-all"><PanelTopOpenIcon /></button>
          </div>
          <div className="h-6 w-px bg-slate-200"></div>
          <div className="flex items-center gap-1">
            {[1, 0.7, 0.5].map(level => (
              <button key={level} onClick={() => setZoomLevel(level)} className={`px-2 h-8 rounded-lg text-[10px] font-black transition-all ${zoomLevel === level ? 'bg-[#720000] text-white' : 'text-slate-400 hover:bg-white'}`}>{level * 100}%</button>
            ))}
            <div className="ml-1 text-slate-300"><ZoomIcon /></div>
          </div>
        </div>
        <div className="h-8 w-px bg-slate-100 hidden lg:block"></div>
        <div className="flex-1 min-w-0 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {Object.entries(summary).map(([key, value]) => {
            const val = value as { assigned: number; total: number };
            if (val.total === 0) return null; 
            return (
              <div key={key} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl shrink-0">
                <span className="text-[10px] font-black text-[#720000] tracking-tighter w-6">{key}</span>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-slate-900 leading-none">{val.assigned}/{val.total}</span>
                  <div className="w-10 h-1 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div className={`h-full ${val.assigned >= val.total && val.total > 0 ? 'bg-emerald-500' : 'bg-[#720000]'}`} style={{ width: `${val.total > 0 ? Math.min(100, (val.assigned / val.total) * 100) : 0}%` }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2 border-l border-slate-100 pl-3">
             <button
                onClick={handleDownloadExcel}
                title="Scarica Excel"
                aria-label="Scarica Excel"
                className="w-10 h-10 flex items-center justify-center bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
             >
                <img src={excelFileIcon} alt="Excel" className="w-6 h-6" />
             </button>

             <button
                onClick={handleDownloadPDF}
                disabled={isPdfLoading}
                title={isPdfLoading ? 'Generazione PDF...' : 'Scarica PDF'}
                aria-label={isPdfLoading ? 'Generazione PDF...' : 'Scarica PDF'}
                className="w-10 h-10 flex items-center justify-center bg-red-50 border border-red-200 rounded-xl text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all disabled:opacity-50"
             >
                {isPdfLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                ) : (
                    <img src={pdfFileIcon} alt="PDF" className="w-6 h-6" />
                )}
             </button>

             <button
                onClick={handleToggleNotifications}
                className={`relative w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${showNotifications ? 'bg-[#720000] text-white border-[#720000]' : 'bg-white border-slate-200 text-slate-400 hover:text-[#720000] hover:border-[#720000]'}`}
             >
                <BellIcon className="w-5 h-5" />
                {uniqueEventDates.length > 0 && (
                   <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                )}
             </button>
        </div>
      </div>

      {showNotifications && (
        <div className="fixed top-24 right-6 w-80 bg-white shadow-2xl rounded-3xl border border-slate-100 p-6 z-[60] animate-in slide-in-from-right-4 zoom-in-95">
           <div className="flex justify-between items-center mb-4 border-b border-slate-50 pb-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Calendario Servizi</h3>
              <button onClick={() => setShowNotifications(false)} className="text-slate-300 hover:text-red-500 text-xl font-light">×</button>
           </div>
           <div className="space-y-2 max-h-[60vh] overflow-y-auto scrollbar-thin">
              {uniqueEventDates.map(date => (
                  <button 
                    key={date}
                    onClick={() => { setSelectedDate(date); setShowNotifications(false); }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group ${date === selectedDate ? 'bg-[#720000] border-[#720000] text-white' : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-white hover:border-red-200 hover:shadow-md'}`}
                  >
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest">{formatDate(date)}</span>
                        <span className={`text-[8px] font-bold uppercase tracking-tight ${date === selectedDate ? 'text-white/60' : 'text-slate-400'}`}>
                           {events.filter(e => e.date === date).length} Servizi Attivi
                        </span>
                     </div>
                     <div className={`w-6 h-6 rounded-full flex items-center justify-center ${date === selectedDate ? 'bg-white/20' : 'bg-white text-slate-300 group-hover:text-[#720000]'}`}>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                     </div>
                  </button>
              ))}
              {uniqueEventDates.length === 0 && (
                  <p className="text-center py-4 text-xs text-slate-400 italic">Nessun servizio pianificato</p>
              )}
           </div>
        </div>
      )}

      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 items-start transition-transform duration-500 bg-white md:bg-transparent" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100 / zoomLevel}%` }}>
        {displayEvents.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            role={role}
            isExpanded={expandedIds.includes(event.id)}
            onToggle={() => setExpandedIds(prev => prev.includes(event.id) ? prev.filter(id => id !== event.id) : [...prev, event.id])}
            onOpenAssignment={(roleName, reqIdx, slotIdx) => setAssignmentModal({ eventId: event.id, roleName, reqIndex: reqIdx, slotIndex: slotIdx })}
            onRemoveAssignment={(reqIdx, slotIdx) => updateAssignment(event.id, reqIdx, slotIdx, null)}
            onDeleteRequest={() => setDeleteRequest([event.id])}
          />
        ))}
      </div>

      {assignmentModal && (
        <AssignmentPopup 
          eventId={assignmentModal.eventId}
          roleName={assignmentModal.roleName}
          userRole={role}
          onClose={() => setAssignmentModal(null)}
          onAssign={(opId) => { updateAssignment(assignmentModal.eventId, assignmentModal.reqIndex, assignmentModal.slotIndex, opId); setAssignmentModal(null); }}
          onEntrust={(owner) => handleEntrust(assignmentModal.eventId, assignmentModal.reqIndex, assignmentModal.slotIndex, owner)}
          assignedIds={events.find(e => e.id === assignmentModal.eventId)?.requirements[assignmentModal.reqIndex].assignedIds || []}
          slotIndex={assignmentModal.slotIndex}
          events={events}
        />
      )}

      {deleteRequest && (
          <DeleteConfirmationModal 
            count={deleteRequest.length}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteRequest(null)}
          />
      )}
    </div>
  );
};

const EventCard: React.FC<{
  event: OperationalEvent;
  role: UserRole;
  isExpanded: boolean;
  onToggle: () => void;
  onOpenAssignment: (role: string, idx: number, slotIdx: number) => void;
  onRemoveAssignment: (idx: number, slotIdx: number) => void;
  onDeleteRequest: () => void;
}> = ({ event, role, isExpanded, onToggle, onOpenAssignment, onRemoveAssignment, onDeleteRequest }) => {
  const currentCompilatoreGroup = role.startsWith('COMPILATORE') ? role.split('_')[1] : null;
  const isCompilatore = !!currentCompilatoreGroup;
  const isRedattore = role === 'REDATTORE';
  
  const totalRequired = event.requirements.reduce((acc, r) => acc + r.qty, 0);
  const totalFilled = event.requirements.reduce((acc, r) => acc + r.assignedIds.filter(Boolean).length, 0);
  const completionPercent = totalRequired > 0 ? Math.round((totalFilled / totalRequired) * 100) : 0;

  const dayCode = getMainDayCode(new Date(event.date + 'T00:00:00'));
  const priorityChain = getPriorityChain(dayCode);

  const duration = useMemo(() => {
    const [start, end] = event.timeWindow.split(' - ');
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diff = (h2 * 60 + (m2 || 0)) - (h1 * 60 + (m1 || 0));
    if (diff <= 0) diff += 24 * 60;
    return Math.floor(diff / 60) + (diff % 60 > 0 ? 'h ' + (diff % 60) + 'm' : 'h');
  }, [event.timeWindow]);

  return (
    <div id={event.id} className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col border transition-all print-card-break ${isExpanded ? 'ring-2 ring-slate-900/10' : ''} border-slate-100`}>
      <div className="flex h-14 shrink-0 border-b border-slate-50 relative group/header overflow-hidden">
        <div 
          className={`flex-1 ${event.isOlympic ? 'bg-[#C9A40E]' : 'bg-[#A80505]'} flex items-center px-4 gap-2 border-r border-white/10 relative transition-colors overflow-hidden pdf-no-overflow cursor-pointer`}
          onClick={onToggle}
        >
           <h3 className={`text-xl font-black ${event.isOlympic ? 'text-slate-900' : 'text-white'} uppercase tracking-tighter truncate pdf-no-truncate leading-tight`}>{event.code}</h3>
        </div>

        <div className="w-20 bg-[#720000] flex flex-col items-center justify-center text-white px-1 shrink-0 pt-0.5">
           <span className="text-[7px] font-black leading-none opacity-80 uppercase tracking-widest mb-1">DURATA</span>
           <span className="text-lg font-black text-[#EBE81D] tracking-tighter leading-tight">{duration}</span>
        </div>
      </div>

      <div className={`flex-1 divide-y divide-slate-100 ${isExpanded ? 'block' : 'hidden'}`}>
        {event.requirements.map((req, reqIdx) => {
          if (req.qty === 0) return null; 
          return Array.from({ length: req.qty }).map((_, unitIdx) => {
            const assignedId = req.assignedIds[unitIdx];
            const operator = assignedId ? MOCK_OPERATORS.find(o => o.id === assignedId) : null;
            const entrustedTo = req.entrustedGroups?.[unitIdx];
            const slotOwner = entrustedTo || (priorityChain ? priorityChain[0] : 'A');
            const canThisCompilatoreEdit = isCompilatore && currentCompilatoreGroup === slotOwner;

            let roleBg = "bg-slate-100";
            if (req.role === 'DIR') roleBg = "bg-[#EA9E8D]";
            if (req.role === 'CP') roleBg = "bg-[#A6D9F7]";
            if (req.role === 'VIG') roleBg = "bg-[#f1f3f5]";
            if (req.role === 'ALTRO') roleBg = "bg-slate-200";

            return (
              <div key={`${req.role}-${reqIdx}-${unitIdx}`} data-requirement-row="true" className="flex h-10 items-stretch border-b border-slate-50 last:border-b-0">
                <div className={`w-28 px-1 ${roleBg} flex items-center justify-center shrink-0 border-r border-slate-200/30 overflow-hidden`}>
                   <span data-pdf-badge="true" className="text-[9px] font-black text-slate-800 uppercase whitespace-nowrap text-center leading-tight tracking-tighter overflow-hidden">
                     {operator ? operator.rank : req.role}
                   </span>
                </div>
                <div className="flex-1 flex items-center px-2 bg-white min-w-0 gap-2">
                  {operator ? (
                    <div className="flex items-center w-full min-w-0 gap-2">
                       {(isRedattore || (isCompilatore && canThisCompilatoreEdit)) && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onRemoveAssignment(reqIdx, unitIdx); }} 
                           className="w-5 h-5 bg-red-50 text-[#720000] rounded-lg flex items-center justify-center hover:bg-[#A80505] hover:text-white transition-all no-print shrink-0 border border-red-200"
                         >
                           <span className="text-[12px] font-black leading-none">×</span>
                         </button>
                       )}
                       <span className="text-[10px] font-black text-slate-950 uppercase pr-1 truncate pdf-no-truncate">{operator.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center w-full gap-2">
                       {canThisCompilatoreEdit && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onOpenAssignment(req.role, reqIdx, unitIdx); }} 
                           className="w-5 h-5 bg-red-50 text-[#720000] hover:scale-110 transition-transform shrink-0 no-print flex items-center justify-center rounded-lg shadow-sm hover:bg-[#A80505] hover:text-white border border-red-200"
                         >
                           <UserPlusIcon className="w-3.5 h-3.5" />
                         </button>
                       )}
                       
                       {entrustedTo ? (
                          <div className="flex items-center gap-2">
                             {(isRedattore || canThisCompilatoreEdit) && (
                               <button
                                 onClick={(e) => { e.stopPropagation(); clearEntrust(event.id, reqIdx, unitIdx); }}
                                 className="w-5 h-5 bg-slate-50 text-slate-700 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-all no-print shrink-0 border border-slate-200"
                                 title="Rimuovi affidamento"
                               >
                                 <span className="text-[12px] font-black leading-none">×</span>
                               </button>
                             )}
                             <span className="text-[9px] font-black uppercase tracking-tight text-slate-700 whitespace-nowrap">
                               Affidato a Gruppo {entrustedTo}
                             </span>
                          </div>
                       ) : () : (
                          <span className="text-[8px] italic text-slate-300 font-medium uppercase tracking-tighter truncate pr-1">Vacante...</span>
                       )}
                    </div>
                  )}
                </div>
              </div>
            );
          });
        })}
      </div>

      <div className="p-2.5 bg-[#3A3835] border-t border-slate-50/10 flex flex-col shrink-0 min-h-[60px] justify-center">
        <div className="flex items-center w-full px-2 gap-4">
            <div className="flex flex-col flex-1 min-w-0 pdf-no-overflow">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">ORARIO SERVIZIO</span>
              <span className="text-xl font-black text-[#EBE81D] leading-none tracking-tighter truncate pdf-no-truncate">{event.timeWindow}</span>
            </div>
            
            <div className="flex items-center gap-1.5 no-print">
               {event.vehicles.APS > 0 && <div className="px-2.5 py-1 bg-slate-800 rounded-lg text-[9px] font-black text-white border border-white/20 uppercase tracking-tighter shadow-sm">APS {event.vehicles.APS}</div>}
               {event.vehicles.AS > 0 && <div className="px-2.5 py-1 bg-slate-800 rounded-lg text-[9px] font-black text-white border border-white/20 uppercase tracking-tighter shadow-sm">AS {event.vehicles.AS}</div>}
               {event.vehicles.ABP > 0 && <div className="px-2.5 py-1 bg-slate-800 rounded-lg text-[9px] font-black text-white border border-white/20 uppercase tracking-tighter shadow-sm">ABP {event.vehicles.ABP}</div>}
            </div>

            {isRedattore && (
              <button 
                type="button"
                onClick={(e) => { 
                   e.preventDefault();
                   e.stopPropagation();
                   onDeleteRequest(); 
                }} 
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-red-600 text-white/40 hover:text-white transition-all group/del no-print border border-white/5"
                title="Elimina servizio"
              >
                <TrashIcon className="w-5 h-5 transition-transform group-hover/del:scale-110" />
              </button>
            )}

            <PieChart percent={completionPercent} color="#EBE81D" />
        </div>
      </div>
    </div>
  );
};

const AssignmentPopup: React.FC<{
  eventId: string; roleName: string; userRole: UserRole; onClose: () => void;
  onAssign: (id: string) => void; onEntrust: (currentOwner: string) => void;
  assignedIds: (string | null)[]; slotIndex: number; events: OperationalEvent[];
}> = ({ eventId, roleName, userRole, onClose, onAssign, onEntrust, assignedIds, slotIndex, events }) => {
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('');
  const [sedePopupFilter, setSedePopupFilter] = useState('TUTTE');
  const [patenteFilter, setPatenteFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: 'subgroup' | 'assignedHours', direction: 'asc' | 'desc' }>({ key: 'assignedHours', direction: 'asc' });
  
  const event = events.find(e => e.id === eventId);
  const userGroup = userRole.startsWith('COMPILATORE') ? userRole.split('_')[1] : null;

  const globallyAssignedIdsForDate = useMemo(() => {
    if (!event) return new Set<string>();
    const date = event.date;
    const assigned = new Set<string>();
    events.filter(ev => ev.date === date).forEach(ev => {
      ev.requirements.forEach(req => {
        req.assignedIds.forEach(id => {
          if (id) assigned.add(id);
        });
      });
    });
    return assigned;
  }, [events, event]);

  const groupOwner = useMemo(() => {
    if (!event) return 'A';
    const specificReq = event.requirements.find(r => r.role === roleName);
    const entrusted = specificReq?.entrustedGroups?.[slotIndex];
    if (entrusted) return entrusted;
    const dayCode = getMainDayCode(new Date(event.date + 'T00:00:00'));
    const priorityChain = getPriorityChain(dayCode);
    return priorityChain[0]; 
  }, [event, roleName, slotIndex]);

  const dayCode = event ? getMainDayCode(new Date(event.date + 'T00:00:00')) : '';
  const { standard, extra } = selectableForVigilanza(dayCode);
  const priorityChain = getPriorityChain(dayCode);
  const currentIndex = priorityChain.indexOf(groupOwner);
  const nextGroup = priorityChain[(currentIndex + 1) % priorityChain.length];
  
  const pool = useMemo(() => {
    // Turnario logic filter
    const validSubgroups = new Set([...standard, ...extra]);

    let result = MOCK_OPERATORS.filter(op => op.qualification === roleName && op.available);
    
    // Filter by Turnario validity: prioritari (tutto il gruppo standard), secondari (solo sottogruppi extra), oppure gruppo EXTRA
    result = result.filter(op => 
      standard.some(s => s.startsWith(op.group)) || // Prioritario: tutto il gruppo standard
      validSubgroups.has(op.subgroup) ||            // Secondario: solo sottogruppi indicati
      op.group === 'EXTRA'                          // Sempre disponibile il gruppo EXTRA
    );
    
    if (userGroup) {
      // Regola: Il compilatore vede la propria linea turnaria (se valida algorithmicamente) OPPURE sempre il gruppo EXTRA
      result = result.filter(op => op.group === userGroup || op.group === 'EXTRA');
    }
    
    if (search) result = result.filter(op => op.name.toLowerCase().includes(search.toLowerCase()));
    if (specFilter) result = result.filter(op => op.specializations?.includes(specFilter));
    if (sedePopupFilter !== 'TUTTE') result = result.filter(op => op.sede === sedePopupFilter);
    if (patenteFilter) result = result.filter(op => op.tipoPatente === patenteFilter);
    
    result.sort((a, b) => {
      // Priorità Sottogruppi: Standard (1), Extra/Rientri (2), Altri (3)
      const getPriority = (subgroup: string) => {
        if (standard.includes(subgroup)) return 1;
        if (extra.includes(subgroup)) return 2;
        return 3;
      };

      const pA = getPriority(a.subgroup);
      const pB = getPriority(b.subgroup);

      if (pA !== pB) return pA - pB;

      // Ordinamento secondario in base alla configurazione utente (ore, nome, etc)
      const valA = a[sortConfig.key];
      const valB = b[sortConfig.key];
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [roleName, search, userGroup, standard, extra, specFilter, sedePopupFilter, patenteFilter, sortConfig]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}></div>
      <div className="w-full max-w-6xl bg-white p-6 relative z-10 shadow-2xl rounded-[2.5rem] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 border border-slate-100">
         <div className="mb-4 flex justify-between items-start border-b border-slate-50 pb-5">
            <div className="flex-1">
              <h3 className="text-xl font-black text-[#720000] uppercase tracking-tight leading-none">SELEZIONE {roleName}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${userGroup === 'A' ? 'bg-red-50 text-red-600 border border-red-100' : userGroup === 'B' ? 'bg-blue-50 text-blue-700 border border-blue-100' : userGroup === 'C' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : userGroup === 'D' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50'}`}>Gruppo {userGroup}</span>
                <span className="text-slate-300 mx-1">•</span>
                <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Compilatore Autorizzato</p>
              </div>
            </div>
            {userGroup === groupOwner && (
              <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEntrust(groupOwner); }} className="flex items-center gap-2 px-5 py-3 bg-[#720000] text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mr-4 shadow-xl shadow-red-200 hover:bg-slate-900 active:scale-95 border border-white/10"><ShareIcon className="w-3.5 h-3.5" /> Passa a Gruppo {nextGroup}</button>
            )}
            <button onClick={onClose} className="text-slate-300 hover:text-slate-500 text-2xl font-light leading-none">×</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
             <input type="text" placeholder="Cerca nominativo..." value={search} onChange={e => setSearch(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold uppercase focus:outline-none focus:ring-4 focus:ring-red-100/50" />
             <select value={sedePopupFilter} onChange={e => setSedePopupFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase focus:outline-none appearance-none cursor-pointer">
                <option value="TUTTE">Filtra Sede: Tutte</option>
                {ALL_SEDI.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
             <select value={patenteFilter} onChange={e => setPatenteFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase focus:outline-none appearance-none cursor-pointer">
                <option value="">Filtra Patente: Tutte</option>
                {ALL_PATENTI.map(p => <option key={p} value={p}>Patente {p}</option>)}
             </select>
             <select value={specFilter} onChange={e => setSpecFilter(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black uppercase focus:outline-none appearance-none cursor-pointer">
                <option value="">Filtra Spec: Tutte</option>
                {ALL_SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
         </div>
         <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            <div className="grid grid-cols-12 px-4 py-2 text-[8px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 sticky top-0 bg-white z-10">
              <div className="col-span-3">Nominativo</div>
              <div className="col-span-2 cursor-pointer hover:text-[#720000]" onClick={() => setSortConfig({ key: 'subgroup', direction: sortConfig.key === 'subgroup' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                Sottogruppo {sortConfig.key === 'subgroup' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </div>
              <div className="col-span-2">Sede</div>
              <div className="col-span-1 text-center">Patente</div>
              <div className="col-span-2">Spec.</div>
              <div className="col-span-2 text-right cursor-pointer hover:text-[#720000]" onClick={() => setSortConfig({ key: 'assignedHours', direction: sortConfig.key === 'assignedHours' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>
                Carico {sortConfig.key === 'assignedHours' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </div>
            </div>
            {pool.map(op => {
              const isAlreadyImpegnato = globallyAssignedIdsForDate.has(op.id);
              const isSecondary = extra.includes(op.subgroup);
              
              return (
                <div 
                  key={op.id} 
                  onClick={() => !isAlreadyImpegnato && onAssign(op.id)} 
                  className={`grid grid-cols-12 items-center p-3.5 border rounded-2xl transition-all ${isAlreadyImpegnato ? 'bg-slate-50/50 border-slate-100 opacity-60 cursor-not-allowed select-none grayscale-[0.5]' : 'bg-white border-slate-100 hover:bg-slate-50/80 cursor-pointer group shadow-sm'}`}
                >
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${isAlreadyImpegnato ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex flex-col min-w-0 ml-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-[11px] font-black uppercase truncate leading-tight ${isAlreadyImpegnato ? 'text-slate-400' : 'text-slate-900'}`}>{op.name}</p>
                        {isSecondary && (
                           <span className="text-[7px] bg-[#720000]/10 text-[#720000] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">Rientro</span>
                        )}
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{op.rank}</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center justify-start pl-1">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border shadow-sm ${
                      op.group === 'A' ? 'bg-red-50 text-red-700 border-red-100' :
                      op.group === 'B' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      op.group === 'C' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      op.group === 'D' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-800 text-white border-slate-900'
                    }`}>
                      {op.subgroup}
                    </span>
                  </div>
                  <div className="col-span-2">
                     <span className="text-[9px] font-black text-slate-500 uppercase truncate" title={op.sede}>{op.sede || 'N/D'}</span>
                  </div>
                  <div className="col-span-1 text-center">
                     <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-black border border-slate-200 uppercase">{op.tipoPatente || 'N/D'}</span>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1">
                    {op.specializations?.slice(0, 2).map(s => (
                      <span key={s} className="bg-slate-100 text-slate-500 text-[7px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap border border-slate-200\">{s}</span>
                    ))}
                    {op.specializations && op.specializations.length > 2 && (
                       <span className="text-[7px] font-black text-slate-300">+{op.specializations.length - 2}</span>
                    )}
                  </div>
                  <div className="col-span-2 text-right">
                    <span className={`text-sm font-black transition-colors ${isAlreadyImpegnato ? 'text-slate-300' : 'text-slate-900 group-hover:text-[#720000]'}`}>{op.assignedHours}h</span>
                  </div>
                </div>
              );
            })}
            {pool.length === 0 && (
              <div className="py-20 text-center bg-slate-50/30 rounded-3xl border border-dashed border-slate-100">
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Nessun operatore disponibile per i criteri selezionati</p>
              </div>
            )}
         </div>
         <div className="mt-6 pt-4 border-t border-slate-50">
            <button onClick={onClose} className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">Chiudi e Annulla</button>
         </div>
      </div>
    </div>
  );
};