import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Minus, ArrowDownCircle, ArrowUpCircle, Wallet, RefreshCw } from 'lucide-react';

//const API_URL = 'http://127.0.0.1:8000/api/';
//const API_URL = 'http://192.168.1.4:8000/api/';
const API_URL = import.meta.env.VITE_API_URL || 'https://caja-diaria-cdyq.onrender.com';

export default function App() {
  const [monto, setMonto] = useState('0');
  const [tipo, setTipo] = useState('INGRESO');
  const [descripcion, setDescripcion] = useState('');
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(false);

  // Obtener fecha actual legible
  const hoyFecha = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Cargar movimientos desde Django
  const cargarMovimientos = async () => {
    try {
      setCargando(true);
      const res = await axios.get(`${API_URL}movimientos/hoy/`);
      setMovimientos(res.data);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMovimientos();
  }, []);

  // Teclado Numérico
  const presionarNumero = (num) => {
    setMonto(prev => (prev === '0' ? num : prev + num));
  };

  const borrarNumero = () => {
    setMonto(prev => (prev.length === 1 ? '0' : prev.slice(0, -1)));
  };

  const agregarPunto = () => {
    if (!monto.includes('.')) setMonto(prev => prev + '.');
  };

  // Guardar en Backend
  const registrarMovimiento = async () => {
    const valor = parseFloat(monto);
    if (isNaN(valor) || valor <= 0) return;

    try {
      await axios.post(`${API_URL}movimientos/`, {
        tipo: tipo,
        monto: valor,
        descripcion: descripcion.trim() || (tipo === 'INGRESO' ? 'Venta' : 'Gasto')
      });

      setMonto('0');
      setDescripcion('');
      cargarMovimientos();
    } catch (error) {
      alert("Error al guardar el movimiento");
    }
  };

  // Totales
  const totalIngresos = movimientos
    .filter(m => m.tipo === 'INGRESO')
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const totalEgresos = movimientos
    .filter(m => m.tipo === 'EGRESO')
    .reduce((acc, m) => acc + parseFloat(m.monto), 0);

  const saldoCaja = totalIngresos - totalEgresos;

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center p-0 md:p-6">
      <div className="w-full max-w-md bg-slate-100 min-h-screen md:min-h-[850px] md:max-h-[90vh] md:rounded-3xl shadow-2xl flex flex-col justify-between font-sans pb-6 overflow-hidden border-0 md:border border-slate-700">
        
        {/* 1. CABECERA CON FECHA EN GRANDE */}
        <div className="bg-slate-900 text-white p-5 rounded-b-3xl shadow-lg space-y-3 shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-emerald-400" />
              <h1 className="text-lg font-bold">Caja Chica</h1>
            </div>
            <button onClick={cargarMovimientos} className="p-1 hover:bg-slate-800 rounded-lg">
              <RefreshCw className={`w-4 h-4 text-slate-400 ${cargando ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Fecha Operativa comercial */}
          <p className="text-xs text-emerald-400 font-semibold capitalize text-center bg-slate-800/80 py-1 px-3 rounded-full">
            📅 {hoyFecha}
          </p>

          {/* Saldo Líquido */}
          <div className="text-center py-1">
            <p className="text-xs text-slate-400 uppercase font-semibold">Ganancia del Día</p>
            <p className="text-4xl font-extrabold text-emerald-400 mt-1">S/ {saldoCaja.toFixed(2)}</p>
          </div>

          {/* Totales Secundarios */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
            <div className="flex items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-slate-400">Ingresos</p>
                <p className="font-bold text-white text-sm">S/ {totalIngresos.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
              <ArrowDownCircle className="w-5 h-5 text-rose-400" />
              <div>
                <p className="text-slate-400">Gastos</p>
                <p className="font-bold text-white text-sm">S/ {totalEgresos.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. TECLADO Y ENTRADA */}
        <div className="p-4 space-y-3 shrink-0">
          <div className="grid grid-cols-2 gap-2 bg-slate-200 p-1 rounded-2xl">
            <button
              onClick={() => setTipo('INGRESO')}
              className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                tipo === 'INGRESO' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-600'
              }`}
            >
              <Plus className="w-4 h-4" /> Venta (+)
            </button>
            <button
              onClick={() => setTipo('EGRESO')}
              className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                tipo === 'EGRESO' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600'
              }`}
            >
              <Minus className="w-4 h-4" /> Gasto (-)
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-right space-y-2">
            <p className="text-xs text-slate-400 text-left font-medium">Monto a registrar:</p>
            <div className="text-4xl font-black text-slate-800 tracking-tight">S/ {monto}</div>
            <input
              type="text"
              placeholder="Detalle opcional (ej: carne de res)"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-2 outline-none"
            />
          </div>

          {/* Teclado Gigante */}
          <div className="grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => presionarNumero(num)}
                className="bg-white hover:bg-slate-50 active:bg-slate-200 text-slate-800 text-2xl font-bold py-3 rounded-2xl shadow-sm border border-slate-200"
              >
                {num}
              </button>
            ))}
            <button onClick={agregarPunto} className="bg-white text-2xl font-bold py-3 rounded-2xl border">.</button>
            <button onClick={() => presionarNumero('0')} className="bg-white text-2xl font-bold py-3 rounded-2xl border">0</button>
            <button onClick={borrarNumero} className="bg-slate-200 text-lg font-bold py-3 rounded-2xl">⌫</button>
          </div>

          <button
            onClick={registrarMovimiento}
            disabled={parseFloat(monto) <= 0}
            className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-all ${
              tipo === 'INGRESO'
                ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300'
                : 'bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300'
            }`}
          >
            GUARDAR S/ {monto}
          </button>
        </div>

        {/* 3. HISTORIAL DEL DÍA */}
        <div className="px-4 space-y-2 overflow-hidden flex flex-col">
          <h3 className="text-xs font-bold text-slate-500 uppercase px-1">Historial de hoy ({movimientos.length})</h3>
          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
            {movimientos.map((m) => (
              <div key={m.id_movimiento} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800 text-xs">{m.descripcion}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(m.fecha_hora_registro).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span className={`font-black text-sm ${m.tipo === 'INGRESO' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {m.tipo === 'INGRESO' ? '+' : '-'} S/ {parseFloat(m.monto).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}