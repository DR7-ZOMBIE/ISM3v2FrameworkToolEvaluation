import React, { useState, useEffect, useRef } from 'react';
import { Radar, Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler,  // Importamos el plugin Filler para habilitar fill
} from 'chart.js';
import { db, collection, getDocs } from '../firebase-config';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Registrar componentes y plugins en Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Filler  // Registramos Filler para usar fill en el line chart
);

// Forzamos a Chart.js a usar colores compatibles
ChartJS.defaults.color = '#000000';

// Mapa de categorías (puedes ajustar según tus necesidades)
const categoriesMap = {
  c: 'ENTRENAMIENTO/CULTURA (C)',
  o: 'OPERAR SEGUROS (O)',
  v: 'VIGILAR/PREVEER (V)',
  r: 'RESILIENCIA/CONTINUIDAD (R)',
  '$': 'INVERSIONES/PRESUPUESTO ($)',
  g: 'GESTIÓN DE SEGURIDAD (G)',
  p: 'PROTECCIÓN (P)',
};

const fetchDocumentsFromFirestore = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};

const calculateCategoryStats = (data) => {
  const categoryStats = {};
  const possibleCategories = ['c', 'o', 'v', 'r', '$', 'g', 'p'];
  const categoryNames = {
    c: 'Cultura/Entrenamiento',
    o: 'Operar Seguros',
    v: 'Vigilar/Prever',
    r: 'Resiliencia/Continuidad',
    $: 'Inversiones/Presupuesto',
    g: 'Gestión de Seguridad',
    p: 'Planeación',
  };

  possibleCategories.forEach((category) => {
    categoryStats[category] = {
      nombre: categoryNames[category],
      cumple: 0,
      cumpleParcial: 0,
      noCumple: 0,
      noMedido: 0,
    };
  });

  data.forEach((item) => {
    const cat = item.categoria;
    if (!categoryStats[cat]) {
      categoryStats[cat] = { nombre: cat, cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
    }
    switch (item.estado) {
      case 'Cumple':
        categoryStats[cat].cumple++;
        break;
      case 'Cumple Parcialmente':
        categoryStats[cat].cumpleParcial++;
        break;
      case 'No Cumple':
        categoryStats[cat].noCumple++;
        break;
      case 'No Medido':
        categoryStats[cat].noMedido++;
        break;
      default:
        break;
    }
  });
  return categoryStats;
};

const calculateNivelStats = (data) => {
  const nivelStats = {};
  for (let i = 1; i <= 4; i++) {
    nivelStats[i] = {
      nivel: i,
      nombre: `Nivel ${i}`,
      cumple: 0,
      cumpleParcial: 0,
      noCumple: 0,
      noMedido: 0,
    };
  }
  data.forEach((item) => {
    const { estado, nivel } = item;
    if (estado === 'Cumple') nivelStats[nivel].cumple++;
    else if (estado === 'Cumple Parcialmente') nivelStats[nivel].cumpleParcial++;
    else if (estado === 'No Cumple') nivelStats[nivel].noCumple++;
    else if (estado === 'No Medido') nivelStats[nivel].noMedido++;
  });
  return nivelStats;
};

const Reportes = () => {
  const containerRef = useRef(null);
  const radarRef = useRef(null);
  const lineRef = useRef(null);
  const barRef = useRef(null);
  const pieRef = useRef(null);

  const [procesos, setProcesos] = useState([]);
  const [acumulado, setAcumulado] = useState([]);
  const [nivelStatsData, setNivelStatsData] = useState([]);
  const [radarData, setRadarData] = useState({});
  const [lineData, setLineData] = useState({});
  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});

  useEffect(() => {
    const fetchAllData = async () => {
      const procs = await fetchDocumentsFromFirestore('procesos');
      const acum = await fetchDocumentsFromFirestore('acumulado');
      const niv = await fetchDocumentsFromFirestore('nivelStats');
      setProcesos(procs);
      setAcumulado(acum);
      setNivelStatsData(niv);
    };
    fetchAllData();
  }, []);

  useEffect(() => {
    if (!procesos.length || !acumulado.length || !nivelStatsData.length) return;

    // (A) Radar: % Cumple por Categoría
    const catStats = calculateCategoryStats(procesos);
    const catKeys = Object.keys(catStats);
    const labelsRadar = catKeys.map((key) => catStats[key].nombre.toUpperCase());
    const dataRadar = catKeys.map((key) => {
      const s = catStats[key];
      const total = s.cumple + s.cumpleParcial + s.noCumple + s.noMedido || 1;
      return Math.round((s.cumple / total) * 100);
    });
    setRadarData({
      labels: labelsRadar,
      datasets: [
        {
          label: '% Cumple',
          data: dataRadar,
          backgroundColor: 'rgba(26, 188, 156, 0.2)',
          borderColor: '#1ABC9C',
          borderWidth: 2,
          pointBackgroundColor: '#1ABC9C',
        },
      ],
    });

    // (B) Línea: Acumulado por Mes (simula área apilada)
    const labelsLine = acumulado.map((item) => item.mes);
    setLineData({
      labels: labelsLine,
      datasets: [
        {
          label: 'Cumple',
          data: acumulado.map((item) => item.cumple),
          backgroundColor: 'rgba(26, 188, 156, 0.4)',
          borderColor: '#1ABC9C',
          fill: true,
        },
        {
          label: 'Cumple Parcial',
          data: acumulado.map((item) => item.cumpleParcial),
          backgroundColor: 'rgba(243, 156, 18, 0.4)',
          borderColor: '#F39C12',
          fill: true,
        },
        {
          label: 'No Cumple',
          data: acumulado.map((item) => item.noCumple),
          backgroundColor: 'rgba(231, 76, 60, 0.4)',
          borderColor: '#E74C3C',
          fill: true,
        },
        {
          label: 'No Medido',
          data: acumulado.map((item) => item.noMedido),
          backgroundColor: 'rgba(127, 140, 141, 0.4)',
          borderColor: '#7F8C8D',
          fill: true,
        },
      ],
    });

    // (C) Barras: Estadísticas por Nivel ISM3 (porcentajes)
    const nivelLabels = nivelStatsData.map((item) => item.nombre || `Nivel ${item.nivel}`);
    setBarData({
      labels: nivelLabels,
      datasets: [
        {
          label: 'Cumple',
          data: nivelStatsData.map((item) => parseFloat(item.pcCumple.replace('%', ''))),
          backgroundColor: '#1ABC9C',
        },
        {
          label: 'Cumple Parcialmente',
          data: nivelStatsData.map((item) => parseFloat(item.pcParcial.replace('%', ''))),
          backgroundColor: '#F39C12',
        },
        {
          label: 'No Cumple',
          data: nivelStatsData.map((item) => parseFloat(item.pcNoCumple.replace('%', ''))),
          backgroundColor: '#E74C3C',
        },
        {
          label: 'No Medido',
          data: nivelStatsData.map((item) => parseFloat(item.pcNoMedido.replace('%', ''))),
          backgroundColor: '#7F8C8D',
        },
      ],
    });

    // (D) Pie: Último Mes
    const lastMonth = acumulado[acumulado.length - 1] || { cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
    const totalLastMonth = lastMonth.cumple + lastMonth.cumpleParcial + lastMonth.noCumple + lastMonth.noMedido || 1;
    setPieData({
      labels: ['Cumple', 'Cumple Parcial', 'No Cumple', 'No Medido'],
      datasets: [
        {
          data: [
            (lastMonth.cumple / totalLastMonth) * 100,
            (lastMonth.cumpleParcial / totalLastMonth) * 100,
            (lastMonth.noCumple / totalLastMonth) * 100,
            (lastMonth.noMedido / totalLastMonth) * 100,
          ],
          backgroundColor: ['#1ABC9C', '#F39C12', '#E74C3C', '#7F8C8D'],
          borderColor: '#fff',
          borderWidth: 2,
        },
      ],
    });
  }, [procesos, acumulado, nivelStatsData]);

  // Función para exportar 4 páginas, una por cada gráfico
  const exportPDF = () => {
    if (!radarRef.current || !lineRef.current || !barRef.current || !pieRef.current) return;

    Promise.all([
      html2canvas(radarRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true }),
      html2canvas(lineRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true }),
      html2canvas(barRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true }),
      html2canvas(pieRef.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true }),
    ])
      .then((canvases) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        canvases.forEach((canvas, index) => {
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const ratio = canvas.height / canvas.width;
          const imgHeight = pdfWidth * ratio;
          if (index > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        });
        pdf.setFontSize(14);
        pdf.text('Velasco & Calle', pdf.internal.pageSize.getWidth() / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
        pdf.save('reporte_cumplimiento.pdf');
      })
      .catch((err) => {
        console.error('Error al exportar PDF:', err);
      });
  };

  if (
    !Object.keys(radarData).length ||
    !Object.keys(lineData).length ||
    !Object.keys(barData).length ||
    !Object.keys(pieData).length
  ) {
    return <div className="text-center text-lg font-bold">Cargando datos...</div>;
  }

  return (
    <div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
      <div className="p-6 bg-white rounded-lg shadow-md" id="reportContainer" ref={containerRef}>
        <h2 className="text-2xl font-bold mb-4 text-center">
          Reporte estadístico de cumplimiento
        </h2>

        <div className="mb-8" style={{ height: 700 }} ref={radarRef}>
          <Radar 
            data={radarData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { r: { ticks: { beginAtZero: true, max: 100 } } },
            }} 
          />
        </div>

        <div className="mb-8" style={{ height: 500 }} ref={lineRef}>
          <Line 
            data={lineData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { title: { display: true, text: 'Comportamiento por mes acumulado', font: { size: 20 } } },
              scales: { y: { beginAtZero: true } },
            }} 
          />
        </div>

        <div className="mb-8" style={{ height: 500 }} ref={barRef}>
          <Bar 
            data={barData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { title: { display: true, text: 'Cumplimiento por nivel de ISM3', font: { size: 20 } } },
              scales: { y: { beginAtZero: true, max: 100 } },
            }} 
          />
        </div>

        <div className="mb-8" style={{ height: 500 }} ref={pieRef}>
          <Pie 
            data={pieData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { title: { display: true, text: 'Estado de cumplimiento (Último Mes)', font: { size: 20 } } },
            }} 
          />
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button
            onClick={exportPDF}
            style={{
              padding: '10px 20px',
              backgroundColor: 'blue',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Descargar reporte en PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reportes;
