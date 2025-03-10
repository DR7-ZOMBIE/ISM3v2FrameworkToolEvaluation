import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { db, collection, getDocs } from '../firebase-config';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

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
    p: 'Planeación'
  };

  possibleCategories.forEach(category => {
    categoryStats[category] = {
      nombre: categoryNames[category],
      cumple: 0,
      cumpleParcial: 0,
      noCumple: 0,
      noMedido: 0,
    };
  });

  data.forEach(item => {
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
  data.forEach(item => {
    const { estado, nivel } = item;
    if (estado === 'Cumple') nivelStats[nivel].cumple++;
    else if (estado === 'Cumple Parcialmente') nivelStats[nivel].cumpleParcial++;
    else if (estado === 'No Cumple') nivelStats[nivel].noCumple++;
    else if (estado === 'No Medido') nivelStats[nivel].noMedido++;
  });
  return nivelStats;
};

const Reportes = () => {
  // Datos leídos desde Firestore
  const [procesos, setProcesos] = useState([]);
  const [acumulado, setAcumulado] = useState([]);
  const [nivelStatsData, setNivelStatsData] = useState([]);

  // Datos procesados para gráficos
  const [accumulatedData, setAccumulatedData] = useState(null);
  const [radarData, setRadarData] = useState(null);
  const [areaNivelData, setAreaNivelData] = useState(null);
  const [pieData, setPieData] = useState(null);

  // Leer datos de Firestore al montar
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

  // Calcular datos para gráficos
  useEffect(() => {
    if (!procesos.length || !acumulado.length || !nivelStatsData.length) return;

    // (A) Radar Chart: % Cumple por Categoría
    const catStats = calculateCategoryStats(procesos);
    const catKeys = Object.keys(catStats);
    const radarLabels = catKeys.map(key => catStats[key].nombre.toUpperCase());
    const radarValues = catKeys.map(key => {
      const s = catStats[key];
      const total = s.cumple + s.cumpleParcial + s.noCumple + s.noMedido || 1;
      return Math.round((s.cumple / total) * 100);
    });
    setRadarData({ radarLabels, radarValues });

    // (B) Área Apilada: Acumulado por Mes
    const mesLabels = acumulado.map(item => item.mes);
    const cumpleAcum = acumulado.map(item => item.cumple);
    const cumpleParcialAcum = acumulado.map(item => item.cumpleParcial);
    const noCumpleAcum = acumulado.map(item => item.noCumple);
    const noMedidoAcum = acumulado.map(item => item.noMedido);
    setAccumulatedData({
      mesLabels,
      cumpleAcum,
      cumpleParcialAcum,
      noCumpleAcum,
      noMedidoAcum,
    });

    // (C) Área Apilada: Estadísticas por Nivel ISM3
    const nivStats = calculateNivelStats(procesos);
    const levelArray = Object.values(nivStats);
    const levelLabels = levelArray.map(item => item.nombre);
    const areaCumple = levelArray.map(item => item.cumple);
    const areaParcial = levelArray.map(item => item.cumpleParcial);
    const areaNoCumple = levelArray.map(item => item.noCumple);
    const areaNoMedido = levelArray.map(item => item.noMedido);
    setAreaNivelData({
      levelLabels,
      areaCumple,
      areaParcial,
      areaNoCumple,
      areaNoMedido,
    });

    // (D) Donut Chart: Último Mes (con efecto “pull” para simular 3D)
    const lastMonth = acumulado[acumulado.length - 1] || { cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
    const totalLastMonth = lastMonth.cumple + lastMonth.cumpleParcial + lastMonth.noCumple + lastMonth.noMedido || 1;
    setPieData({
      pieLabels: ['Cumple', 'Cumple Parcial', 'No Cumple', 'No Medido'],
      pieValues: [
        (lastMonth.cumple / totalLastMonth) * 100,
        (lastMonth.cumpleParcial / totalLastMonth) * 100,
        (lastMonth.noCumple / totalLastMonth) * 100,
        (lastMonth.noMedido / totalLastMonth) * 100,
      ],
    });
  }, [procesos, acumulado, nivelStatsData]);

  if (!radarData || !accumulatedData || !areaNivelData || !pieData) {
    return <div className="text-center text-lg font-bold">Cargando datos...</div>;
  }

  // Función para exportar el reporte a PDF
  const exportPDF = () => {
    const input = document.getElementById('reportContainer');
    html2canvas(input, { scale: 2 })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        pdf.setFontSize(14);
        pdf.text('Velasco & Calle', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
        pdf.save('reporte_cumplimiento.pdf');
      })
      .catch((err) => {
        console.error('Error exportando a PDF:', err);
      });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" id="reportContainer">
      <h2 className="text-2xl font-bold mb-4 text-center">Reporte Estadístico de Cumplimiento</h2>

      {/* 1) Radar Chart para Categorías */}
      <h3 className="text-xl font-semibold mb-2 text-center">Cumplimiento por Categoría</h3>
      <Plot
        data={[
          {
            type: 'scatterpolar',
            r: radarData.radarValues,
            theta: radarData.radarLabels,
            fill: 'toself',
            name: '% Cumple',
            line: { color: '#76a9ff', width: 2 },
            marker: { size: 6 },
          },
        ]}
        layout={{
          title: { text: 'Cumplimiento por Objetivos de Seguridad', font: { size: 20 } },
          polar: { radialaxis: { visible: true, range: [0, 100] } },
          paper_bgcolor: '#ffffff',
          margin: { t: 60, b: 30, l: 30, r: 30 },
        }}
        style={{ width: '100%', height: '500px' }}
      />

      {/* 2) Área Apilada para Acumulado por Mes */}
      <h3 className="text-xl font-semibold mt-8 mb-2 text-center">Comportamiento por Mes Acumulado</h3>
      <Plot
        data={[
          {
            x: accumulatedData.mesLabels,
            y: accumulatedData.cumpleAcum,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#a3d9a5',
            name: 'Cumple',
          },
          {
            x: accumulatedData.mesLabels,
            y: accumulatedData.cumpleParcialAcum,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#ffdab9',
            name: 'Cumple Parcial',
          },
          {
            x: accumulatedData.mesLabels,
            y: accumulatedData.noCumpleAcum,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#f4a6a6',
            name: 'No Cumple',
          },
          {
            x: accumulatedData.mesLabels,
            y: accumulatedData.noMedidoAcum,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#d3d3d3',
            name: 'No Medido',
          },
        ]}
        layout={{
          title: { text: 'Comportamiento por Mes Acumulado', font: { size: 20 } },
          xaxis: { title: 'Mes', tickangle: -45 },
          yaxis: { title: 'Cantidad', rangemode: 'tozero' },
          legend: { orientation: 'h', x: 0.3, y: -0.2 },
          paper_bgcolor: '#ffffff',
          margin: { t: 70, b: 80, l: 50, r: 30 },
        }}
        style={{ width: '100%', height: '500px' }}
      />

      {/* 3) Área Apilada para Estadísticas por Nivel ISM3 */}
      <h3 className="text-xl font-semibold mt-8 mb-2 text-center">Cumplimiento por Nivel ISM3</h3>
      <Plot
        data={[
          {
            x: areaNivelData.levelLabels,
            y: areaNivelData.areaCumple,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#a3d9a5',
            name: 'Cumple',
          },
          {
            x: areaNivelData.levelLabels,
            y: areaNivelData.areaParcial,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#ffdab9',
            name: 'Cumple Parcial',
          },
          {
            x: areaNivelData.levelLabels,
            y: areaNivelData.areaNoCumple,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#f4a6a6',
            name: 'No Cumple',
          },
          {
            x: areaNivelData.levelLabels,
            y: areaNivelData.areaNoMedido,
            stackgroup: 'one',
            type: 'scatter',
            mode: 'none',
            fillcolor: '#d3d3d3',
            name: 'No Medido',
          },
        ]}
        layout={{
          title: { text: 'Cumplimiento por Nivel de ISM3', font: { size: 20 } },
          xaxis: { title: 'Nivel' },
          yaxis: { title: 'Cantidad', rangemode: 'tozero' },
          legend: { orientation: 'h', x: 0.3, y: -0.2 },
          paper_bgcolor: '#ffffff',
          margin: { t: 70, b: 80, l: 50, r: 30 },
        }}
        style={{ width: '100%', height: '500px' }}
      />

      {/* 4) Donut Chart para el Último Mes */}
      <h3 className="text-xl font-semibold mt-8 mb-2 text-center">Estado de Cumplimiento (Último Mes)</h3>
      <Plot
        data={[
          {
            type: 'pie',
            hole: 0.3,
            labels: pieData.pieLabels,
            values: pieData.pieValues,
            textinfo: 'label+percent',
            textposition: 'inside',
            insidetextfont: { color: '#ffffff', size: 14 },
            pull: [0, 0.05, 0.1, 0],
            marker: {
              colors: ['#a3d9a5', '#ffdab9', '#f4a6a6', '#d3d3d3'],
              line: { color: '#ffffff', width: 2 },
            },
          },
        ]}
        layout={{
          title: { text: 'Estado de Cumplimiento (Último Mes)', font: { size: 20 } },
          showlegend: true,
          paper_bgcolor: '#ffffff',
          margin: { t: 70, b: 50, l: 50, r: 50 },
        }}
        style={{ width: '100%', height: '500px' }}
      />

      {/* Botón para Exportar a PDF */}
      <div className="text-center mt-8">
        <button 
          onClick={exportPDF} 
          className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
        >
          Descargar Reporte en PDF
        </button>
      </div>
    </div>
  );
};

// Función para exportar el reporte a PDF usando html2canvas y jsPDF
const exportPDF = () => {
  const input = document.getElementById('reportContainer');
  html2canvas(input, { scale: 2 })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.setFontSize(14);
      pdf.text('Velasco & Calle', pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      pdf.save('reporte_cumplimiento.pdf');
    })
    .catch((error) => {
      console.error('Error al exportar PDF:', error);
    });
};

export default Reportes;
