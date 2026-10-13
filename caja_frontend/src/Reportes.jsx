import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';

export default function Reportes({ cierres = [] }) {
  // Filtro por defecto: 'mes'
  const [filtro, setFiltro] = useState('mes');

  // Filtrar cierres según la opción seleccionada
  const datosFiltrados = useMemo(() => {
    if (!cierres || cierres.length === 0) return [];

    const ahora = new Date();

    return cierres.filter(item => {
      const fechaCierre = new Date(item.fecha + 'T00:00:00');
      if (filtro === 'semana') {
        const hace7Dias = new Date();
        hace7Dias.setDate(ahora.getDate() - 7);
        return fechaCierre >= hace7Dias;
      } else if (filtro === 'mes') {
        return (
          fechaCierre.getMonth() === ahora.getMonth() &&
          fechaCierre.getFullYear() === ahora.getFullYear()
        );
      }
      return true; // 'todos'
    }).reverse(); // Orden cronológico para el gráfico
  }, [cierres, filtro]);

  // Cálculos de Totales KPI
  const kpis = useMemo(() => {
    const ingresos = datosFiltrados.reduce((acc, curr) => acc + Number(curr.total_ingresos || 0), 0);
    const egresos = datosFiltrados.reduce((acc, curr) => acc + Number(curr.total_egresos || 0), 0);
    const saldo = ingresos - egresos;
    return { ingresos, egresos, saldo };
  }, [datosFiltrados]);

  return (
    <div className="p-4 max-w-lg mx-auto text-slate-100 space-y-5">
      
      {/* Selector de Filtro */}
      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-2xl border border-slate-800">
        <span className="text-sm font-bold text-slate-300">📊 Reportes</span>
        <div className="flex bg-slate-800 p-1 rounded-xl gap-1">
          {['semana', 'mes', 'todos'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all ${
                filtro === tipo 
                  ? 'bg-emerald-500 text-slate-950 shadow' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tipo === 'semana' ? 'Semana' : tipo === 'mes' ? 'Mes' : 'Todo'}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Ingresos</p>
          <p className="text-base font-extrabold text-emerald-400 mt-1">S/ {kpis.ingresos.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Egresos</p>
          <p className="text-base font-extrabold text-rose-400 mt-1">S/ {kpis.egresos.toFixed(2)}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Ganancia</p>
          <p className="text-base font-extrabold text-blue-400 mt-1">S/ {kpis.saldo.toFixed(2)}</p>
        </div>
      </div>

      {/* Gráfico Comparativo */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <h3 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          Ingresos vs Egresos por Día
        </h3>

        {datosFiltrados.length > 0 ? (
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosFiltrados} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="fecha" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="total_ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total_egresos" name="Egresos" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs">
            No hay cierres registrados en este período.
          </div>
        )}
      </div>

    </div>
  );
}