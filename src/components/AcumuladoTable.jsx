import React from 'react';

const AcumuladoTable = ({ 
  acumulado, 
  updateAcumulado, 
  deleteRowAcumulado, 
  addRowAcumulado 
}) => {
  return (
    <div className="overflow-x-auto mb-8 mt-8">
      <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
        <thead className="bg-blue-200 text-blue-900">
          <tr>
            {['Mes', 'Cumple', 'Cumple Parcialmente', 'No Cumple', 'No Medido', 'No Aplica', 'Eliminar'].map(header => (
              <th key={header} className="border px-2 py-1 text-center">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {acumulado.map((item) => (
            <tr key={item.id} className="hover:bg-gray-100">
              {/* Celda de Mes */}
              <td className="border px-2 py-1 text-center">
                <input
                  type="text"
                  value={item.mes}
                  onChange={(e) => updateAcumulado(e, item.id, 'mes')}
                  className="w-24 text-center border rounded text-[10px] p-1"
                />
              </td>
              {/* Celda de Cumple */}
              <td className="border px-2 py-1 text-center">
                <input
                  type="number"
                  value={item.cumple}
                  onChange={(e) => updateAcumulado(e, item.id, 'cumple')}
                  className="w-12 text-center border rounded text-[10px] p-1"
                />
              </td>
              {/* Celda de Cumple Parcialmente */}
              <td className="border px-2 py-1 text-center">
                <input
                  type="number"
                  value={item.cumpleParcial}
                  onChange={(e) => updateAcumulado(e, item.id, 'cumpleParcial')}
                  className="w-12 text-center border rounded text-[10px] p-1"
                />
              </td>
              {/* Celda de No Cumple */}
              <td className="border px-2 py-1 text-center">
                <input
                  type="number"
                  value={item.noCumple}
                  onChange={(e) => updateAcumulado(e, item.id, 'noCumple')}
                  className="w-12 text-center border rounded text-[10px] p-1"
                />
              </td>
              {/* Celda de No Medido */}
              <td className="border px-2 py-1 text-center">
                <input
                  type="number"
                  value={item.noMedido}
                  onChange={(e) => updateAcumulado(e, item.id, 'noMedido')}
                  className="w-12 text-center border rounded text-[10px] p-1"
                />
              </td>
              {/* Celda de No Aplica */}
              <td className="border px-2 py-1 text-center">
                <input
                  type="number"
                  value={item.noAplica}
                  onChange={(e) => updateAcumulado(e, item.id, 'noAplica')}
                  className="w-12 text-center border rounded text-[10px] p-1"
                />
              </td>
              {/* Botón de Eliminar */}
              <td className="border px-2 py-1 text-center">
                <button
                  onClick={() => deleteRowAcumulado(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-center">
        <button
          onClick={addRowAcumulado}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default AcumuladoTable;
