import React, { useState, useEffect, useRef } from 'react';
import Chart from 'react-apexcharts';
import { db, collection, getDocs } from '../firebase-config';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Mapa de categorías (ajústalo según tus necesidades)
const categoriesMap = {
  c: 'ENTRENAMIENTO/CULTURA (C)',
  o: 'OPERAR SEGUROS (O)',
  v: 'VIGILAR/PREVEER (V)',
  r: 'RESILIENCIA/CONTINUIDAD (R)',
  '$': 'INVERSIONES/PRESUPUESTO ($)',
  g: 'GESTIÓN DE SEGURIDAD (G)',
  p: 'PROTECCIÓN (P)',
};

// Función para obtener documentos desde Firestore
const fetchDocumentsFromFirestore = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};

// Calcula las estadísticas por categoría
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

// Calcula las estadísticas por nivel
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
  // Referencia al contenedor para exportar a PDF
  const containerRef = useRef(null);

  // Estados para datos leídos desde Firestore
  const [procesos, setProcesos] = useState([]);
  const [acumulado, setAcumulado] = useState([]);
  const [nivelStatsData, setNivelStatsData] = useState([]);

  // Estados para configurar los gráficos con ApexCharts
  const [radarSeries, setRadarSeries] = useState([]);
  const [radarOptions, setRadarOptions] = useState({});
  const [areaSeries, setAreaSeries] = useState([]);
  const [areaOptions, setAreaOptions] = useState({});
  const [nivelSeries, setNivelSeries] = useState([]);
  const [nivelOptions, setNivelOptions] = useState({});
  const [pieSeries, setPieSeries] = useState([]);
  const [pieOptions, setPieOptions] = useState({});

  // Leer datos de Firestore al montar el componente
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

  // Calcular datos para configurar los gráficos cuando la información esté disponible
  useEffect(() => {
    if (!procesos.length || !acumulado.length || !nivelStatsData.length) return;

    // (A) Gráfico Radar: % Cumple por Categoría (más grande)
    const catStats = calculateCategoryStats(procesos);
    const catKeys = Object.keys(catStats);
    const radarCategories = catKeys.map((key) => catStats[key].nombre.toUpperCase());
    const radarDataValues = catKeys.map((key) => {
      const s = catStats[key];
      const total = s.cumple + s.cumpleParcial + s.noCumple + s.noMedido || 1;
      return Math.round((s.cumple / total) * 100);
    });
    setRadarSeries([{ name: '% Cumple', data: radarDataValues }]);
    setRadarOptions({
      chart: { 
        type: 'radar', 
        height: 700,
        toolbar: { show: false },
        dropShadow: { enabled: true, top: 3, left: 2, blur: 4, opacity: 0.2 }
      },
      title: { 
        text: 'Cumplimiento por Objetivos de Seguridad', 
        style: { fontSize: '24px', fontWeight: 'bold' } 
      },
      xaxis: { categories: radarCategories, labels: { style: { fontSize: '16px' } } },
      yaxis: { max: 100, min: 0, labels: { style: { fontSize: '14px' } } },
      stroke: { width: 2 },
      fill: { opacity: 0.3 },
      markers: { size: 6 },
      colors: ['#1ABC9C']
    });

    // (B) Gráfico de Área Apilada: Acumulado por Mes
    const mesLabels = acumulado.map((item) => item.mes);
    const cumpleAcum = acumulado.map((item) => item.cumple);
    const cumpleParcialAcum = acumulado.map((item) => item.cumpleParcial);
    const noCumpleAcum = acumulado.map((item) => item.noCumple);
    const noMedidoAcum = acumulado.map((item) => item.noMedido);
    setAreaSeries([
      { name: 'Cumple', data: cumpleAcum },
      { name: 'Cumple Parcial', data: cumpleParcialAcum },
      { name: 'No Cumple', data: noCumpleAcum },
      { name: 'No Medido', data: noMedidoAcum },
    ]);
    setAreaOptions({
      chart: { 
        type: 'area', 
        stacked: true, 
        toolbar: { show: false },
        dropShadow: { enabled: true, top: 3, left: 2, blur: 4, opacity: 0.1 }
      },
      title: { 
        text: 'Comportamiento por Mes Acumulado', 
        style: { fontSize: '20px', fontWeight: 'bold' } 
      },
      xaxis: { categories: mesLabels, title: { text: 'Mes', style: { fontSize: '14px' } } },
      yaxis: { title: { text: 'Cantidad', style: { fontSize: '14px' } } },
      colors: ['#1ABC9C', '#F39C12', '#E74C3C', '#7F8C8D'],
      legend: { position: 'bottom', labels: { style: { fontSize: '14px' } } },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' }
    });

    // (C) Gráfico de Barras: Estadísticas por Nivel ISM3
    const nivStats = calculateNivelStats(procesos);
    const levelArray = Object.values(nivStats);
    const levelLabels = levelArray.map((item) => item.nombre);
    const areaCumple = levelArray.map((item) => item.cumple);
    const areaParcial = levelArray.map((item) => item.cumpleParcial);
    const areaNoCumple = levelArray.map((item) => item.noCumple);
    const areaNoMedido = levelArray.map((item) => item.noMedido);
    setNivelSeries([
      { name: 'Cumple', data: areaCumple },
      { name: 'Cumple Parcial', data: areaParcial },
      { name: 'No Cumple', data: areaNoCumple },
      { name: 'No Medido', data: areaNoMedido },
    ]);
    setNivelOptions({
      chart: { 
        type: 'bar', 
        stacked: true, 
        toolbar: { show: false },
        dropShadow: { enabled: true, top: 3, left: 2, blur: 4, opacity: 0.1 }
      },
      title: { 
        text: 'Cumplimiento por Nivel de ISM3', 
        style: { fontSize: '20px', fontWeight: 'bold' } 
      },
      xaxis: { categories: levelLabels, title: { text: 'Nivel', style: { fontSize: '14px' } } },
      yaxis: { title: { text: 'Cantidad', style: { fontSize: '14px' } } },
      colors: ['#1ABC9C', '#F39C12', '#E74C3C', '#7F8C8D'],
      legend: { position: 'bottom', labels: { style: { fontSize: '14px' } } },
      dataLabels: { enabled: false }
    });

    // (D) Gráfico Pie 3D (disco 3D) para el Último Mes
    const lastMonth = acumulado[acumulado.length - 1] || { 
      cumple: 0, 
      cumpleParcial: 0, 
      noCumple: 0, 
      noMedido: 0 
    };
    const totalLastMonth = lastMonth.cumple + lastMonth.cumpleParcial + lastMonth.noCumple + lastMonth.noMedido || 1;
    const pieValues = [
      (lastMonth.cumple / totalLastMonth) * 100,
      (lastMonth.cumpleParcial / totalLastMonth) * 100,
      (lastMonth.noCumple / totalLastMonth) * 100,
      (lastMonth.noMedido / totalLastMonth) * 100,
    ];
    setPieSeries(pieValues);
    setPieOptions({
      chart: { 
        type: 'pie', 
        height: 500,
        toolbar: { show: false },
        // DropShadow para simular 3D
        dropShadow: { enabled: true, top: 5, left: 0, blur: 15, opacity: 0.5 }
      },
      title: { 
        text: 'Estado de Cumplimiento (Último Mes)', 
        style: { fontSize: '20px', fontWeight: 'bold' } 
      },
      labels: ['Cumple', 'Cumple Parcial', 'No Cumple', 'No Medido'],
      colors: ['#1ABC9C', '#F39C12', '#E74C3C', '#7F8C8D'],
      dataLabels: { style: { fontSize: '14px' } },
      legend: { position: 'bottom', labels: { style: { fontSize: '14px' } } },
      // Usamos tipo "pie" sin el efecto donut para que luzca como un disco
      plotOptions: {
        pie: {
          expandOnClick: true,
          offsetX: 0,
          offsetY: 0,
          customScale: 1
        }
      }
    });
  }, [procesos, acumulado, nivelStatsData]);

  if (
    !radarSeries.length ||
    !areaSeries.length ||
    !nivelSeries.length ||
    !pieSeries.length
  ) {
    return <div className="text-center text-lg font-bold">Cargando datos...</div>;
  }

  // Función para exportar a PDF utilizando html2canvas y jsPDF
  const exportPDF = () => {
    if (!containerRef.current) return;
    html2canvas(containerRef.current, { scale: 2, backgroundColor: '#ffffff' })
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
        console.error('Error al exportar PDF:', err);
      });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md" id="reportContainer" ref={containerRef}>
      <h2 className="text-2xl font-bold mb-4 text-center">
        Reporte Estadístico de Cumplimiento
      </h2>

      {/* Gráfico Radar */}
      <div className="mb-8">
        <Chart options={radarOptions} series={radarSeries} type="radar" height="700" />
      </div>

      {/* Gráfico de Área Apilada */}
      <div className="mb-8">
        <Chart options={areaOptions} series={areaSeries} type="area" height="500" />
      </div>

      {/* Gráfico de Barras (Estadísticas por Nivel ISM3) */}
      <div className="mb-8">
        <Chart options={nivelOptions} series={nivelSeries} type="bar" height="500" />
      </div>

      {/* Gráfico Pie 3D (disco 3D) */}
      <div className="mb-8">
        <Chart options={pieOptions} series={pieSeries} type="pie" height="500" />
      </div>

      {/* Botón para exportar el reporte a PDF */}
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

export default Reportes;
