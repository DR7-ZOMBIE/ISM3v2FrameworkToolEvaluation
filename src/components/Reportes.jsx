// Reportes.jsx
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
import { 
  Container, Typography, Button, Paper, Box, Grid, 
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { db, collection, getDocs } from '../firebase-config';
import html2canvas from 'html2canvas';

// Importa componentes de react‑pdf
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// Asegúrate de haber instalado @react-pdf/renderer:
// npm install @react-pdf/renderer

// Registro de plugins de ChartJS
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
  noMedidoBorder: '#7F8C8D'
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

  possibleCategories.forEach((category) => {
    categoryStats[category] = {
      nombre: categoryNames[category],
      cumple: 0,
      cumpleParcial: 0,
      noCumple: 0,
      noMedido: 0
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

/* ===================== COMPONENTES PARA PDF (react-pdf) ===================== */

// Estilos para el PDF con un diseño más cuidado
const pdfStyles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 30,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
    color: '#555',
    textDecoration: 'underline',
  },
  image: {
    marginBottom: 10,
    width: '100%',
    height: 'auto',
  },
  footer: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});

// Documento PDF que recibe las imágenes (en base64) de cada gráfico
const MyDocument = ({ pdfData }) => (
  <Document>
    <Page style={pdfStyles.page}>
      <Text style={pdfStyles.header}>Reporte de Cumplimiento</Text>
      {pdfData.radar && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Gráfico Radar</Text>
          <Image style={pdfStyles.image} src={pdfData.radar} />
        </View>
      )}
      {pdfData.line && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Gráfico de Línea</Text>
          <Image style={pdfStyles.image} src={pdfData.line} />
        </View>
      )}
      {pdfData.bar && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Gráfico Barras</Text>
          <Image style={pdfStyles.image} src={pdfData.bar} />
        </View>
      )}
      {pdfData.pie && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Gráfico Pie</Text>
          <Image style={pdfStyles.image} src={pdfData.pie} />
        </View>
      )}
      {pdfData.stacked && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Gráfico Área Apilada</Text>
          <Image style={pdfStyles.image} src={pdfData.stacked} />
        </View>
      )}
      {pdfData.grouped && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Gráfico Barras Agrupadas</Text>
          <Image style={pdfStyles.image} src={pdfData.grouped} />
        </View>
      )}
      {pdfData.donut && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Gráfico Donut</Text>
          <Image style={pdfStyles.image} src={pdfData.donut} />
        </View>
      )}
      {pdfData.gauge && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Indicador Global</Text>
          <Image style={pdfStyles.image} src={pdfData.gauge} />
        </View>
      )}
      {pdfData.boxPlot && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Box Plot</Text>
          <Image style={pdfStyles.image} src={pdfData.boxPlot} />
        </View>
      )}
      {pdfData.violin && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Violin Plot</Text>
          <Image style={pdfStyles.image} src={pdfData.violin} />
        </View>
      )}
      <Text style={pdfStyles.footer}>Velasco & Calle</Text>
    </Page>
  </Document>
);

// Componente que muestra el enlace para descargar el PDF
const ReportePDF = ({ pdfData }) => (
  <Box sx={{ mt: 2, textAlign: 'center' }}>
    <PDFDownloadLink document={<MyDocument pdfData={pdfData} />} fileName="reporte_cumplimiento.pdf">
      {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar Reporte en PDF')}
    </PDFDownloadLink>
  </Box>
);

//////////////////////////////////////////////////////////////////
// COMPONENTE PRINCIPAL: REPORTES (con selección de cliente responsive)
//////////////////////////////////////////////////////////////////

// Función para capturar el elemento (usando html2canvas) y obtener la imagen en base64
const getElementImage = async (elementRef) => {
  if (elementRef.current) {
    const canvas = await html2canvas(elementRef.current, {
      scale: 3, // Aumentamos el scale para mayor resolución
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    return canvas.toDataURL('image/png');
  }
  return null;
};

const Reportes = () => {
  const clients = [
    { name: 'Universidad Cooperativa de Colombia', code: 'UCC', collection: 'procesos_UCC' },
    { name: 'Cajacopi', code: 'CAJACOPI', collection: 'procesos_Cajacopi' },
    { name: 'Cámara de Comercio de Medellín', code: 'CAMARA', collection: 'procesos_Camara' },
    { name: 'SisteCrédito', code: 'SISTECREDITO', collection: 'procesos' }
  ];

  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState({});

  // Refs asignadas al contenedor de cada gráfico (se usa Paper para capturar todo el bloque)
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

  // Estados para datos de gráficos (estos se actualizan con tus cálculos; aquí se usan ejemplos)
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

  const fetchAndProcessData = async () => {
    try {
      // Ejemplo: obtenemos datos desde Firestore (reemplaza esto con tu lógica)
      let procesos = await fetchDocumentsFromFirestore(selectedClient.collection);
      if (procesos.length === 0 && selectedClient.collection !== 'procesos') {
        procesos = await fetchDocumentsFromFirestore('procesos');
      }
      const acumulado = await fetchDocumentsFromFirestore('acumulado');
      const nivelStatsData = await fetchDocumentsFromFirestore('nivelStats');

      // Realiza tus cálculos y actualiza estados (aquí se usa la lógica que ya tienes)
      const catStats = calculateCategoryStats(procesos);
      const catKeysAll = Object.keys(catStats);
      const catKeysFiltered = catKeysAll.filter(key => {
        const s = catStats[key];
        return (s.cumple + s.cumpleParcial + s.noCumple + s.noMedido) > 0;
      });

      // Radar: % de "Cumple" por categoría
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
        pointRadius: 4
      };
      setRadarData({
        labels: catKeysFiltered.map(key => catStats[key].nombre.toUpperCase()),
        datasets: [radarDataset]
      });

      // Línea: Evolución mensual acumulada (Área Apilada)
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
          pointRadius: 4
        };
      }).filter(ds => ds !== null);
      setLineData({ labels: labelsLine, datasets: filteredLineDatasets });
      setStackedLineData({ labels: labelsLine, datasets: filteredLineDatasets });

      // Barras: Estadísticas por nivel ISM3
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
          borderWidth: 1
        };
      }).filter(ds => ds !== null);
      setBarData({ labels: nivelLabels, datasets: filteredBarDatasets });

      // Pie: Estado de cumplimiento del último mes
      const lastMonthData = acumulado[acumulado.length - 1] || { cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
      const totalLastMonth = lastMonthData.cumple + lastMonthData.cumpleParcial + lastMonthData.noCumple + lastMonthData.noMedido || 1;
      const rawPieData = [
        Math.round((lastMonthData.cumple / totalLastMonth) * 100),
        Math.round((lastMonthData.cumpleParcial / totalLastMonth) * 100),
        Math.round((lastMonthData.noCumple / totalLastMonth) * 100),
        Math.round((lastMonthData.noMedido / totalLastMonth) * 100)
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
          borderWidth: 2
        }]
      });

      // Grouped Bar Chart: Estadísticas por categoría (conteo)
      const groupedStates = [
        { label: 'Cumple', field: 'cumple', backgroundColor: colors.cumple, borderColor: colors.cumpleBorder },
        { label: 'Cumple Parcial', field: 'cumpleParcial', backgroundColor: colors.parcial, borderColor: colors.parcialBorder },
        { label: 'No Cumple', field: 'noCumple', backgroundColor: colors.noCumple, borderColor: colors.noCumpleBorder },
        { label: 'No Medido', field: 'noMedido', backgroundColor: colors.noMedido, borderColor: colors.noMedidoBorder }
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
          borderWidth: 1
        };
      }).filter(ds => ds !== null);
      setGroupedCategoryData({
        labels: catKeysFiltered.map(key => catStats[key].nombre.toUpperCase()),
        datasets: filteredGroupedDatasets
      });

      // Donut Chart: Global acumulado
      let totalCumpleVal = 0, totalCumpleParcialVal = 0, totalNoCumpleVal = 0, totalNoMedidoVal = 0;
      acumulado.forEach(item => {
        totalCumpleVal += item.cumple;
        totalCumpleParcialVal += item.cumpleParcial;
        totalNoCumpleVal += item.noCumple;
        totalNoMedidoVal += item.noMedido;
      });
      const totalOverall = totalCumpleVal + totalCumpleParcialVal + totalNoCumpleVal + totalNoMedidoVal;
      const rawDonutData = [
        Math.round((totalCumpleVal / totalOverall) * 100),
        Math.round((totalCumpleParcialVal / totalOverall) * 100),
        Math.round((totalNoCumpleVal / totalOverall) * 100),
        Math.round((totalNoMedidoVal / totalOverall) * 100)
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
          borderWidth: 2
        }]
      });

      // Gauge Chart: Indicador global de cumplimiento
      const overallPctCumple = Math.round((totalCumpleVal / totalOverall) * 100);
      setGaugeData({
        labels: ['Cumple', 'Restante'],
        datasets: [{
          data: [overallPctCumple, 100 - overallPctCumple],
          backgroundColor: [colors.cumple, "#e0e0e0"],
          borderWidth: 0
        }]
      });

      // Box Plot y Violin Plot
      const labelsPlot = acumulado.map(item => item.mes);
      const boxData = acumulado.map(item => computeBoxPlotStats(item.cumple));
      const scatterCumpleParcial = acumulado.map(item => ({ x: item.mes, y: item.cumpleParcial }));
      const scatterNoCumple = acumulado.map(item => ({ x: item.mes, y: item.noCumple }));
      const scatterNoMedido = acumulado.map(item => ({ x: item.mes, y: item.noMedido }));

      setCombinedBoxPlotData({
        labels: labelsPlot,
        datasets: [
          {
            type: 'boxplot',
            label: 'Cumple',
            data: boxData,
            backgroundColor: colors.cumple.replace('0.6', '0.3'),
            borderColor: colors.cumpleBorder,
            borderWidth: 1
          },
          {
            type: 'scatter',
            label: 'Cumple Parcial',
            data: scatterCumpleParcial,
            backgroundColor: colors.parcial,
            borderColor: colors.parcialBorder,
            pointRadius: 10
          },
          {
            type: 'scatter',
            label: 'No Cumple',
            data: scatterNoCumple,
            backgroundColor: colors.noCumple,
            borderColor: colors.noCumpleBorder,
            pointRadius: 10
          },
          {
            type: 'scatter',
            label: 'No Medido',
            data: scatterNoMedido,
            backgroundColor: colors.noMedido,
            borderColor: colors.noMedidoBorder,
            pointRadius: 10
          }
        ]
      });

      setCombinedViolinData({
        labels: labelsPlot,
        datasets: [
          {
            type: 'violin',
            label: 'Cumple',
            data: boxData,
            backgroundColor: colors.cumple.replace('0.6', '0.3'),
            borderColor: colors.cumpleBorder,
            borderWidth: 1
          },
          {
            type: 'scatter',
            label: 'Cumple Parcial',
            data: scatterCumpleParcial,
            backgroundColor: colors.parcial,
            borderColor: colors.parcialBorder,
            pointRadius: 10
          },
          {
            type: 'scatter',
            label: 'No Cumple',
            data: scatterNoCumple,
            backgroundColor: colors.noCumple,
            borderColor: colors.noCumpleBorder,
            pointRadius: 10
          },
          {
            type: 'scatter',
            label: 'No Medido',
            data: scatterNoMedido,
            backgroundColor: colors.noMedido,
            borderColor: colors.noMedidoBorder,
            pointRadius: 10
          }
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

  // Función que usa html2canvas para capturar el contenedor de cada gráfico y obtener la imagen en base64.
  const generarImagenesPDF = async () => {
    // Un pequeño retraso para asegurarnos de que los elementos estén renderizados
    setTimeout(async () => {
      const nuevosDatos = {};
      nuevosDatos.radar = await getElementImage(radarRef);
      nuevosDatos.line = await getElementImage(lineRef);
      nuevosDatos.bar = await getElementImage(barRef);
      nuevosDatos.pie = await getElementImage(pieRef);
      nuevosDatos.stacked = await getElementImage(stackedRef);
      nuevosDatos.grouped = await getElementImage(groupedRef);
      nuevosDatos.donut = await getElementImage(donutRef);
      nuevosDatos.gauge = await getElementImage(gaugeRef);
      nuevosDatos.boxPlot = await getElementImage(boxPlotRef);
      nuevosDatos.violin = await getElementImage(violinRef);
      console.log('PDF Data:', nuevosDatos);
      setPdfData(nuevosDatos);
    }, 500);
  };

  if (loading) {
    return <Typography align="center" variant="h5">Cargando datos...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: '#f7f7f7', color: '#333', py: 4 }}>
      {/* Selección de Cliente con componentes Material-UI */}
      <Box 
        mb={4} 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel id="client-select-label">Cliente</InputLabel>
          <Select
            labelId="client-select-label"
            value={selectedClient.code}
            label="Cliente"
            onChange={(e) => {
              const client = clients.find(c => c.code === e.target.value);
              setSelectedClient(client);
            }}
          >
            {clients.map(client => (
              <MenuItem key={client.code} value={client.code}>{client.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Typography 
        variant="h5" 
        align="center" 
        gutterBottom 
        sx={{ fontWeight: 'bold', mb: 4 }}
      >
        Reporte de Cumplimiento
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {/* (A) Radar */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={radarRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
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
                    grid: { color: 'rgba(0,0,0,0.1)' }
                  }
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { formatter: (value) => (value === null ? '' : `${value}%`), color: '#000', font: { weight: 'bold', family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (B) Stacked Area Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={stackedRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
              Evolución mensual (Área Apilada)
            </Typography>
            <Line
              data={stackedLineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { stacked: true, grid: { display: false }, ticks: { padding: 20 } },
                  y: { stacked: true, beginAtZero: true, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } }
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { display: true }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (C) Grouped Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={groupedRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
              Estadísticas por categoría (Conteo)
            </Typography>
            <Bar
              data={groupedCategoryData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { padding: 20 } },
                  y: { beginAtZero: true, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } }
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { anchor: 'center', align: 'center', formatter: (value) => (value === null ? '' : value), color: '#000', font: { weight: 'bold', family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (D) Línea: Evolución Mensual Acumulada */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={lineRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
              Evolución mensual acumulado
            </Typography>
            <Line
              data={lineData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { padding: 20 } },
                  y: { beginAtZero: true, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } }
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { display: true, anchor: 'center', align: 'center', offset: 0, formatter: (value) => value, color: '#000', font: { weight: 'bold', family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (E) Barras: Nivel ISM3 */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={barRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
              Cumplimiento por nivel ISM3
            </Typography>
            <Bar
              data={barData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { padding: 20 } },
                  y: { beginAtZero: true, max: 100, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)', lineWidth: 1, drawTicks: false }, ticks: { padding: 20 } }
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false },
                  datalabels: { anchor: 'center', align: 'center', formatter: (value) => value === 0 ? '' : `${value}%`, color: '#000', font: { weight: 'bold', family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (F) Donut Chart: Global Acumulado */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={donutRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
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
                  datalabels: { formatter: (value) => `${value}%`, color: '#000', font: { weight: 'bold', family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (G) Gauge Chart: Indicador Global de Cumplimiento */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 3, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={gaugeRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
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
                  tooltip: { enabled: false }
                }
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
          <Paper 
            elevation={4} 
            sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={pieRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
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
                  datalabels: { formatter: (value) => `${value}%`, color: '#000', font: { weight: 'bold', size: 12, family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (I) Box Plot */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={boxPlotRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
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
                  datalabels: { display: false }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (J) Violin Plot */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={4} 
            sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} 
            ref={violinRef}
          >
            <Typography 
              variant="subtitle1" 
              align="center" 
              gutterBottom 
              sx={{ fontWeight: 'bold' }}
            >
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
                  datalabels: { display: false }
                }
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Box textAlign="center" mt={4}>
        <Button
          variant="contained"
          color="primary"
          onClick={generarImagenesPDF}
          sx={{ fontWeight: 'bold', px: 4, py: 1, mr: 2 }}
        >
          Preparar PDF
        </Button>
        {pdfData.radar && <ReportePDF pdfData={pdfData} />}
      </Box>
    </Container>
  );
};

export default Reportes;
