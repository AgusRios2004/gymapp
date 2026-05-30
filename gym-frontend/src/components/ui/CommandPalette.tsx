import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, User, Dumbbell, CreditCard, Calendar, X, Hash } from 'lucide-react';
import { getClients } from '../../services/clientService';
import { getRoutines } from '../../services/routineService';
import type { Client, Routine } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch clients and routines when palette is open
  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ['clients-palette'],
    queryFn: () => getClients(true),
    enabled: isOpen,
  });

  const { data: routines = [] } = useQuery<Routine[]>({
    queryKey: ['routines-palette'],
    queryFn: getRoutines,
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  // Filter clients
  const filteredClients = query.trim() === '' ? [] : clients.filter(c => 
    `${c.name} ${c.lastName} ${c.dni}`.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  // Filter routines
  const filteredRoutines = query.trim() === '' ? [] : routines.filter(r => 
    r.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 3);

  // Static actions matching query
  const actions = [
    { title: 'Registrar Pago', path: '/payments', icon: <CreditCard size={18} />, keywords: 'pago cobrar dinero' },
    { title: 'Ver Calendario de Clases', path: '/classes', icon: <Calendar size={18} />, keywords: 'clase horario agenda' },
    { title: 'Crear Nueva Rutina', path: '/routines', icon: <Dumbbell size={18} />, keywords: 'ejercicio entrenar rutina' },
    { title: 'Ver Lista de Alumnos', path: '/clients', icon: <User size={18} />, keywords: 'alumno cliente socio ver' },
  ];

  const filteredActions = query.trim() === '' 
    ? actions 
    : actions.filter(a => 
        a.title.toLowerCase().includes(query.toLowerCase()) || 
        a.keywords.includes(query.toLowerCase())
      );

  const handleSelectPath = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-20 bg-gray-900/60 backdrop-blur-sm flex justify-center items-start">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-gray-150 dark:border-slate-800 shadow-2xl overflow-hidden mt-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input area */}
        <div className="relative flex items-center border-b border-gray-100 dark:border-slate-800 p-4">
          <Search size={22} className="text-gray-400 dark:text-gray-500 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Escribe para buscar... (ej: Juan, Fuerza, Pago)"
            className="w-full bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-400 dark:text-gray-500" />
          </button>
        </div>

        {/* Results area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {query.trim() === '' && (
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 px-2">
              Atajos rápidos
            </p>
          )}

          {/* Quick Actions */}
          {filteredActions.length > 0 && (
            <div className="space-y-1">
              {query.trim() !== '' && (
                <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 px-2 mb-2">
                  Acciones
                </p>
              )}
              {filteredActions.map((action, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => handleSelectPath(action.path)}
                >
                  <div className="p-2 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-xl group-hover:bg-white transition-colors">
                    {action.icon}
                  </div>
                  <span className="font-medium text-sm">{action.title}</span>
                </div>
              ))}
            </div>
          )}

          {/* Clients Results */}
          {filteredClients.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 px-2 mb-2">
                Alumnos
              </p>
              {filteredClients.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => handleSelectPath(`/clients/${c.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-slate-850 text-blue-600 dark:text-blue-400 rounded-xl">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {c.name} {c.lastName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">DNI: {c.dni}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-gray-150 dark:bg-slate-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md font-mono">
                    ir a ficha
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Routines Results */}
          {filteredRoutines.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 px-2 mb-2">
                Rutinas
              </p>
              {filteredRoutines.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3 rounded-2xl cursor-pointer hover:bg-blue-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors"
                  onClick={() => handleSelectPath('/routines')}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 dark:bg-slate-850 text-purple-600 dark:text-purple-400 rounded-xl">
                      <Dumbbell size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">
                        {r.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{r.goal}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {query.trim() !== '' && filteredActions.length === 0 && filteredClients.length === 0 && filteredRoutines.length === 0 && (
            <div className="py-8 text-center text-gray-400 dark:text-gray-500 text-sm italic">
              No se encontraron resultados para "{query}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-gray-50 dark:bg-slate-850/50 px-4 py-3 border-t border-gray-100 dark:border-slate-850 flex justify-between items-center text-[10px] text-gray-400 dark:text-gray-500">
          <span>Presiona <kbd className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 px-1 py-0.5 rounded shadow-sm">ESC</kbd> para cerrar</span>
          <span className="flex items-center gap-1">
            <Hash size={12} /> Búsqueda global activa
          </span>
        </div>
      </div>
    </div>
  );
};
