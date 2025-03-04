import React from 'react';

const NivelTable = ({ nivelStats }) => {
    const calculatePercentages = (cumple, cumpleParcial, noCumple, noMedido) => {
        const total = cumple + cumpleParcial + noCumple + noMedido;
        const calculatePercentage = (value) => (total === 0 ? '0%' : `${Math.round((value / total) * 100)}%`);

        return {
            pcCumple: calculatePercentage(cumple),
            pcCumpleParcial: calculatePercentage(cumpleParcial),
            pcNoCumple: calculatePercentage(noCumple),
            pcNoMedido: calculatePercentage(noMedido),
        };
    };

    return (
        <div className="overflow-x-auto mb-8">
            <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
                <thead className="bg-blue-200 text-blue-900">
                    <tr>
                        <th className="border px-2 py-1 text-center">Nivel</th>
                        <th className="border px-2 py-1 text-center">Cumplen</th>
                        <th className="border px-2 py-1 text-center">Cumplen Parcialmente</th>
                        <th className="border px-2 py-1 text-center">No Cumplen</th>
                        <th className="border px-2 py-1 text-center">No Medido</th>
                        <th className="border px-2 py-1 text-center">% Cumplen</th>
                        <th className="border px-2 py-1 text-center">% Cumplen Parcialmente</th>
                        <th className="border px-2 py-1 text-center">% No Cumplen</th>
                        <th className="border px-2 py-1 text-center">% No Medido</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {nivelStats.map(item => {
                        const { pcCumple, pcCumpleParcial, pcNoCumple, pcNoMedido } = calculatePercentages(
                            item.cumple,
                            item.cumpleParcial,
                            item.noCumple,
                            item.noMedido
                        );

                        return (
                            <tr key={item.nivel} className="hover:bg-gray-100">
                                <td className="border px-2 py-1 text-center">{item.nombre}</td>
                                <td className="border px-2 py-1 text-center">{item.cumple}</td>
                                <td className="border px-2 py-1 text-center">{item.cumpleParcial}</td>
                                <td className="border px-2 py-1 text-center">{item.noCumple}</td>
                                <td className="border px-2 py-1 text-center">{item.noMedido}</td>

                                {/* Porcentajes */}
                                <td className="border px-2 py-1 text-center">{pcCumple}</td>
                                <td className="border px-2 py-1 text-center">{pcCumpleParcial}</td>
                                <td className="border px-2 py-1 text-center">{pcNoCumple}</td>
                                <td className="border px-2 py-1 text-center">{pcNoMedido}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default NivelTable;
