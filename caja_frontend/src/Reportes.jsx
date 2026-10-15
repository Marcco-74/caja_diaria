import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Award, AlertCircle } from 'lucide-react';

export default function Reportes({ cierres = [] }) {
  const [filtro, setFiltro] = useState('mes');

  // Filtrar cierres
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
    });
  }, [cierres, filtro]);

  // Cálculos estadísticos clave
  const kpis = useMemo(() => {
    const diasTrabajados = datosFiltrados.length;
    const ingresos = datosFiltrados.reduce((acc, curr) => acc + Number(curr.total_ingresos || 0), 0);
    const egresos = datosFiltrados.reduce((acc, curr) => acc + Number(curr.total_egresos || 0), 0);
    const ganancia = ingresos - egresos;
    
    const promedioDiario = diasTrabajados > 0 ? ganancia / diasTrabajados : 0;
    const porcentajeGasto = ingresos > 0 ? (egresos / ingresos) * 100 : 0;

    return { diasTrabajados, ingresos, egresos, ganancia, promedioDiario, porcentajeGasto };
  }, [datosFiltrados]);

  return (
    <div className="p-4 max-w-lg mx-auto text-slate-800 space-y-4">
      
      {/* 1. SELECCIONADOR DE PERÍODO */}
      <div className="flex bg-slate-200 p-1 rounded-2xl gap-1">
        {[
          { id: 'semana', label: 'Esta Semana' },
          { id: 'mes', label: 'Este Mes' },
          { id: 'todos', label: 'Todo el Histórico' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filtro === f.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 2. TARJETA PRINCIPAL: GANANCIA LIMPIA */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-3xl shadow-lg space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Ganancia Limpia ({kpis.diasTrabajados} {kpis.diasTrabajados === 1 ? 'día' : 'días'})
          </span>
          <div className="p-2 bg-emerald-500/20 rounded-full text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div>
          <p className="text-3xl font-black text-emerald-400">
            S/ {kpis.ganancia.toFixed(2)}
          </p>
          <p className="text-xs text-slate-300 mt-1">
            Promedio libre: <span className="font-bold text-white">S/ {kpis.promedioDiario.toFixed(2)} / día</span>
          </p>
        </div>

        {/* Mensaje Inteligente / Diagnóstico Sencillo */}
        <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2 text-xs text-slate-300">
          {kpis.ganancia > 0 ? (
            <>
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>¡Buen balance! Los ingresos superan tus gastos.</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Atención: Tus gastos igualan o superan tus ventas.</span>
            </>
          )}
        </div>
      </div>

      {/* 3. RESUMEN DE VENTAS Y GASTOS EN TARJETAS CLARAS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Ventas */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs uppercase">
            <TrendingUp className="w-4 h-4" /> Ventas Totales
          </div>
          <p className="text-xl font-black text-slate-800">
            S/ {kpis.ingresos.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400">
            Total ingresado a caja
          </p>
        </div>

        {/* Total Gastos */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs uppercase">
            <TrendingDown className="w-4 h-4" /> Gastos Totales
          </div>
          <p className="text-xl font-black text-slate-800">
            S/ {kpis.egresos.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-400">
            {kpis.porcentajeGasto.toFixed(0)}% de tus ventas
          </p>
        </div>
      </div>

      {/* 4. DETALLE DÍA POR DÍA (LIBRETA DE CIERRES) */}
      <div className="space-y-2 pt-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase px-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-600" /> Detalle por día ({datosFiltrados.length})
        </h3>

        {datosFiltrados.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {datosFiltrados.map((cierre) => {
              const saldoDía = Number(cierre.saldo_final || 0);
              const fechaFmt = new Date(cierre.fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              });

              return (
                <div 
                  key={cierre.id_cierre || cierre.fecha}
                  className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-slate-800 text-xs capitalize">
                      📅 {fechaFmt}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ventas: <span className="text-emerald-600 font-semibold">S/ {Number(cierre.total_ingresos).toFixed(2)}</span> | 
                      Gastos: <span className="text-rose-600 font-semibold">S/ {Number(cierre.total_egresos).toFixed(2)}</span>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Ganancia</span>
                    <span className={`font-black text-sm ${saldoDía >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      S/ {saldoDía.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            No hay cierres registrados en este período.
          </div>
        )}
      </div>

    </div>
  );
}