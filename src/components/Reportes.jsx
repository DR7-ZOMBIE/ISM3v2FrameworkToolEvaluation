import React, { useEffect, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const categoriesMap = {
    c: 'ENTRENAMIENTO/CULTURA (C)',
    o: 'OPERAR SEGUROS (O)',
    v: 'VIGILAR/PREVEER (V)',
    r: 'RESILIENCIA/CONTINUIDAD (R)',
    '$': 'INVERSIONES/PRESUPUESTO ($)',
    g: 'GESTION DE SEGURIDAD (G)',
    p: 'PROTECCIÓN (P)',
};

const Reportes = ({ data, acumulado, nivelStats }) => {
  const [categoryData, setCategoryData] = useState(null);
  const [accumulatedData, setAccumulatedData] = useState(null);
  const [levelData, setLevelData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);

  // Función para obtener las estadísticas por categoría
  useEffect(() => {
    if (!data || !acumulado || !nivelStats) return;

    const categoryStats = {};
    Object.keys(categoriesMap).forEach((cat) => {
      categoryStats[cat] = {
        nombre: categoriesMap[cat],
        cumple: 0,
        cumpleParcial: 0,
        noCumple: 0,
        noMedido: 0,
      };
    });

    data.forEach((item) => {
      const cat = item.categoria;
      if (!categoryStats[cat]) {
        categoryStats[cat] = {
          nombre: cat,
          cumple: 0,
          cumpleParcial: 0,
          noCumple: 0,
          noMedido: 0,
        };
      }
      switch (item.estado) {
        case 'Cumple':
          categoryStats[cat].cumple += 1;
          break;
        case 'Cumple Parcialmente':
          categoryStats[cat].cumpleParcial += 1;
          break;
        case 'No Cumple':
          categoryStats[cat].noCumple += 1;
          break;
        case 'No Medido':
          categoryStats[cat].noMedido += 1;
          break;
        default:
          break;
      }
    });

    const labels = Object.keys(categoryStats).map((key) => categoryStats[key].nombre);
    const cumple = Object.keys(categoryStats).map((key) => categoryStats[key].cumple);
    const cumpleParcial = Object.keys(categoryStats).map((key) => categoryStats[key].cumpleParcial);
    const noCumple = Object.keys(categoryStats).map((key) => categoryStats[key].noCumple);
    const noMedido = Object.keys(categoryStats).map((key) => categoryStats[key].noMedido);

    setCategoryData({
      labels,
      datasets: [
        {
          label: 'Cumple',
          data: cumple,
          backgroundColor: 'green',
        },
        {
          label: 'Cumple Parcial',
          data: cumpleParcial,
          backgroundColor: 'orange',
        },
        {
          label: 'No Cumple',
          data: noCumple,
          backgroundColor: 'red',
        },
        {
          label: 'No Medido',
          data: noMedido,
          backgroundColor: 'gray',
        },
      ],
    });

    const mesLabels = acumulado.map((item) => item.mes);
    const cumpleAcum = acumulado.map((item) => item.cumple);
    const cumpleParcialAcum = acumulado.map((item) => item.cumpleParcial);
    const noCumpleAcum = acumulado.map((item) => item.noCumple);
    const noMedidoAcum = acumulado.map((item) => item.noMedido);

    setAccumulatedData({
      labels: mesLabels,
      datasets: [
        {
          label: 'Cumple',
          data: cumpleAcum,
          fill: true,
          backgroundColor: 'green',
          borderColor: 'green',
        },
        {
          label: 'Cumple Parcial',
          data: cumpleParcialAcum,
          fill: true,
          backgroundColor: 'orange',
          borderColor: 'orange',
        },
        {
          label: 'No Cumple',
          data: noCumpleAcum,
          fill: true,
          backgroundColor: 'red',
          borderColor: 'red',
        },
        {
          label: 'No Medido',
          data: noMedidoAcum,
          fill: true,
          backgroundColor: 'gray',
          borderColor: 'gray',
        },
      ],
    });

    const levelLabels = nivelStats.map((item) => `Nivel ${item.nivel}`);
    const cumpleNivel = nivelStats.map((item) => item.cumple);
    const cumpleParcialNivel = nivelStats.map((item) => item.cumpleParcial);
    const noCumpleNivel = nivelStats.map((item) => item.noCumple);
    const noMedidoNivel = nivelStats.map((item) => item.noMedido);

    setLevelData({
      labels: levelLabels,
      datasets: [
        {
          label: 'Cumple',
          data: cumpleNivel,
          backgroundColor: 'green',
        },
        {
          label: 'Cumple Parcial',
          data: cumpleParcialNivel,
          backgroundColor: 'orange',
        },
        {
          label: 'No Cumple',
          data: noCumpleNivel,
          backgroundColor: 'red',
        },
        {
          label: 'No Medido',
          data: noMedidoNivel,
          backgroundColor: 'gray',
        },
      ],
    });

    const lastMonth = acumulado[acumulado.length - 1];
    const totalLastMonth = lastMonth.cumple + lastMonth.cumpleParcial + lastMonth.noCumple + lastMonth.noMedido;
    setPieChartData({
      labels: ['Cumple', 'Cumple Parcial', 'No Cumple', 'No Medido'],
      datasets: [
        {
          data: [
            (lastMonth.cumple / totalLastMonth) * 100,
            (lastMonth.cumpleParcial / totalLastMonth) * 100,
            (lastMonth.noCumple / totalLastMonth) * 100,
            (lastMonth.noMedido / totalLastMonth) * 100,
          ],
          backgroundColor: ['green', 'orange', 'red', 'gray'],
        },
      ],
    });
  }, [data, acumulado, nivelStats]);

  if (!categoryData || !accumulatedData || !levelData || !pieChartData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Porcentaje de Estado por Categoría</h2>
        <Bar data={categoryData} options={{ responsive: true, plugins: { title: { display: true, text: 'Estado por Categoría' } } }} />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Acumulado de Todos los Meses</h2>
        <Line data={accumulatedData} options={{ responsive: true, plugins: { title: { display: true, text: 'Acumulado por Mes' } } }} />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Estado por Nivel de ISM3</h2>
        <Bar data={levelData} options={{ responsive: true, plugins: { title: { display: true, text: 'Estado por Nivel' } } }} />
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Cumplimiento en el Último Mes</h2>
        <Pie data={pieChartData} options={{ responsive: true, plugins: { title: { display: true, text: 'Cumplimiento Último Mes' } } }} />
      </div>
    </div>
  );
};

export default Reportes;
