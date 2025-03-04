import React from 'react';

const CategoryTable = ({ categoryStats }) => {
    return (
        <div className="overflow-x-auto mb-8">
            <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
                <thead className="bg-green-200 text-green-900">
                    <tr>
                        <th rowSpan={2} className="border px-2 py-1 text-center align-middle">Estado por Categoría</th>
                        <th colSpan={4} className="border px-2 py-1 text-center">Totales</th>
                        <th colSpan={4} className="border px-2 py-1 text-center">%</th>
                    </tr>
                    <tr>
                        <th className="border px-2 py-1 text-center">Cumplen</th>
                        <th className="border px-2 py-1 text-center">Parcial</th>
                        <th className="border px-2 py-1 text-center">No Cumple</th>
                        <th className="border px-2 py-1 text-center">No Medido</th>

                        <th className="border px-2 py-1 text-center">Cumplen</th>
                        <th className="border px-2 py-1 text-center">Parcial</th>
                        <th className="border px-2 py-1 text-center">No Cumple</th>
                        <th className="border px-2 py-1 text-center">No Medido</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {categoryStats.map(row => (
                        <tr key={row.cat} className="hover:bg-gray-100">
                            <td className="border px-2 py-1 text-center font-semibold">{row.nombre}</td>
                            <td className="border px-2 py-1 text-center">{row.cumple}</td>
                            <td className="border px-2 py-1 text-center">{row.cumpleParcial}</td>
                            <td className="border px-2 py-1 text-center">{row.noCumple}</td>
                            <td className="border px-2 py-1 text-center">{row.noMedido}</td>

                            <td className="border px-2 py-1 text-center">{row.pcCumple}</td>
                            <td className="border px-2 py-1 text-center">{row.pcParcial}</td>
                            <td className="border px-2 py-1 text-center">{row.pcNoCumple}</td>
                            <td className="border px-2 py-1 text-center">{row.pcNoMedido}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CategoryTable;
