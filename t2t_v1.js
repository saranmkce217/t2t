import React, { useState, useEffect, useRef } from 'react';
import { 
  Plane, 
  Search, 
  User, 
  Ticket, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Filter, 
  RefreshCw,
  Clock,
  LayoutDashboard,
  Zap,
  CheckCircle,
  XCircle,
  TrendingUp,
  MoreHorizontal,
  FileX,
  Ban,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  Activity,
  List,
  Eye,
  EyeOff
} from 'lucide-react';

// --- Date Helpers ---
const getRelativeDate = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0]; // YYYY-MM-DD (backend format)
};

// Formats YYYY-MM-DD or Date object to dd-mmm-yy (e.g. 14-Nov-25)
const formatDisplayDate = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return ''; // Invalid date check
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', { month: 'short' });
  const year = String(date.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
};

// Parses dd-mmm-yy back to Date object for logic
const parseDisplayDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  
  const [day, monthStr, year] = parts;
  const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
  
  const month = months[monthStr];
  if (month === undefined) return null;
  
  const fullYear = 2000 + parseInt(year);
  return new Date(fullYear, month, parseInt(day));
};

const DATES = {
  YESTERDAY: getRelativeDate(-1),
  TODAY: getRelativeDate(0),
  TOMORROW: getRelativeDate(1),
  NEXT_WEEK: getRelativeDate(7)
};

// --- Custom Components ---

const CustomDatePicker = ({ value, onChange, placeholder, error }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const date = parseDisplayDate(value);
      if (date && !isNaN(date.getTime())) {
        setViewDate(date);
      } else {
        setViewDate(new Date());
      }
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange(formatDisplayDate(selectedDate)); 
    setIsOpen(false);
  };

  // --- NEW LOGIC: Disable dates before (Today - 3 days) ---
  const isDateDisabled = (day) => {
    const checkDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Set time to midnight for accurate comparison
    checkDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate cutoff: Current date minus 3 days
    const minDate = new Date(today);
    minDate.setDate(today.getDate() - 3);

    return checkDate < minDate;
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  
  const days = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const selectedDateObj = parseDisplayDate(value);
  const isSelected = (day) => {
      if (!selectedDateObj) return false;
      return selectedDateObj.getDate() === day && 
             selectedDateObj.getMonth() === viewDate.getMonth() && 
             selectedDateObj.getFullYear() === viewDate.getFullYear();
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative group">
        <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400 pointer-events-none z-10" />
        <input
          type="text"
          placeholder={placeholder}
          className={`pl-10 w-full border bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 transition-all cursor-pointer ${error ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
          value={value}
          readOnly
          onClick={() => setIsOpen(!isOpen)}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1 flex items-center animate-in slide-in-from-top-1"><AlertCircle className="w-3 h-3 mr-1"/> {error}</p>}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white rounded-lg shadow-xl border border-slate-200 p-4 animate-in fade-in zoom-in-95 left-0">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-4 h-4 text-slate-600"/></button>
            <span className="text-sm font-bold text-slate-800">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-4 h-4 text-slate-600"/></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-slate-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              const disabled = day ? isDateDisabled(day) : false;
              return (
                <div key={idx} className="aspect-square">
                  {day && (
                    <button
                      onClick={() => !disabled && handleDayClick(day)}
                      disabled={disabled}
                      className={`w-full h-full flex items-center justify-center text-sm rounded-md transition-colors
                        ${isSelected(day)
                          ? 'bg-blue-900 text-white font-bold shadow-sm'
                          : disabled
                            ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                            : 'hover:bg-blue-50 text-slate-700'
                        }`}
                    >
                      {day}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Mock Data ---
const MOCK_FLIGHT_RESULTS = {
  ptp: [
    { id: 'p1', pnr: 'A1B2C3', name: 'Sarah Connor', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '12A', class: 'Economy', farebasis: 'Y26OW' },
    { id: 'p2', pnr: 'A1B2C3', name: 'John Connor', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'CHECKED-IN', seat: '12B', class: 'Economy', farebasis: 'Y26OW' },
    { id: 'p3', pnr: 'D4E5F6', name: 'Ellen Ripley', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'BOARDED', seat: '14C', class: 'Business', farebasis: 'Jflex' },
    { id: 'p4', pnr: 'G7H8I9', name: 'Luke Skywalker', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '15A', class: 'Economy', farebasis: 'YPRO' },
    { id: 'p5', pnr: 'G7H8I9', name: 'Leia Organa', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '15B', class: 'Economy', farebasis: 'YPRO' },
    { id: 'p6', pnr: 'J1K2L3', name: 'Han Solo', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'CHECKED-IN', seat: '02F', class: 'Business', farebasis: 'JFREEDOM' },
    { id: 'p10', pnr: 'M5N6O7', name: 'Walter White', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '18C', class: 'Economy', farebasis: 'YSAVER' },
    { id: 'p11', pnr: 'M5N6O7', name: 'Jesse Pinkman', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '18D', class: 'Economy', farebasis: 'YSAVER' },
    { id: 'p13', pnr: 'X9Y8Z7', name: 'Alice Wonderland', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'CHECKED-IN', seat: '20A', class: 'Economy', farebasis: 'YSAVER' },
    { id: 'p14', pnr: 'B2B3B4', name: 'Bob The Builder', flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'BOARDED', seat: '20B', class: 'Economy', farebasis: 'YSAVER' },
    { id: 'p7', pnr: 'NOV14A', name: 'Tony Stark', flight: '101', date: DATES.YESTERDAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '1A', class: 'Business', farebasis: 'JFULL' },
    { id: 'p8', pnr: 'NOV14B', name: 'Pepper Potts', flight: '101', date: DATES.YESTERDAY, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '1B', class: 'Business', farebasis: 'JFULL' },
    { id: 'p9', pnr: 'NOV16A', name: 'Peter Parker', flight: '101', date: DATES.TOMORROW, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'ACTIVE', seat: '22F', class: 'Economy', farebasis: 'YSAVER' },
    { id: 'p12', pnr: 'NOV16B', name: 'Wanda Maximoff', flight: '101', date: DATES.TOMORROW, time: '08:00', origin: 'DXB', dest: 'MCT', status: 'CHECKED-IN', seat: '23A', class: 'Economy', farebasis: 'YFLEX' },
  ],
  connecting: [
    { 
      id: 'c1', pnr: 'CONN01', name: 'Rajesh Koothrappali', status: 'ACTIVE', class: 'Economy', farebasis: 'QSAVER',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'BOM', dest: 'MCT',
      segments: [{ flight: '501', origin: 'BOM', dest: 'DXB', date: DATES.TODAY, time: '04:00', status: 'FLOWN' }, { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'ACTIVE' }]
    },
    { 
      id: 'c2', pnr: 'CONN02', name: 'Diana Prince', status: 'CHECKED-IN', class: 'Business', farebasis: 'JNOW',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'CAI', dest: 'MCT',
      segments: [{ flight: '404', origin: 'CAI', dest: 'DXB', date: DATES.TODAY, time: '02:00', status: 'FLOWN' }, { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'CHECKED-IN' }]
    },
    { 
      id: 'c3', pnr: 'CONN03', name: 'Natasha Romanoff', status: 'ACTIVE', class: 'Economy', farebasis: 'YFLEX',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'IST', dest: 'MCT',
      segments: [{ flight: '303', origin: 'IST', dest: 'DXB', date: DATES.TODAY, time: '01:00', status: 'FLOWN' }, { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'ACTIVE' }]
    },
    { 
      id: 'c6', pnr: 'CONN06', name: 'Stephen Strange', status: 'ACTIVE', class: 'Business', farebasis: 'JPRO',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'KTM', dest: 'MCT',
      segments: [{ flight: '576', origin: 'KTM', dest: 'DXB', date: DATES.TODAY, time: '02:30', status: 'FLOWN' }, { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'ACTIVE' }]
    },
    { 
      id: 'c4', pnr: 'CONN14', name: 'Bruce Wayne', status: 'ACTIVE', class: 'Business', farebasis: 'JNOW',
      flight: '101', date: DATES.YESTERDAY, time: '08:00', origin: 'LHR', dest: 'MCT',
      segments: [{ flight: '001', origin: 'LHR', dest: 'DXB', date: getRelativeDate(-2), time: '22:00', status: 'FLOWN' }, { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.YESTERDAY, time: '08:00', status: 'ACTIVE' }]
    },
    { 
      id: 'c5', pnr: 'CONN16', name: 'Clark Kent', status: 'ACTIVE', class: 'Economy', farebasis: 'YFLEX',
      flight: '101', date: DATES.TOMORROW, time: '08:00', origin: 'KWI', dest: 'MCT',
      segments: [{ flight: '055', origin: 'KWI', dest: 'DXB', date: DATES.TOMORROW, time: '05:00', status: 'FLOWN' }, { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TOMORROW, time: '08:00', status: 'ACTIVE' }]
    }
  ],
  roundtrip: [
    { 
      id: 'r1', pnr: 'RT9911', name: 'James Bond', status: 'BOARDED', class: 'Business', farebasis: 'J12RT',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT',
      outbound: { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'BOARDED' },
      inbound: { flight: '102', origin: 'MCT', dest: 'DXB', date: DATES.NEXT_WEEK, time: '14:00', status: 'CONFIRMED' }
    },
    { 
      id: 'r2', pnr: 'RT8822', name: 'Jason Bourne', status: 'ACTIVE', class: 'Economy', farebasis: 'YFLEX',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT',
      outbound: { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'ACTIVE' },
      inbound: { flight: '108', origin: 'MCT', dest: 'DXB', date: getRelativeDate(5), time: '10:30', status: 'CONFIRMED' }
    },
    { 
      id: 'r5', pnr: 'RT5566', name: 'Lara Croft', status: 'ACTIVE', class: 'Economy', farebasis: 'YSAVER',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'DXB', dest: 'MCT',
      outbound: { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'ACTIVE' },
      inbound: { flight: '102', origin: 'MCT', dest: 'DXB', date: getRelativeDate(10), time: '16:45', status: 'CONFIRMED' }
    },
    { 
      id: 'r6', pnr: 'RET001', name: 'Indiana Jones', status: 'ACTIVE', class: 'Economy', farebasis: 'YSAVER',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'MCT', dest: 'DXB',
      outbound: { flight: '102', origin: 'MCT', dest: 'DXB', date: getRelativeDate(-5), time: '10:00', status: 'FLOWN' },
      inbound: { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'ACTIVE' } 
    },
    { 
      id: 'r7', pnr: 'RET002', name: 'Marty Byrde', status: 'ACTIVE', class: 'Business', farebasis: 'JPRO',
      flight: '101', date: DATES.TODAY, time: '08:00', origin: 'MCT', dest: 'DXB',
      outbound: { flight: '102', origin: 'MCT', dest: 'DXB', date: getRelativeDate(-3), time: '12:00', status: 'FLOWN' },
      inbound: { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TODAY, time: '08:00', status: 'ACTIVE' } 
    },
    { 
      id: 'r3', pnr: 'RT1401', name: 'Jack Reacher', status: 'ACTIVE', class: 'Economy', farebasis: 'YSAVER',
      flight: '101', date: DATES.YESTERDAY, time: '08:00', origin: 'DXB', dest: 'MCT',
      outbound: { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.YESTERDAY, time: '08:00', status: 'ACTIVE' },
      inbound: { flight: '102', origin: 'MCT', dest: 'DXB', date: getRelativeDate(6), time: '09:15', status: 'CONFIRMED' }
    },
    { 
      id: 'r4', pnr: 'RT1601', name: 'Sherlock Holmes', status: 'ACTIVE', class: 'First', farebasis: 'FPRO',
      flight: '101', date: DATES.TOMORROW, time: '08:00', origin: 'DXB', dest: 'MCT',
      outbound: { flight: '101', origin: 'DXB', dest: 'MCT', date: DATES.TOMORROW, time: '08:00', status: 'ACTIVE' },
      inbound: { flight: '102', origin: 'MCT', dest: 'DXB', date: getRelativeDate(4), time: '20:00', status: 'CONFIRMED' }
    },
    { 
      id: 'r8', pnr: 'CONRT01', name: 'Bilbo Baggins', status: 'ACTIVE', class: 'Economy', farebasis: 'YFLEX',
      flight: '101', date: '2025-11-24', time: '08:00', origin: 'KTM', dest: 'MCT',
      outbound: { flight: '576/101', origin: 'KTM', dest: 'MCT', date: '2025-11-24', time: '00:30', status: 'ACTIVE' },
      inbound: { flight: '102/575', origin: 'MCT', dest: 'KTM', date: '2025-11-30', time: '14:00', status: 'CONFIRMED' }
    },
    { 
      id: 'r9', pnr: 'CONRT02', name: 'Frodo Baggins', status: 'ACTIVE', class: 'Economy', farebasis: 'YFLEX',
      flight: '101', date: '2025-11-24', time: '08:00', origin: 'MCT', dest: 'BOM',
      outbound: { flight: '102/575', origin: 'MCT', dest: 'BOM', date: '2025-11-20', time: '10:00', status: 'FLOWN' },
      inbound: { flight: '501/101', origin: 'BOM', dest: 'MCT', date: '2025-11-24', time: '04:00', status: 'ACTIVE' }
    },
    { 
      id: 'r10', pnr: 'CONRT03', name: 'Samwise Gamgee', status: 'ACTIVE', class: 'Economy', farebasis: 'YSAVER',
      flight: '101', date: '2025-11-25', time: '08:00', origin: 'MCT', dest: 'BOM',
      outbound: { flight: '102/575', origin: 'MCT', dest: 'BOM', date: '2025-11-21', time: '10:00', status: 'FLOWN' },
      inbound: { flight: '501/101', origin: 'BOM', dest: 'MCT', date: '2025-11-25', time: '04:00', status: 'ACTIVE' }
    }
  ]
};

const MOCK_PNR_DATA = {
  pnr: 'H772KL',
  passengers: [
    { id: 'px1', name: 'Bruce Wayne', type: 'Adult' },
    { id: 'px2', name: 'Damian Wayne', type: 'Child' }
  ],
  journeyType: 'Connecting',
  segments: [
    { flight: '201', origin: 'DXB', dest: 'BOM', date: DATES.NEXT_WEEK, time: '08:30', status: 'CONFIRMED' },
    { flight: '404', origin: 'BOM', dest: 'DEL', date: DATES.NEXT_WEEK, time: '16:45', status: 'IMPACTED' }
  ]
};

// --- Shared Components ---
const StatusBadge = ({ status }) => {
  let styles = 'bg-gray-100 text-gray-800 border-gray-200';
  let icon = null;
  switch (status) {
    case 'ACTIVE': styles = 'bg-emerald-50 text-emerald-700 border-emerald-200'; icon = <CheckCircle className="w-3 h-3 mr-1" />; break;
    case 'CHECKED-IN': styles = 'bg-blue-50 text-blue-700 border-blue-200'; icon = <User className="w-3 h-3 mr-1" />; break;
    case 'BOARDED': styles = 'bg-purple-50 text-purple-700 border-purple-200'; icon = <Plane className="w-3 h-3 mr-1" />; break;
    case 'IMPACTED': styles = 'bg-orange-50 text-orange-700 border-orange-200'; icon = <AlertTriangle className="w-3 h-3 mr-1" />; break;
    case 'CANCELLED': styles = 'bg-red-50 text-red-700 border-red-200'; icon = <XCircle className="w-3 h-3 mr-1" />; break;
    case 'TICKET ISSUED': styles = 'bg-emerald-50 text-emerald-700 border-emerald-200'; icon = <CheckCircle2 className="w-3 h-3 mr-1" />; break;
    default: break;
  }
  return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-sm ${styles}`}>{icon}{status}</span>);
};

// --- Dashboard Component ---
const Dashboard = ({ recentRuns = [] }) => {
  const [progress, setProgress] = useState(45);
  const [processedCount, setProcessedCount] = useState(1240);

  useEffect(() => {
    const interval = setInterval(() => {
      setProcessedCount(prev => prev + Math.floor(Math.random() * 3));
      setProgress(prev => Math.min(prev + 0.1, 100));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const totalImpacted = 2850;
  
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Impacted</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-1">{totalImpacted.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-400">As of today 08:00 AM</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Processed</p>
              <h3 className="text-3xl font-bold text-blue-900 mt-1">{processedCount.toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-900" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-green-600 font-medium">
            <TrendingUp className="w-3 h-3 mr-1" /> +12% since last hour
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Pending</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-1">{(totalImpacted - processedCount).toLocaleString()}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
           <div className="mt-4 text-xs text-slate-400">Requires manual review</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-500">Failed/Error</p>
              <h3 className="text-3xl font-bold text-slate-700 mt-1">12</h3>
            </div>
            <div className="p-2 bg-slate-100 rounded-lg">
              <XCircle className="w-6 h-6 text-slate-500" />
            </div>
          </div>
           <div className="mt-4 text-xs text-red-500 font-medium">Action Required</div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Zap className="w-5 h-5 text-orange-500 mr-2 fill-current" />
              Live Issuance Progress
            </h3>
            <p className="text-sm text-slate-500 mt-1">Real-time tracking of ticket re-issuance for current disruption event</p>
          </div>
          <div className="text-2xl font-bold text-blue-900">{progress.toFixed(1)}%</div>
        </div>
        
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-900 to-blue-600 transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
          <span>Started: 08:00 AM</span>
          <span>ETA: 10:45 AM</span>
        </div>
      </div>

      {/* Live Transaction Monitor */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-600"/> Live Transaction Monitor</h3>
         </div>
         <div className="flex-1 overflow-y-auto max-h-[300px] p-2 space-y-2">
            {recentRuns.length === 0 ? (
                <div className="text-center text-slate-400 py-8 text-sm">No active runs</div>
            ) : (
                recentRuns.map((run) => (
                    <div key={run.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3 animate-in fade-in slide-in-from-right-4">
                         <div className="flex justify-between items-center mb-2">
                             <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded">{run.id}</span>
                             <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">{run.status}</span>
                         </div>
                         <div className="flex justify-between items-center text-xs text-slate-600">
                             <span>{run.paxCount} Pax</span>
                             <span className="font-mono">{run.timestamp}</span>
                         </div>
                         {run.status === 'Processing' && (
                             <div className="mt-2 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                 <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
                             </div>
                         )}
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
};

export default function PassengerTicketIssuance() {
  const [view, setView] = useState('operations');
  const [mode, setMode] = useState('flight');
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [issuedTickets, setIssuedTickets] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeDateTab, setActiveDateTab] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recentRuns, setRecentRuns] = useState([]); 
  const [currentRunId, setCurrentRunId] = useState(null);
  const [expandedRunId, setExpandedRunId] = useState(null);
  const [errors, setErrors] = useState({}); 

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // UI State for custom dropdowns
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const dayDropdownRef = useRef(null);

  // Filters state initialized to empty
  const [filters, setFilters] = useState({
    flightNo: '', 
    origin: '',
    dest: '',
    dateFrom: '', 
    dateTo: '', 
    daysOfWeek: [],
    status: 'ALL'
  });

  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dayDropdownRef.current && !dayDropdownRef.current.contains(event.target)) {
        setIsDayDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [hasSearched, activeDateTab, filters]);

  const toggleDayOfWeek = (day) => {
    setFilters(prev => {
      if (day === 'ALL') {
        const allSelected = prev.daysOfWeek.length === DAYS.length;
        return { ...prev, daysOfWeek: allSelected ? [] : [...DAYS] };
      }

      const currentDays = prev.daysOfWeek;
      if (currentDays.includes(day)) {
        return { ...prev, daysOfWeek: currentDays.filter(d => d !== day) };
      } else {
        return { ...prev, daysOfWeek: [...currentDays, day] };
      }
    });
  };

  // Helper to check if item matches criteria
  const matchesCriteria = (item, criteria) => {
    if (criteria.flightNo) {
        const searchFlight = criteria.flightNo.toLowerCase();
        const flightMatch = item.flight?.toLowerCase().includes(searchFlight) ||
                            item.segments?.some(s => s.flight.toLowerCase().includes(searchFlight)) ||
                            item.outbound?.flight.toLowerCase().includes(searchFlight) ||
                            item.inbound?.flight.toLowerCase().includes(searchFlight);
        if (!flightMatch) return false;
    }

    if (item.date) {
        const itemDate = new Date(item.date);
        
        // Use parsed filter dates for comparison
        const fromDate = parseDisplayDate(criteria.dateFrom);
        const toDate = parseDisplayDate(criteria.dateTo);

        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;

        // Day of Week
        if (criteria.daysOfWeek && criteria.daysOfWeek.length > 0) {
          const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = daysMap[itemDate.getDay()];
          if (!criteria.daysOfWeek.includes(dayName)) return false;
        }
    }

    return true;
  };

  // Derived filtered results
  const getAllFilteredResults = () => {
    const all = [
      ...MOCK_FLIGHT_RESULTS.ptp,
      ...MOCK_FLIGHT_RESULTS.connecting,
      ...MOCK_FLIGHT_RESULTS.roundtrip
    ];
    return all.filter(p => matchesCriteria(p, filters));
  };

  const handleSearch = () => {
    const newErrors = {};
    
    // Check existing validation errors first
    if (errors.flightNo || errors.origin || errors.dest) {
        return; // Stop if there are active input errors
    }

    if (!filters.flightNo) {
       newErrors.flightNo = "Flight number is mandatory";
    }
    
    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
    }
    setErrors({});

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasSearched(true);
      setIssuedTickets(null);
      setSelectedIds(new Set());
      setActiveDateTab(null);
    }, 800);
  };

  const toggleSelection = (id, status) => {
    if (status !== 'ACTIVE') return; 
    
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };

  const selectAll = (groupData) => {
    const activePassengers = groupData.filter(p => p.status === 'ACTIVE');
    const ids = activePassengers.map(p => p.id);
    
    const newSelection = new Set(selectedIds);
    const allSelected = ids.every(id => newSelection.has(id));
    
    ids.forEach(id => {
      if (allSelected) newSelection.delete(id);
      else newSelection.add(id);
    });
    setSelectedIds(newSelection);
  };

  const handleIssueTicket = () => {
     setShowConfirmation(true);
  };

  const confirmIssuance = () => {
    setShowConfirmation(false);
    setIsLoading(true);
    
    const newRunId = Array(10).fill(0).map(() => Math.random().toString(36).charAt(2)).join('').toUpperCase();
    setCurrentRunId(newRunId);

    const pendingRun = {
        id: newRunId,
        status: 'Processing',
        paxCount: selectedIds.size,
        timestamp: new Date().toLocaleTimeString(),
        filters: { ...filters },
        tickets: []
    };

    setRecentRuns(prev => [pendingRun, ...prev]);

    setTimeout(() => {
      const pnrMapping = {}; 
      const allSourcePassengers = [ ...MOCK_FLIGHT_RESULTS.ptp, ...MOCK_FLIGHT_RESULTS.connecting, ...MOCK_FLIGHT_RESULTS.roundtrip, ...MOCK_PNR_DATA.passengers ];
      const searchFlightNo = filters.flightNo;

      const newTickets = Array.from(selectedIds).map(id => {
        let p = allSourcePassengers.find(x => x.id === id);
        let oldPnr, name;

        if (p) {
            oldPnr = p.pnr;
            name = p.name;
        } else {
            const pnrPassenger = MOCK_PNR_DATA.passengers.find(x => x.id === id);
            oldPnr = pnrPassenger ? MOCK_PNR_DATA.pnr : 'UNKNOWN';
            name = pnrPassenger ? pnrPassenger.name : 'Unknown';
        }

        if (!pnrMapping[oldPnr]) pnrMapping[oldPnr] = 'R' + Math.floor(Math.random() * 90000 + 10000);
        
        // --- Logic for Flights and Coupons ---
        let flightStr = '';
        let couponStr = '1';

        if (p) {
            if (p.outbound && p.inbound) {
                // Roundtrip Logic with Intelligent Splitting
                const isOutboundImpacted = p.outbound.flight.includes(searchFlightNo);
                const isInboundImpacted = p.inbound.flight.includes(searchFlightNo);

                if (isOutboundImpacted && !isInboundImpacted) {
                    // CASE: Only Outbound is impacted -> Move Outbound (Split PNR)
                    flightStr = p.outbound.flight;
                    // Count segments in the split leg (e.g. 102/575 = 2 segments)
                    const legs = p.outbound.flight.split('/').length;
                    couponStr = Array.from({length: legs}, (_, i) => i + 1).join(', ');
                } else if (isInboundImpacted && !isOutboundImpacted) {
                    // CASE: Only Inbound is impacted -> Move Inbound (Split PNR)
                    flightStr = p.inbound.flight;
                    const legs = p.inbound.flight.split('/').length;
                    couponStr = Array.from({length: legs}, (_, i) => i + 1).join(', ');
                } else {
                    // CASE: Both impacted or generic -> Move Whole Roundtrip
                    flightStr = `${p.outbound.flight} - ${p.inbound.flight}`;
                    const outLegs = p.outbound.flight.split('/').length;
                    const inLegs = p.inbound.flight.split('/').length;
                    const totalLegs = outLegs + inLegs;
                    couponStr = Array.from({length: totalLegs}, (_, i) => i + 1).join(', ');
                }
            } else if (p.segments && p.segments.length > 0) {
                // Connecting (One Way)
                flightStr = p.segments.map(s => s.flight).join(' / ');
                couponStr = p.segments.map((_, i) => i + 1).join(', '); 
            } else {
                // PTP
                flightStr = p.flight;
                couponStr = '1';
            }
        } else {
             // Fallback for unknown PNR data
             flightStr = '' + Math.floor(Math.random() * 900);
             couponStr = '1';
        }

        return {
          oldPnr: oldPnr,
          name: name,
          newPnr: pnrMapping[oldPnr],
          ticketNo: '141-' + Math.floor(Math.random() * 9000000000), 
          coupon: couponStr,
          flight: flightStr,
          status: 'TICKET ISSUED',
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
      });
      
      setIssuedTickets(newTickets);
      setIsLoading(false);
      setRecentRuns(prev => prev.map(r => r.id === newRunId ? { ...r, status: 'Completed', tickets: newTickets } : r));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  const getSelectionSummaryByDate = () => {
      const summary = {};
      
      // Flatten source data with type info
      const allPassengers = [
          ...MOCK_FLIGHT_RESULTS.ptp.map(p => ({...p, type: 'Point-to-Point'})),
          ...MOCK_FLIGHT_RESULTS.connecting.map(p => ({...p, type: 'Connection'})),
          ...MOCK_FLIGHT_RESULTS.roundtrip.map(p => ({...p, type: 'Roundtrip'}))
      ];

      selectedIds.forEach(id => {
          const passenger = allPassengers.find(p => p.id === id);
          if (passenger) {
              const date = passenger.date;
              if (!summary[date]) {
                  summary[date] = { ptp: 0, conn: 0, rt: 0, total: 0 };
              }
              
              if (passenger.type === 'Point-to-Point') summary[date].ptp++;
              else if (passenger.type === 'Connection') summary[date].conn++;
              else if (passenger.type === 'Roundtrip') summary[date].rt++;
              
              summary[date].total++;
          }
      });
      
      return summary;
  };

  const renderConfirmationModal = () => {
      if (!showConfirmation) return null;
      const summary = getSelectionSummaryByDate();
      const totalSelected = selectedIds.size;
      
      const sortedSummaryEntries = Object.entries(summary).sort(([dateA], [dateB]) => {
          return new Date(dateA) - new Date(dateB);
      });

      return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform scale-100 transition-transform">
                  <div className="bg-blue-900 p-4 flex items-center justify-between">
                      <h3 className="text-white font-bold text-lg flex items-center">
                          <Ticket className="w-5 h-5 mr-2" />
                          Confirm Ticket Issuance
                      </h3>
                      <button onClick={() => setShowConfirmation(false)} className="text-white/80 hover:text-white">
                          <XCircle className="w-5 h-5" />
                      </button>
                  </div>
                  
                  <div className="p-6">
                      <div className="flex items-start mb-6 text-slate-600 bg-blue-50 p-4 rounded-xl border border-blue-100">
                           <Info className="w-5 h-5 text-blue-900 mr-3 flex-shrink-0 mt-0.5" />
                           <div>
                               <p className="text-sm font-medium text-blue-900 mb-1">Issuance Summary</p>
                               <p className="text-sm text-blue-800/80">You are about to issue tickets for <strong>{totalSelected}</strong> passenger(s). Please review the breakdown by date below.</p>
                           </div>
                      </div>

                      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
                          <table className="min-w-full divide-y divide-slate-200">
                              <thead className="bg-slate-50">
                                  <tr>
                                      <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Flight Date</th>
                                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">PTP</th>
                                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Connection</th>
                                      <th className="px-4 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Roundtrip</th>
                                      <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200">
                                  {sortedSummaryEntries.map(([date, counts]) => (
                                      <tr key={date} className="hover:bg-slate-50/50">
                                          <td className="px-4 py-3 text-sm font-medium text-slate-900">{formatDisplayDate(date)}</td>
                                          <td className="px-4 py-3 text-center text-sm text-slate-600">{counts.ptp}</td>
                                          <td className="px-4 py-3 text-center text-sm text-slate-600">{counts.conn}</td>
                                          <td className="px-4 py-3 text-center text-sm text-slate-600">{counts.rt}</td>
                                          <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">{counts.total}</td>
                                      </tr>
                                  ))}
                                  <tr className="bg-slate-50 font-bold">
                                      <td className="px-4 py-3 text-sm text-slate-900">Grand Total</td>
                                      <td className="px-4 py-3 text-center text-sm text-slate-900">
                                          {Object.values(summary).reduce((acc, curr) => acc + curr.ptp, 0)}
                                      </td>
                                      <td className="px-4 py-3 text-center text-sm text-slate-900">
                                          {Object.values(summary).reduce((acc, curr) => acc + curr.conn, 0)}
                                      </td>
                                      <td className="px-4 py-3 text-center text-sm text-slate-900">
                                          {Object.values(summary).reduce((acc, curr) => acc + curr.rt, 0)}
                                      </td>
                                      <td className="px-4 py-3 text-right text-sm text-blue-900">
                                          {totalSelected}
                                      </td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>

                      <div className="flex space-x-3">
                          <button 
                              onClick={() => setShowConfirmation(false)}
                              autoFocus
                              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md ring-2 ring-orange-200 ring-offset-1"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={confirmIssuance}
                              className="flex-1 bg-white border-2 border-slate-200 hover:border-blue-900 text-slate-700 hover:text-blue-900 font-bold py-3 px-4 rounded-xl transition-all"
                          >
                              Proceed
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  };

  const renderFlightSearchFilters = () => {
    // Dynamic Mandatory Mark: Only show on Org/Dest if Flight No is Empty
    const showMandatoryMark = !filters.flightNo;

    return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 animate-in slide-in-from-top-4 duration-500">
      <div className="flex items-center space-x-2 mb-4 text-slate-800">
         <Filter className="w-5 h-5 text-blue-900" />
         <h3 className="font-semibold text-lg">Search Criteria</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="col-span-1 space-y-1">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Flight Number <span className="text-red-500">*</span></label>
           <div className="relative">
             <Plane className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
             <input 
                type="text" 
                placeholder="E.G. 101" 
                className={`pl-10 w-full border bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 transition-all ${errors.flightNo ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`} 
                value={filters.flightNo} 
                onChange={(e) => {
                    const val = e.target.value;
                    // Validation: Only Numbers
                    if (val && !/^\d*$/.test(val)) {
                        setErrors(prev => ({...prev, flightNo: "Numbers only"}));
                        return;
                    }

                    setFilters({...filters, flightNo: val});
                    if (val) setErrors(prev => {
                        const newErr = {...prev};
                        delete newErr.flightNo;
                        return newErr;
                    });
                }} 
             />
           </div>
           {errors.flightNo && <p className="text-xs text-red-500 mt-1 flex items-center animate-in slide-in-from-top-1"><AlertCircle className="w-3 h-3 mr-1"/> {errors.flightNo}</p>}
        </div>
        
        <div className="col-span-1 space-y-1">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Origin {showMandatoryMark && <span className="text-red-500">*</span>}</label>
           <input 
             type="text" 
             placeholder="DXB" 
             className={`w-full border bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 transition-all ${errors.origin ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
             value={filters.origin}
             onChange={(e) => {
                 const val = e.target.value.toUpperCase();
                 // Validation: Only Alphabets
                 if (val && !/^[A-Z]*$/.test(val)) {
                     setErrors(prev => ({...prev, origin: "Alphabets only"}));
                     return;
                 }

                 setFilters({...filters, origin: val});
                 if (val) setErrors(prev => {
                    const newErr = {...prev};
                    delete newErr.origin;
                    return newErr;
                });
             }}
           />
           {errors.origin && <p className="text-xs text-red-500 mt-1 flex items-center animate-in slide-in-from-top-1"><AlertCircle className="w-3 h-3 mr-1"/> {errors.origin}</p>}
        </div>

        <div className="col-span-1 space-y-1">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destination {showMandatoryMark && <span className="text-red-500">*</span>}</label>
           <input 
             type="text" 
             placeholder="MCT" 
             className={`w-full border bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 transition-all ${errors.dest ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-200'}`}
             value={filters.dest}
             onChange={(e) => {
                 const val = e.target.value.toUpperCase();
                 // Validation: Only Alphabets
                 if (val && !/^[A-Z]*$/.test(val)) {
                     setErrors(prev => ({...prev, dest: "Alphabets only"}));
                     return;
                 }

                 setFilters({...filters, dest: val});
                 if (val) setErrors(prev => {
                    const newErr = {...prev};
                    delete newErr.dest;
                    return newErr;
                });
             }}
           />
           {errors.dest && <p className="text-xs text-red-500 mt-1 flex items-center animate-in slide-in-from-top-1"><AlertCircle className="w-3 h-3 mr-1"/> {errors.dest}</p>}
        </div>

        <div className="col-span-1 space-y-1">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Status</label>
           <select className="w-full border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 transition-all appearance-none cursor-pointer">
             <option>All Statuses</option>
             <option>Active</option>
             <option>Cancelled</option>
             <option>NOOP</option>
           </select>
        </div>

        {/* Date From */}
        <div className="col-span-1 space-y-1">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date From <span className="text-red-500">*</span></label>
           <div className="relative">
             <CustomDatePicker 
                value={filters.dateFrom} 
                onChange={(val) => setFilters({...filters, dateFrom: val})} 
                placeholder="DD-MMM-YY"
             />
           </div>
        </div>

        {/* Date To */}
        <div className="col-span-1 space-y-1">
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Date To <span className="text-red-500">*</span></label>
           <div className="relative">
             <CustomDatePicker 
                value={filters.dateTo} 
                onChange={(val) => setFilters({...filters, dateTo: val})} 
                placeholder="DD-MMM-YY"
             />
           </div>
        </div>

        {/* Day of Week Multi-Select */}
        <div className="col-span-1 space-y-1" ref={dayDropdownRef}>
           <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Days of Week</label>
           <div className="relative">
             <button 
               type="button"
               onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
               className="w-full text-left border border-slate-200 bg-slate-50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm py-2.5 px-3 transition-all flex justify-between items-center"
             >
               <span className={`block truncate ${filters.daysOfWeek.length === 0 ? 'text-gray-400' : 'text-slate-900'}`}>
                 {filters.daysOfWeek.length === 0 
                   ? 'SELECT DAYS' 
                   : filters.daysOfWeek.length === DAYS.length 
                        ? 'ALL DAYS'
                        : filters.daysOfWeek.map(day => day.substring(0, 3)).join(', ')}
               </span>
               <ChevronDown className="h-4 w-4 text-slate-400" />
             </button>
             
             {isDayDropdownOpen && (
               <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                 {/* ALL Option */}
                 <div 
                    className="flex items-center px-4 py-2 hover:bg-slate-100 cursor-pointer border-b border-slate-100 bg-slate-50"
                    onClick={() => toggleDayOfWeek('ALL')}
                 >
                     <input
                       type="checkbox"
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       checked={filters.daysOfWeek.length === DAYS.length}
                       readOnly
                     />
                     <label className="ml-3 block text-slate-900 font-bold cursor-pointer">
                       ALL
                     </label>
                 </div>

                 {DAYS.map((day) => (
                   <div 
                    key={day}
                    className="flex items-center px-4 py-2 hover:bg-slate-100 cursor-pointer"
                    onClick={() => toggleDayOfWeek(day)}
                   >
                     <input
                       type="checkbox"
                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                       checked={filters.daysOfWeek.includes(day)}
                       readOnly
                     />
                     <label className="ml-3 block text-slate-900 cursor-pointer">
                       {day}
                     </label>
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>

        <div className="col-span-1 flex items-end">
          <button onClick={handleSearch} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center">
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
            Search
          </button>
        </div>
      </div>
    </div>
  )};

  const renderSectionHeader = (title, count, groupData) => (
      <tr className="bg-slate-100 border-y border-slate-200">
         <td colSpan="9" className="px-6 py-3">
             <div className="flex items-center justify-between">
                 <div className="flex items-center">
                    <span className="text-sm font-bold text-slate-700 uppercase tracking-wider">{title}</span>
                    <span className="ml-2 bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
                 </div>
                 {count > 0 && (
                     <button 
                        onClick={() => selectAll(groupData)}
                        className="text-xs text-blue-600 font-bold hover:underline"
                     >
                         Select Active Only
                     </button>
                 )}
             </div>
         </td>
      </tr>
  );

  const renderFlightResultsTable = () => {
    const allResults = getAllFilteredResults();
    
    // 1. Extract Unique Dates for Tabs
    const uniqueDates = [...new Set(allResults.map(p => p.date))].sort();
    
    // 2. Set default active tab if not set
    if (!activeDateTab && uniqueDates.length > 0) {
        setActiveDateTab(uniqueDates[0]);
        return null; // Wait for state update to re-render
    } else if (uniqueDates.length === 0 && allResults.length > 0 && !activeDateTab) {
       // Fallback if no dates found (unlikely with mock data)
    }

    // 3. Filter results based on Active Tab
    const resultsForTab = allResults.filter(p => p.date === activeDateTab);

    // 4. Sort and Prepare Data for Pagination (Flattened with Types)
    const cabinPriority = { 'First': 1, 'Business': 2, 'Economy': 3 };
    const sorter = (a, b) => {
        const prioA = cabinPriority[a.class] || 99;
        const prioB = cabinPriority[b.class] || 99;
        if (prioA !== prioB) return prioA - prioB;
        return a.pnr.localeCompare(b.pnr);
    };

    // Group and Sort
    const ptp = resultsForTab.filter(p => MOCK_FLIGHT_RESULTS.ptp.some(pt => pt.id === p.id)).sort(sorter).map(p => ({...p, type: 'Point-to-Point'}));
    // Rename 'Connecting' to 'Connection' in group type
    const connecting = resultsForTab.filter(p => MOCK_FLIGHT_RESULTS.connecting.some(c => c.id === p.id)).sort(sorter).map(p => ({...p, type: 'Connection'}));
    const roundtrip = resultsForTab.filter(p => MOCK_FLIGHT_RESULTS.roundtrip.some(r => r.id === p.id)).sort(sorter).map(p => ({...p, type: 'Roundtrip'}));

    // Combine into one list for pagination
    const allSortedData = [...ptp, ...connecting, ...roundtrip];
    const totalCount = allSortedData.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Slice for current page
    const paginatedData = allSortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Helper to render individual rows
    const renderRows = (passengers) => {
        if (passengers.length === 0) return null;
        return passengers.map((p) => {
            const isSelectable = p.status === 'ACTIVE';
            
            let flightDisplay = filters.flightNo || p.flight;
            let dateDisplay = (
                <>
                    <div className="text-xs text-slate-600 font-medium">{formatDisplayDate(p.date)}</div>
                    <div className="text-xs text-slate-400">{p.time}</div>
                </>
            );

            if (p.segments && p.segments.length > 0) {
                // Connecting logic
                const searchFlight = filters.flightNo;
                
                // Highlight Impacted Segment
                flightDisplay = (
                    <div className="flex flex-wrap gap-1">
                        {p.segments.map((s, idx) => {
                            const isImpacted = s.flight.includes(searchFlight) || searchFlight.includes(s.flight);
                            return (
                                <React.Fragment key={idx}>
                                    <span className={isImpacted ? "text-red-600 font-bold" : ""}>{s.flight}</span>
                                    {idx < p.segments.length - 1 && <span className="text-slate-400">/</span>}
                                </React.Fragment>
                            );
                        })}
                    </div>
                );

                // Date Display for Connecting (Display all segments ordered)
                dateDisplay = (
                    <div className="flex flex-col space-y-1.5">
                        {p.segments.map((seg, idx) => {
                            const isImpacted = seg.flight.includes(searchFlight) || searchFlight.includes(seg.flight);
                            return (
                                <div key={idx} className={`flex flex-col ${idx > 0 ? 'border-t border-slate-100 pt-1' : ''}`}>
                                    <div className={`text-xs ${isImpacted ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}`}>
                                        {formatDisplayDate(seg.date)} <span className={`${isImpacted ? 'text-red-700' : 'text-slate-400'} font-normal ml-1`}>{seg.time}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                );
            }
            else if (p.outbound && p.inbound) {
                // Roundtrip Logic
                const impactedFlightNo = filters.flightNo || p.flight;
                const isOutboundImpacted = p.outbound.flight.includes(impactedFlightNo) || impactedFlightNo.includes(p.outbound.flight);
                const isInboundImpacted = p.inbound.flight.includes(impactedFlightNo);

                flightDisplay = (
                    <span>
                        <span className={isOutboundImpacted ? "text-red-600 font-bold" : ""}>{p.outbound.flight}</span>
                        <span className="text-slate-400 mx-1">/</span>
                        <span className={isInboundImpacted ? "text-red-600 font-bold" : ""}>{p.inbound.flight}</span>
                    </span>
                );

                dateDisplay = (
                    <div className="flex flex-col space-y-1.5">
                        {/* Outbound Date/Time */}
                        <div className="flex flex-col">
                            <div className={`text-xs ${isOutboundImpacted ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}`}>
                                {formatDisplayDate(p.outbound.date)} <span className={`${isOutboundImpacted ? 'text-red-700' : 'text-slate-400'} font-normal ml-1`}>{p.outbound.time}</span>
                            </div>
                        </div>
                        {/* Inbound Date/Time */}
                        <div className="flex flex-col border-t border-slate-100 pt-1">
                            <div className={`text-xs ${isInboundImpacted ? 'text-red-700 font-bold' : 'text-slate-600 font-medium'}`}>
                                {formatDisplayDate(p.inbound.date)} <span className={`${isInboundImpacted ? 'text-red-700' : 'text-slate-400'} font-normal ml-1`}>{p.inbound.time}</span>
                            </div>
                        </div>
                    </div>
                );
            }

            return (
            <tr 
                key={p.id} 
                onClick={() => toggleSelection(p.id, p.status)}
                className={`transition-colors border-b border-slate-50 last:border-b-0 ${isSelectable ? 'hover:bg-slate-50 cursor-pointer' : 'opacity-75 bg-slate-50 cursor-not-allowed'}`}
                title={!isSelectable ? "Passenger should be offloaded in the impacted flight" : ""}
            >
                <td className="px-6 py-4 whitespace-nowrap w-10 align-top pt-5">
                    <div className="relative group">
                            <input 
                            type="checkbox" 
                            className={`rounded border-gray-300 h-4 w-4 pointer-events-none ${isSelectable ? 'text-blue-600 focus:ring-blue-500' : 'text-gray-400 bg-gray-100'}`}
                            checked={selectedIds.has(p.id)}
                            disabled={!isSelectable}
                            readOnly
                        />
                        {!isSelectable && (
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-max hidden group-hover:flex items-center bg-slate-800 text-white text-xs px-2 py-1 rounded shadow-lg z-10">
                                <Ban className="w-3 h-3 mr-1 text-red-400" />
                                Must Offload
                            </div>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded w-fit whitespace-pre">
                        {flightDisplay}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                    {dateDisplay}
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm font-mono font-bold text-blue-900">{p.pnr}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="text-sm font-bold text-slate-900">{p.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        p.class === 'First' ? 'bg-purple-100 text-purple-800' :
                        p.class === 'Business' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                    }`}>
                    {p.class}
                    </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                    <StatusBadge status={p.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-mono align-top">
                    {p.farebasis}
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-top">
                    <div className="flex flex-col text-sm text-slate-700">
                    <div className="flex items-center font-bold">
                        <span>{p.origin}</span>
                        <ArrowRight className="w-4 h-4 mx-2 text-slate-400" />
                        <span>{p.dest}</span>
                    </div>
                    {p.segments && (
                            <div className="text-xs text-slate-400 mt-1">
                                via {p.segments.find(s => s.dest !== p.dest && s.origin !== p.origin)?.dest || 'Hub'}
                            </div>
                    )}
                    {p.outbound && (
                            <div className="text-xs text-slate-400 mt-1">
                                Roundtrip
                            </div>
                    )}
                    </div>
                </td>
            </tr>
        )});
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
         <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Passenger List</h2>
              <p className="text-slate-500 mt-1">
                {totalCount} total passengers found based on search criteria.
              </p>
            </div>
            <div className="flex items-center space-x-4">
               <button onClick={() => setHasSearched(false)} className="text-slate-500 hover:text-slate-900 font-medium text-sm underline underline-offset-4">Modify Search</button>
            </div>
         </div>

         {/* Date Tabs */}
         {uniqueDates.length > 0 && (
             <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                 {uniqueDates.map(date => {
                     const d = new Date(date);
                     const dayName = d.toLocaleDateString('en-GB', { weekday: 'short' });
                     const dayNum = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                     const isActive = activeDateTab === date;
                     
                     // Count for badge
                     const count = allResults.filter(r => r.date === date).length;

                     return (
                         <button
                            key={date}
                            onClick={() => setActiveDateTab(date)}
                            className={`flex flex-col items-center justify-center min-w-[100px] px-4 py-2 rounded-lg border-2 transition-all ${
                                isActive 
                                ? 'border-blue-900 bg-blue-50 text-blue-900 shadow-sm' 
                                : 'border-transparent bg-white hover:bg-slate-50 text-slate-500'
                            }`}
                         >
                             <span className="text-xs font-bold uppercase">{dayName}</span>
                             <span className="text-sm font-bold">{dayNum}</span>
                             <span className={`mt-1 text-[10px] px-1.5 py-0.5 rounded-full ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                                 {count} Pax
                             </span>
                         </button>
                     );
                 })}
             </div>
         )}

         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px]">
            <div className="overflow-x-auto flex-1">
              <table className="min-w-full divide-y divide-slate-200">
                 <thead className="bg-slate-50">
                    <tr>
                       <th scope="col" className="px-6 py-4 text-left w-12">
                          <div className="h-4 w-4 border rounded border-gray-300 bg-gray-50"></div>
                       </th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Flight #</th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">PNR</th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger Name</th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Booked Cabin</th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger Status</th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Farebasis</th>
                       <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Origin-Destination</th>
                    </tr>
                 </thead>
                 <tbody className="bg-white divide-y divide-slate-200">
                    {paginatedData.map((item, index) => {
                        // Check if we need to render a header for this item
                        const prevItem = index > 0 ? paginatedData[index - 1] : null;
                        // Always show header for first item on page, or if type changes
                        const showHeader = !prevItem || prevItem.type !== item.type;
                        
                        // Count items for this group across all data (for the header badge)
                        const groupCount = allSortedData.filter(d => d.type === item.type).length;
                        // Get raw group data for select all functionality
                        const groupData = allSortedData.filter(d => d.type === item.type);

                        return (
                            <React.Fragment key={item.id}>
                                {showHeader && renderSectionHeader(item.type, groupCount, groupData)}
                                {renderRows([item])}
                            </React.Fragment>
                        );
                    })}

                    {paginatedData.length === 0 && (
                       <tr>
                          <td colSpan="9" className="px-6 py-12 text-center text-slate-500 italic">
                             No passengers found for selected date {activeDateTab}.
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                    <div className="text-sm text-slate-500">
                        Showing <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of <span className="font-bold">{totalCount}</span> results
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border ${currentPage === 1 ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center px-4 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700">
                            Page {currentPage} of {totalPages}
                        </div>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border ${currentPage === totalPages ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
         </div>
      </div>
    );
  };

  const renderPNRSearch = () => (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100 mb-6 text-center animate-in zoom-in-95 duration-500 mt-8">
      <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
        <Ticket className="w-8 h-8 text-blue-900" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-2">Retrieve Booking Journey</h3>
      <p className="text-slate-500 mb-8">Enter the 6-character PNR code to retrieve passenger and flight details.</p>
      
      <div className="flex items-center space-x-3">
        <div className="relative flex-grow group">
          <input 
            type="text" 
            placeholder="H772KL" 
            className="w-full text-2xl font-mono text-center border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 py-4 px-6 uppercase tracking-[0.2em] transition-all"
          />
        </div>
        <button 
          onClick={handleSearch}
          className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center"
        >
           {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Search className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans pb-32">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-18">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center">
                <div className="bg-blue-900 p-2 rounded-lg mr-3">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 leading-tight">Ticketless to Ticket</h1>
                </div>
              </div>

              {/* Main Nav Links */}
              <div className="hidden md:flex space-x-1 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setView('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${view === 'dashboard' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button 
                  onClick={() => setView('operations')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center ${view === 'operations' ? 'bg-white text-blue-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Issuance Operations
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">Reacc user</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-600 font-bold">RU</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {view === 'dashboard' ? (
          <Dashboard />
        ) : (
          /* Operations View */
          <>
            {!issuedTickets && (
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                   <button
                    onClick={() => { setMode('flight'); setHasSearched(false); setSelectedIds(new Set()); }}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${mode === 'flight' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Plane className="w-4 h-4 mr-2" />
                    Flight-Level Search
                  </button>
                  <button
                    onClick={() => { setMode('pnr'); setHasSearched(false); setSelectedIds(new Set()); }}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center ${mode === 'pnr' ? 'bg-blue-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    PNR-Level Search
                  </button>
                </div>
              </div>
            )}

            {issuedTickets ? (
              <div className="animate-in zoom-in-95 duration-500 max-w-5xl mx-auto">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mb-8 flex items-center justify-between shadow-sm">
                   <div className="flex items-center space-x-4">
                      <div className="bg-emerald-100 p-3 rounded-full">
                        <CheckCircle className="w-8 h-8 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-emerald-900 mb-1">Issuance Complete</h2>
                        <p className="text-emerald-700">Successfully processed <span className="font-bold">{issuedTickets.length}</span> tickets.</p>
                        {currentRunId && <span className="text-xs text-emerald-600 font-mono mt-1 block">Event ID: {currentRunId}</span>}
                      </div>
                   </div>
                   <button 
                     onClick={() => { setIssuedTickets(null); setHasSearched(false); setSelectedIds(new Set()); }}
                     className="bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 px-6 py-3 rounded-xl text-sm font-bold shadow-sm transition-all"
                   >
                     Start New Search
                   </button>
                </div>

                {/* --- NEW TRANSACTION SUMMARY TABLE --- */}
                {recentRuns.length > 0 && recentRuns[0].tickets && (
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-slate-200 mb-8">
                         <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                             <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Transaction Summary</h3>
                         </div>
                         <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Event ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Flight</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Route</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Pax Count</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {recentRuns.filter(r => r.tickets).map((run) => (
                                    <tr key={run.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setExpandedRunId(expandedRunId === run.id ? null : run.id)}>
                                        <td className="px-6 py-4 text-sm font-mono font-bold text-blue-900">{run.id}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{run.filters.flightNo}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{run.filters.origin || 'DXB'} <ArrowRight className="w-3 h-3 inline text-slate-400"/> {run.filters.dest || 'MCT'}</td>
                                        <td className="px-6 py-4 text-xs text-slate-500">
                                            {formatDisplayDate(run.filters.dateFrom)} to {formatDisplayDate(run.filters.dateTo)}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-800">{run.paxCount}</td>
                                        <td className="px-6 py-4"><span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">{run.status}</span></td>
                                        <td className="px-6 py-4">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                {expandedRunId === run.id ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                )}

                {/* --- DETAILED TICKET TABLE (Conditioned on expansion) --- */}
                {expandedRunId && (
                    <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-100 animate-in slide-in-from-top-2">
                      <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
                          <h4 className="text-sm font-bold text-blue-900 flex items-center"><List className="w-4 h-4 mr-2"/> Passenger Details for {expandedRunId}</h4>
                      </div>
                      <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50/80">
                          <tr>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Old PNR</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">New PNR</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">New Flights</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Ticket Generated</th>
                            <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {/* Find the specific run to map its tickets */}
                          {recentRuns.find(r => r.id === expandedRunId)?.tickets.map((ticket, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-5 whitespace-nowrap"><div className="text-sm font-bold text-slate-900">{ticket.name}</div></td>
                              <td className="px-8 py-5 whitespace-nowrap"><div className="text-sm font-mono font-medium text-slate-500">{ticket.oldPnr}</div></td>
                              <td className="px-8 py-5 whitespace-nowrap"><span className="text-sm font-mono font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-100">{ticket.newPnr}</span></td>
                               <td className="px-8 py-5 whitespace-nowrap"><div className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit whitespace-pre-wrap max-w-[200px]">{ticket.flight}</div></td>
                              <td className="px-8 py-5 whitespace-nowrap"><div className="text-sm text-emerald-700 font-bold font-mono border border-emerald-200 bg-emerald-50 px-2 py-1 rounded w-fit">{ticket.ticketNo}</div><div className="text-xs text-slate-400 mt-1">Coupon: {ticket.coupon}</div></td>
                              <td className="px-8 py-5 whitespace-nowrap"><span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">{ticket.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                )}
              </div>
            ) : (
              <>
                {!hasSearched && mode === 'flight' && renderFlightSearchFilters()}
                {!hasSearched && mode === 'pnr' && renderPNRSearch()}
                {hasSearched && mode === 'flight' && renderFlightResultsTable()}
                {hasSearched && mode === 'pnr' && (
                   <div className="text-center py-12 text-slate-500">PNR Search view placeholder</div>
                )}
              </>
            )}
          </>
        )}
         {renderConfirmationModal()}
      </main>

      {/* Sticky Action Footer */}
      {!issuedTickets && hasSearched && view === 'operations' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] p-4 z-40 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-3">
               <div className="bg-slate-900 text-white font-mono text-sm px-3 py-1 rounded-md">{selectedIds.size}</div>
               <span className="text-sm font-medium text-slate-600">passengers selected</span>
            </div>
            <div className="flex space-x-4">
              <button onClick={() => { setHasSearched(false); setSelectedIds(new Set()); }} className="px-6 py-3 border border-slate-300 shadow-sm text-sm font-bold rounded-xl text-slate-700 bg-white hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleIssueTicket} disabled={selectedIds.size === 0 || isLoading} className={`px-8 py-3 border border-transparent shadow-lg text-sm font-bold rounded-xl text-white flex items-center transition-all transform active:scale-95 ${selectedIds.size === 0 || isLoading ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:-translate-y-0.5'}`}>{isLoading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Ticket className="w-5 h-5 mr-2" />}Issue Ticket ({selectedIds.size})</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}