import React, { useState, useEffect, useRef } from 'react';
import { Radar, Bar, Pie, Line, Doughnut, Chart } from 'react-chartjs-2';
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
  Filler,
  ScatterController
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { BoxPlotController, BoxAndWiskers, ViolinController, Violin } from '@sgratzl/chartjs-chart-boxplot';
import { Container, Typography, Button, Paper, Box, Grid } from '@mui/material';
import { db, collection, getDocs } from '../firebase-config';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Registro de controladores y plugins
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
  Filler,
  ChartDataLabels,
  ScatterController,
  BoxPlotController,
  BoxAndWiskers,
  ViolinController,
  Violin
);

const colors = {
  cumple: 'rgba(26, 188, 156, 0.6)',
  cumpleBorder: '#1ABC9C',
  parcial: 'rgba(243, 156, 18, 0.6)',
  parcialBorder: '#F39C12',
  noCumple: 'rgba(231, 76, 60, 0.6)',
  noCumpleBorder: '#E74C3C',
  noMedido: 'rgba(127, 140, 141, 0.6)',
  noMedidoBorder: '#7F8C8D',
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

const computeBoxPlotStats = (value) => ({ min: value, q1: value, median: value, q3: value, max: value });

const Reportes = () => {
  // Definición de clientes (debes tener los mismos datos que en Evaluación)
  const clients = [
    {
      name: 'Universidad Cooperativa de Colombia',
      code: 'UCC',
      collection: 'procesos_UCC',
    },
    {
      name: 'Cajacopi',
      code: 'CAJACOPI',
      collection: 'procesos_Cajacopi',
    },
    {
      name: 'Cámara de Comercio de Medellín',
      code: 'CAMARA',
      collection: 'procesos_Camara',
    },
    {
      name: 'SisteCrédito',
      code: 'SISTECREDITO',
      collection: 'procesos', // La colección original
    }
  ];
  
  // Estado para el cliente seleccionado (por defecto el primero)
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  
  // Refs para exportar a PDF y para cada gráfico
  const radarRef = useRef(null);
  const lineRef = useRef(null);
  const barRef = useRef(null);
  const pieRef = useRef(null);
  const stackedRef = useRef(null);
  const groupedRef = useRef(null);
  const donutRef = useRef(null);
  const gaugeRef = useRef(null);
  const boxPlotRef = useRef(null);
  const violinRef = useRef(null);

  // Estados para los datos de gráficos
  const [radarData, setRadarData] = useState({});
  const [lineData, setLineData] = useState({});
  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});
  const [stackedLineData, setStackedLineData] = useState({});
  const [groupedCategoryData, setGroupedCategoryData] = useState({});
  const [donutOverallData, setDonutOverallData] = useState({});
  const [gaugeData, setGaugeData] = useState({});
  const [combinedBoxPlotData, setCombinedBoxPlotData] = useState({});
  const [combinedViolinData, setCombinedViolinData] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAndProcessData = async () => {
    try {
      // Usamos la colección del cliente seleccionado
      let procesos = await fetchDocumentsFromFirestore(selectedClient.collection);
      // Si la colección está vacía (y no es SisteCrédito), usamos la data de 'procesos'
      if (procesos.length === 0 && selectedClient.collection !== 'procesos') {
        procesos = await fetchDocumentsFromFirestore('procesos');
      }
      const acumulado = await fetchDocumentsFromFirestore('acumulado');
      const nivelStatsData = await fetchDocumentsFromFirestore('nivelStats');

      // Estadísticas por Categoría (Radar, barras, etc.)
      const catStats = calculateCategoryStats(procesos);
      const catKeysAll = Object.keys(catStats);
      const catKeysFiltered = catKeysAll.filter(key => {
        const s = catStats[key];
        return (s.cumple + s.cumpleParcial + s.noCumple + s.noMedido) > 0;
      });

      // Radar: % de "Cumple" por Categoría
      const radarValues = catKeysFiltered.map(key => {
        const s = catStats[key];
        const total = s.cumple + s.cumpleParcial + s.noCumple + s.noMedido;
        const val = total > 0 ? Math.round((s.cumple / total) * 100) : 0;
        return val === 0 ? null : val;
      });
      const radarDataset = {
        label: 'Cumple',
        data: radarValues,
        backgroundColor: colors.cumple.replace('0.6', '0.3'),
        borderColor: colors.cumpleBorder,
        borderWidth: 2,
        pointBackgroundColor: colors.cumpleBorder,
        pointRadius: 4,
      };
      setRadarData({
        labels: catKeysFiltered.map(key => catStats[key].nombre.toUpperCase()),
        datasets: [radarDataset],
      });

      // Línea: Evolución Mensual Acumulada (Área Apilada)
      const labelsLine = acumulado.map(item => item.mes);
      const lineStates = [
        { label: 'Cumple', field: 'cumple', backgroundColor: colors.cumple, borderColor: colors.cumpleBorder },
        { label: 'Cumple Parcial', field: 'cumpleParcial', backgroundColor: colors.parcial, borderColor: colors.parcialBorder },
        { label: 'No Cumple', field: 'noCumple', backgroundColor: colors.noCumple, borderColor: colors.noCumpleBorder },
        { label: 'No Medido', field: 'noMedido', backgroundColor: colors.noMedido, borderColor: colors.noMedidoBorder }
      ];
      const filteredLineDatasets = lineStates.map(st => {
        const data = acumulado.map(item => item[st.field]);
        if (data.every(val => val === 0)) return null;
        return {
          label: st.label,
          data,
          backgroundColor: st.backgroundColor,
          borderColor: st.borderColor,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
        };
      }).filter(ds => ds !== null);
      setLineData({ labels: labelsLine, datasets: filteredLineDatasets });
      setStackedLineData({ labels: labelsLine, datasets: filteredLineDatasets });

      // Barras: Estadísticas por Nivel ISM3
      const nivelLabels = nivelStatsData.map(item => item.nombre || `Nivel ${item.nivel}`);
      const barStates = [
        { label: 'Cumple', field: 'pcCumple', backgroundColor: colors.cumple, borderColor: colors.cumpleBorder },
        { label: 'Cumple Parcial', field: 'pcParcial', backgroundColor: colors.parcial, borderColor: colors.parcialBorder },
        { label: 'No Cumple', field: 'pcNoCumple', backgroundColor: colors.noCumple, borderColor: colors.noCumpleBorder },
        { label: 'No Medido', field: 'pcNoMedido', backgroundColor: colors.noMedido, borderColor: colors.noMedidoBorder }
      ];
      const filteredBarDatasets = barStates.map(st => {
        const data = nivelStatsData.map(item => parseFloat(item[st.field].replace('%', '')));
        if (data.every(val => val === 0)) return null;
        return {
          label: st.label,
          data,
          backgroundColor: st.backgroundColor,
          borderColor: st.borderColor,
          borderWidth: 1,
        };
      }).filter(ds => ds !== null);
      setBarData({ labels: nivelLabels, datasets: filteredBarDatasets });

      // Pie: Estado de Cumplimiento del Último Mes
      const lastMonth = acumulado[acumulado.length - 1] || { cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
      const totalLastMonth = lastMonth.cumple + lastMonth.cumpleParcial + lastMonth.noCumple + lastMonth.noMedido || 1;
      const rawPieData = [
        Math.round((lastMonth.cumple / totalLastMonth) * 100),
        Math.round((lastMonth.cumpleParcial / totalLastMonth) * 100),
        Math.round((lastMonth.noCumple / totalLastMonth) * 100),
        Math.round((lastMonth.noMedido / totalLastMonth) * 100),
      ];
      const pieBaseLabels = ['Cumple', 'Cumple Parcial', 'No Cumple', 'No Medido'];
      const pieDataFiltered = [];
      const pieLabelsFiltered = [];
      const pieColorsFiltered = [];
      rawPieData.forEach((value, i) => {
        if (value > 0) {
          pieLabelsFiltered.push(pieBaseLabels[i]);
          pieDataFiltered.push(value);
          if (i === 0) pieColorsFiltered.push(colors.cumple);
          if (i === 1) pieColorsFiltered.push(colors.parcial);
          if (i === 2) pieColorsFiltered.push(colors.noCumple);
          if (i === 3) pieColorsFiltered.push(colors.noMedido);
        }
      });
      setPieData({
        labels: pieLabelsFiltered,
        datasets: [{
          data: pieDataFiltered,
          backgroundColor: pieColorsFiltered,
          borderColor: '#fff',
          borderWidth: 2,
        }],
      });

      // Grouped Bar Chart: Estadísticas por Categoría (Conteo)
      const groupedStates = [
        { label: 'Cumple', field: 'cumple', backgroundColor: colors.cumple, borderColor: colors.cumpleBorder },
        { label: 'Cumple Parcial', field: 'cumpleParcial', backgroundColor: colors.parcial, borderColor: colors.parcialBorder },
        { label: 'No Cumple', field: 'noCumple', backgroundColor: colors.noCumple, borderColor: colors.noCumpleBorder },
        { label: 'No Medido', field: 'noMedido', backgroundColor: colors.noMedido, borderColor: colors.noMedidoBorder },
      ];
      const filteredGroupedDatasets = groupedStates.map(st => {
        const data = catKeysFiltered.map(key => {
          const val = catStats[key][st.field];
          return val === 0 ? null : val;
        });
        if (data.every(value => value === null)) return null;
        return {
          label: st.label,
          data,
          backgroundColor: st.backgroundColor,
          borderColor: st.borderColor,
          borderWidth: 1,
        };
      }).filter(ds => ds !== null);
      setGroupedCategoryData({
        labels: catKeysFiltered.map(key => catStats[key].nombre.toUpperCase()),
        datasets: filteredGroupedDatasets,
      });

      // Donut Chart: Global Acumulado
      let totalCumple = 0, totalCumpleParcial = 0, totalNoCumple = 0, totalNoMedido = 0;
      acumulado.forEach(item => {
        totalCumple += item.cumple;
        totalCumpleParcial += item.cumpleParcial;
        totalNoCumple += item.noCumple;
        totalNoMedido += item.noMedido;
      });
      const totalOverall = totalCumple + totalCumpleParcial + totalNoCumple + totalNoMedido;
      const rawDonutData = [
        Math.round((totalCumple / totalOverall) * 100),
        Math.round((totalCumpleParcial / totalOverall) * 100),
        Math.round((totalNoCumple / totalOverall) * 100),
        Math.round((totalNoMedido / totalOverall) * 100),
      ];
      const donutBaseLabels = ['Cumple', 'Cumple Parcial', 'No Cumple', 'No Medido'];
      const donutDataFiltered = [];
      const donutLabelsFiltered = [];
      const donutColorsFiltered = [];
      rawDonutData.forEach((value, i) => {
        if (value > 0) {
          donutLabelsFiltered.push(donutBaseLabels[i]);
          donutDataFiltered.push(value);
          if (i === 0) donutColorsFiltered.push(colors.cumple);
          if (i === 1) donutColorsFiltered.push(colors.parcial);
          if (i === 2) donutColorsFiltered.push(colors.noCumple);
          if (i === 3) donutColorsFiltered.push(colors.noMedido);
        }
      });
      setDonutOverallData({
        labels: donutLabelsFiltered,
        datasets: [{
          data: donutDataFiltered,
          backgroundColor: donutColorsFiltered,
          borderColor: '#fff',
          borderWidth: 2,
        }],
      });

      // Gauge Chart: Indicador global de cumplimiento
      const overallPctCumple = Math.round((totalCumple / totalOverall) * 100);
      setGaugeData({
        labels: ['Cumple', 'Restante'],
        datasets: [{
          data: [overallPctCumple, 100 - overallPctCumple],
          backgroundColor: [colors.cumple, "#e0e0e0"],
          borderWidth: 0,
        }],
      });

      // Box Plot y Violin Plot
      const labels = acumulado.map(item => item.mes);
      const boxData = acumulado.map(item => computeBoxPlotStats(item.cumple));
      const scatterCumpleParcial = acumulado.map(item => ({ x: item.mes, y: item.cumpleParcial }));
      const scatterNoCumple = acumulado.map(item => ({ x: item.mes, y: item.noCumple }));
      const scatterNoMedido = acumulado.map(item => ({ x: item.mes, y: item.noMedido }));

      setCombinedBoxPlotData({
        labels,
        datasets: [
          {
            type: 'boxplot',
            label: 'Cumple',
            data: boxData,
            backgroundColor: colors.cumple.replace('0.6', '0.3'),
            borderColor: colors.cumpleBorder,
            borderWidth: 1,
          },
          {
            type: 'scatter',
            label: 'Cumple Parcial',
            data: scatterCumpleParcial,
            backgroundColor: colors.parcial,
            borderColor: colors.parcialBorder,
            pointRadius: 10,
          },
          {
            type: 'scatter',
            label: 'No Cumple',
            data: scatterNoCumple,
            backgroundColor: colors.noCumple,
            borderColor: colors.noCumpleBorder,
            pointRadius: 10,
          },
          {
            type: 'scatter',
            label: 'No Medido',
            data: scatterNoMedido,
            backgroundColor: colors.noMedido,
            borderColor: colors.noMedidoBorder,
            pointRadius: 10,
          },
        ]
      });

      setCombinedViolinData({
        labels,
        datasets: [
          {
            type: 'violin',
            label: 'Cumple',
            data: boxData,
            backgroundColor: colors.cumple.replace('0.6', '0.3'),
            borderColor: colors.cumpleBorder,
            borderWidth: 1,
          },
          {
            type: 'scatter',
            label: 'Cumple Parcial',
            data: scatterCumpleParcial,
            backgroundColor: colors.parcial,
            borderColor: colors.parcialBorder,
            pointRadius: 10,
          },
          {
            type: 'scatter',
            label: 'No Cumple',
            data: scatterNoCumple,
            backgroundColor: colors.noCumple,
            borderColor: colors.noCumpleBorder,
            pointRadius: 10,
          },
          {
            type: 'scatter',
            label: 'No Medido',
            data: scatterNoMedido,
            backgroundColor: colors.noMedido,
            borderColor: colors.noMedidoBorder,
            pointRadius: 10,
          },
        ]
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessData();
  }, [selectedClient]);

  const exportPDF = () => {
    const refs = [radarRef, lineRef, barRef, pieRef, stackedRef, groupedRef, donutRef, gaugeRef, boxPlotRef, violinRef];
    Promise.all(refs.map(ref =>
      html2canvas(ref.current, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
    ))
      .then((canvases) => {
        const pdf = new jsPDF('p', 'mm', 'a4');
        canvases.forEach((canvas, index) => {
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const ratio = canvas.height / canvas.width;
          const imgHeight = pdfWidth * ratio;
          if (index > 0) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        });
        pdf.setFontSize(14);
        pdf.text(
          'Velasco & Calle',
          pdf.internal.pageSize.getWidth() / 2,
          pdf.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        pdf.save('reporte_cumplimiento.pdf');
      })
      .catch((err) => {
        console.error('Error al exportar PDF:', err);
      });
  };

  if (loading) {
    return <Typography align="center" variant="h5">Cargando datos...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: '#f7f7f7', color: '#333', py: 4 }}>
      {/* Selección de Cliente */}
      <Box mb={4} display="flex" alignItems="center">
        <Typography variant="h6" sx={{ mr: 2, fontWeight: 'bold' }}>Cliente:</Typography>
        <select
          value={selectedClient.code}
          onChange={(e) => {
            const client = clients.find(c => c.code === e.target.value);
            setSelectedClient(client);
          }}
          style={{ padding: '8px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {clients.map(client => (
            <option key={client.code} value={client.code}>{client.name}</option>
          ))}
        </select>
      </Box>
      <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Reporte de cumplimiento
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {/* Aquí se renderizan los gráficos (Radar, Line, Bar, Pie, etc.) */}
        {/* (A) Radar */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} ref={radarRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              % por categoría (Radar)
            </Typography>
            <Radar
              data={radarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    min: 0,
                    max: 100,
                    ticks: { stepSize: 10, padding: 20, backdropColor: 'transparent' },
                    grid: { color: 'rgba(0,0,0,0.1)' },
                  },
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { formatter: (value) => (value === null ? '' : `${value}%`), color: '#000', font: { weight: 'bold', family: 'Roboto' } },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (B) Stacked Area Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} ref={stackedRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Evolución mensual (Área Apilada)
            </Typography>
            <Line
              data={stackedLineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true, grid: { display: false }, ticks: { padding: 20 } },
                  y: { stacked: true, beginAtZero: true, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } },
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { display: true },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (C) Grouped Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} ref={groupedRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Estadísticas por categoría (Conteo)
            </Typography>
            <Bar
              data={groupedCategoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { padding: 20 } },
                  y: { beginAtZero: true, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } },
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { anchor: 'center', align: 'center', formatter: (value) => (value === null ? '' : value), color: '#000', font: { weight: 'bold', family: 'Roboto' } },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (D) Línea: Evolución Mensual Acumulada */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} ref={lineRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Evolución mensual acumulado
            </Typography>
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { padding: 20 } },
                  y: { beginAtZero: true, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } },
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { display: true, anchor: 'center', align: 'center', offset: 0, formatter: (value) => value, color: '#000', font: { weight: 'bold', family: 'Roboto' } },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (E) Barras: Nivel ISM3 */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} ref={barRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Cumplimiento por nivel ISM3
            </Typography>
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { padding: 20 } },
                  y: { beginAtZero: true, max: 100, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } },
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { anchor: 'center', align: 'center', formatter: (value) => value === 0 ? '' : `${value}%`, color: '#000', font: { weight: 'bold', family: 'Roboto' } },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (F) Donut Chart: Global Acumulado */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} ref={donutRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Global acumulado (Donut)
            </Typography>
            <Pie
              data={donutOverallData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '50%',
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { formatter: (value) => `${value}%`, color: '#000', font: { weight: 'bold', family: 'Roboto' } },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (G) Gauge Chart: Indicador Global de Cumplimiento */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} ref={gaugeRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Indicador global de cumplimiento
            </Typography>
            <Doughnut
              data={gaugeData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                rotation: -90,
                circumference: 180,
                cutout: '70%',
                plugins: {
                  legend: { display: false },
                  title: { display: false },
                  datalabels: { display: false },
                  tooltip: { enabled: false },
                },
              }}
              redraw
            />
            <Box
              sx={{
                position: 'relative',
                top: '-160px',
                textAlign: 'center',
                fontSize: '2rem',
                fontWeight: 'bold',
                color: colors.cumpleBorder,
                fontFamily: 'Roboto'
              }}
            >
              {gaugeData.datasets[0].data[0]}%
            </Box>
          </Paper>
        </Grid>
        {/* (H) Pie: Último Mes */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} ref={pieRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Estado de cumplimiento (Último Mes)
            </Typography>
            <Pie
              data={pieData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { formatter: (value) => `${value}%`, color: '#000', font: { weight: 'bold', size: 12, family: 'Roboto' } },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (I) Box Plot */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} ref={boxPlotRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Evolución mensual (Box Plot)
            </Typography>
            <Chart
              data={combinedBoxPlotData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { type: 'category' }, y: { beginAtZero: true } },
                plugins: {
                  tooltip: { enabled: true },
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  datalabels: { display: false },
                },
              }}
            />
          </Paper>
        </Grid>
        {/* (J) Violin Plot */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} ref={violinRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Evolución mensual (Violin Plot)
            </Typography>
            <Chart
              data={combinedViolinData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: { x: { type: 'category' }, y: { beginAtZero: true } },
                plugins: {
                  tooltip: { enabled: true },
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  datalabels: { display: false },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      <Box textAlign="center" mt={4}>
        <Button variant="contained" color="primary" onClick={exportPDF} sx={{ fontWeight: 'bold', px: 4, py: 1 }}>
          Descargar reporte en PDF
        </Button>
      </Box>
    </Container>
  );
};

export default Reportes;
