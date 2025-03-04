import React, { useEffect, useState } from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement);

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
          backgroundColor: '#28a745',
        },
        {
          label: 'Cumple Parcial',
          data: cumpleParcial,
          backgroundColor: '#ffc107',
        },
        {
          label: 'No Cumple',
          data: noCumple,
          backgroundColor: '#dc3545',
        },
        {
          label: 'No Medido',
          data: noMedido,
          backgroundColor: '#6c757d',
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
          fill: false,
          borderColor: '#28a745',
          backgroundColor: '#28a745',
        },
        {
          label: 'Cumple Parcial',
          data: cumpleParcialAcum,
          fill: false,
          borderColor: '#ffc107',
          backgroundColor: '#ffc107',
        },
        {
          label: 'No Cumple',
          data: noCumpleAcum,
          fill: false,
          borderColor: '#dc3545',
          backgroundColor: '#dc3545',
        },
        {
          label: 'No Medido',
          data: noMedidoAcum,
          fill: false,
          borderColor: '#6c757d',
          backgroundColor: '#6c757d',
        },
      ],
    });

    const levelArray = Object.values(nivelStats); 
    const levelLabels = levelArray.map((item) => item.nombre);
    const cumpleNivel = levelArray.map((item) => item.cumple);
    const cumpleParcialNivel = levelArray.map((item) => item.cumpleParcial);
    const noCumpleNivel = levelArray.map((item) => item.noCumple);
    const noMedidoNivel = levelArray.map((item) => item.noMedido);

    setLevelData({
      labels: levelLabels,
      datasets: [
        {
          label: 'Cumple',
          data: cumpleNivel,
          backgroundColor: '#28a745',
        },
        {
          label: 'Cumple Parcial',
          data: cumpleParcialNivel,
          backgroundColor: '#ffc107',
        },
        {
          label: 'No Cumple',
          data: noCumpleNivel,
          backgroundColor: '#dc3545',
        },
        {
          label: 'No Medido',
          data: noMedidoNivel,
          backgroundColor: '#6c757d',
        },
      ],
    });

    const lastMonth = acumulado[acumulado.length - 1] || { cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
    const totalLastMonth = lastMonth.cumple + lastMonth.cumpleParcial + lastMonth.noCumple + lastMonth.noMedido || 1;
    
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
          backgroundColor: ['#28a745', '#ffc107', '#dc3545', '#6c757d'],
        },
      ],
    });
  }, [data, acumulado, nivelStats]);

  if (!categoryData || !accumulatedData || !levelData || !pieChartData) {
    return <div className="text-center text-lg font-bold">Cargando datos...</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Reporte Estadístico de Cumplimiento</h2>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Porcentaje de Estado por Categoría</h3>
        <Bar data={categoryData} options={{ responsive: true }} />
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Acumulado de Todos los Meses</h3>
        <Line data={accumulatedData} options={{ responsive: true }} />
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Estado por Nivel de ISM3</h3>
        <Bar data={levelData} options={{ responsive: true }} />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Cumplimiento en el Último Mes</h3>
        <Pie data={pieChartData} options={{ responsive: true }} />
      </div>
    </div>
  );
};

export default Reportes;
