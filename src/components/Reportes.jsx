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
  ScatterController,
  BubbleController // Importamos y registramos el BubbleController
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { 
  Container, Typography, Button, Paper, Box, Grid, 
  FormControl, InputLabel, Select, MenuItem 
} from '@mui/material';
import { db, collection, getDocs } from '../firebase-config';
import html2canvas from 'html2canvas';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// Registro de plugins de ChartJS, incluyendo el BubbleController
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
  BubbleController
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

// Función para obtener documentos desde Firestore
const fetchDocumentsFromFirestore = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};

// Función para capturar la imagen de un elemento (para PDF)
const getElementImage = async (elementRef) => {
  if (elementRef.current) {
    const canvas = await html2canvas(elementRef.current, {
      scale: 3,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
    return canvas.toDataURL('image/png');
  }
  return null;
};

// Configuración de estilos para PDF
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

// Componente para generar el documento PDF
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
      {pdfData.trendLine && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Promedio Móvil de Cumplimiento Global</Text>
          <Image style={pdfStyles.image} src={pdfData.trendLine} />
        </View>
      )}
      {pdfData.bubble && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.sectionTitle}>Volumen vs Cumplimiento</Text>
          <Image style={pdfStyles.image} src={pdfData.bubble} />
        </View>
      )}
      <Text style={pdfStyles.footer}>Velasco & Calle</Text>
    </Page>
  </Document>
);

const ReportePDF = ({ pdfData }) => (
  <Box sx={{ mt: 2, textAlign: 'center' }}>
    <PDFDownloadLink document={<MyDocument pdfData={pdfData} />} fileName="reporte_cumplimiento.pdf">
      {({ loading }) => (loading ? 'Generando PDF...' : 'Descargar Reporte en PDF')}
    </PDFDownloadLink>
  </Box>
);

const Reportes = () => {
  // Lista de clientes
  const clients = [
    { name: 'Universidad Cooperativa de Colombia', code: 'UCC', collection: 'procesos_UCC' },
    { name: 'Cajacopi', code: 'CAJACOPI', collection: 'procesos_Cajacopi' },
    { name: 'Cámara de Comercio de Medellín', code: 'CAMARA', collection: 'procesos_Camara' },
    { name: 'SisteCrédito', code: 'SISTECREDITO', collection: 'procesos' }
  ];
  const [selectedClient, setSelectedClient] = useState(clients[0]);
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState({});

  // Estado para almacenar la data de "acumulado"
  const [acumuladoData, setAcumuladoData] = useState([]);

  // Refs para capturar gráficos en el PDF
  const radarRef = useRef(null);
  const lineRef = useRef(null);
  const barRef = useRef(null);
  const pieRef = useRef(null);
  const stackedRef = useRef(null);
  const groupedRef = useRef(null);
  const donutRef = useRef(null);
  const gaugeRef = useRef(null);
  const trendLineRef = useRef(null);
  const bubbleRef = useRef(null);

  // Estados de gráficos
  const [radarData, setRadarData] = useState({});
  const [lineData, setLineData] = useState({});
  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});
  const [stackedLineData, setStackedLineData] = useState({});
  const [groupedCategoryData, setGroupedCategoryData] = useState({});
  const [donutOverallData, setDonutOverallData] = useState({});
  const [gaugeData, setGaugeData] = useState({});
  const [complianceTrendData, setComplianceTrendData] = useState({});
  const [bubbleChartData, setBubbleChartData] = useState({});

  const fetchAndProcessData = async () => {
    try {
      // Obtención de datos desde Firestore
      let procesos = await fetchDocumentsFromFirestore(selectedClient.collection);
      if (procesos.length === 0 && selectedClient.collection !== 'procesos') {
        procesos = await fetchDocumentsFromFirestore('procesos');
      }
      const acumulado = await fetchDocumentsFromFirestore('acumulado');
      setAcumuladoData(acumulado); // Guardamos la data en el estado

      const nivelStatsData = await fetchDocumentsFromFirestore(`nivelStats_${selectedClient.code}`);
      const catStatsArray = await fetchDocumentsFromFirestore(`categoryStats_${selectedClient.code}`);
      const catStats = {};
      catStatsArray.forEach(item => { 
        catStats[item.id] = item; 
      });
      const catKeysAll = Object.keys(catStats);
      const catKeysFiltered = catKeysAll.filter(key => {
        const s = catStats[key];
        return (s.cumple + s.cumpleParcial + s.noCumple + s.noMedido) > 0;
      });

      // (A) Radar Chart: % de "Cumple" por categoría
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

      // (B) Stacked Area Chart: Evolución mensual acumulada
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

      // (C) Grouped Bar Chart: Estadísticas por categoría (conteo)
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

      // (E) Barras: Cumplimiento por nivel ISM3
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

      // (F) Pie: Estado de cumplimiento del último mes
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

      // (G) Donut Chart: Global acumulado
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

      // (H) Gauge Chart: Indicador global de cumplimiento
      const overallPctCumple = Math.round((totalCumpleVal / totalOverall) * 100);
      setGaugeData({
        labels: ['Cumple', 'Restante'],
        datasets: [{
          data: [overallPctCumple, 100 - overallPctCumple],
          backgroundColor: [colors.cumple, "#e0e0e0"],
          borderWidth: 0
        }]
      });

      // -------------------------
      // NUEVO GRÁFICO EXPERTO: Promedio Móvil de Cumplimiento Global (3 meses)
      // -------------------------
      const overallPercentages = acumulado.map(item => {
        const total = item.cumple + item.cumpleParcial + item.noCumple + item.noMedido;
        return total > 0 ? Math.round((item.cumple / total) * 100) : 0;
      });
      const movingAverage = overallPercentages.map((val, i, arr) => {
        if (i < 2) return null;
        const sum = arr[i] + arr[i - 1] + arr[i - 2];
        return Math.round(sum / 3);
      });
      const movingAverageData = {
        labels: acumulado.map(item => item.mes),
        datasets: [
          {
            label: 'Cumplimiento (%)',
            data: overallPercentages,
            backgroundColor: colors.cumple.replace('0.6', '0.3'),
            borderColor: colors.cumpleBorder,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 4
          },
          {
            label: 'Promedio Móvil (3 meses)',
            data: movingAverage,
            backgroundColor: 'transparent',
            borderColor: '#2C3E50',
            borderWidth: 2,
            borderDash: [5, 5],
            fill: false,
            tension: 0.4,
            pointRadius: 3
          }
        ]
      };
      setComplianceTrendData(movingAverageData);

      // -------------------------
      // NUEVO GRÁFICO EXPERTO: Bubble Chart - Volumen vs Cumplimiento
      // -------------------------
      // Usamos acumuladoData para calcular los porcentajes y nombres de meses
      const overallPercentagesForBubble = acumulado.map(item => {
        const total = item.cumple + item.cumpleParcial + item.noCumple + item.noMedido;
        return total > 0 ? Math.round((item.cumple / total) * 100) : 0;
      });
      const bubbleDataPoints = acumulado.map((item, i) => {
        const total = item.cumple + item.cumpleParcial + item.noCumple + item.noMedido;
        return {
          x: i,
          y: overallPercentagesForBubble[i],
          r: total > 0 ? parseInt(Math.sqrt(total)) : 0,
          mes: item.mes  // Se incluye el nombre real del mes
        };
      });
      const bubbleData = {
        datasets: [{
          label: 'Volumen vs Cumplimiento',
          data: bubbleDataPoints,
          backgroundColor: colors.parcial,
          borderColor: colors.parcialBorder,
          borderWidth: 1
        }]
      };
      setBubbleChartData(bubbleData);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClient]);

  const generarImagenesPDF = async () => {
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
      nuevosDatos.trendLine = await getElementImage(trendLineRef);
      nuevosDatos.bubble = await getElementImage(bubbleRef);
      console.log('PDF Data:', nuevosDatos);
      setPdfData(nuevosDatos);
    }, 500);
  };

  if (loading) {
    return <Typography align="center" variant="h5">Cargando datos...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ backgroundColor: '#f7f7f7', color: '#333', py: 4 }}>
      {/* Selección de Cliente */}
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

        {/* (D) Línea: Evolución mensual acumulado */}
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

        {/* (E) Barras: Cumplimiento por nivel ISM3 */}
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
                  y: { beginAtZero: true, max: 100, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)' }, ticks: { padding: 20 } }
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

        {/* (F) Donut Chart: Global acumulado */}
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
                  datalabels: { formatter: (value) => `${value}%`, color: '#000', font: { weight: 'bold', family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (G) Gauge Chart: Indicador global de cumplimiento */}
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

        {/* (H) Pie: Estado de cumplimiento (Último Mes) */}
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
                  datalabels: { formatter: (value) => `${value}%`, color: '#000', font: { weight: 'bold', size: 12, family: 'Roboto' } }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (I) Promedio Móvil de Cumplimiento Global (3 meses) */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} ref={trendLineRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Promedio Móvil de Cumplimiento Global (3 meses)
            </Typography>
            <Line
              data={complianceTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  x: { grid: { display: false }, ticks: { padding: 20 } },
                  y: { beginAtZero: true, max: 100, grid: { display: true, drawBorder: false, color: 'rgba(0,0,0,0.1)' }, ticks: { padding: 20 } }
                },
                plugins: {
                  legend: { display: true, position: 'top', labels: { font: { family: 'Roboto', size: 12, weight: 'bold' } } },
                  title: { display: false }
                }
              }}
            />
          </Paper>
        </Grid>

        {/* (J) Bubble Chart: Volumen vs Cumplimiento */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 5, height: 500, borderRadius: '12px', width: '100%' }} ref={bubbleRef}>
            <Typography variant="subtitle1" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
              Volumen vs Cumplimiento
            </Typography>
            {acumuladoData.length > 0 && (() => {
              const monthNames = acumuladoData.map(item => item.mes); // Array con los nombres reales
              const overallPercentagesForBubble = acumuladoData.map(item => {
                const total = item.cumple + item.cumpleParcial + item.noCumple + item.noMedido;
                return total > 0 ? Math.round((item.cumple / total) * 100) : 0;
              });
              return (
                <Chart
                  type="bubble"
                  data={{
                    datasets: [{
                      label: 'Volumen vs Cumplimiento',
                      data: acumuladoData.map((item, i) => {
                        const total = item.cumple + item.cumpleParcial + item.noCumple + item.noMedido;
                        const r = total > 0 ? parseInt(Math.sqrt(total)) : 0;
                        return {
                          x: i,
                          y: overallPercentagesForBubble[i],
                          r: r,
                          mes: item.mes  // Se incluye el nombre real del mes
                        };
                      }),
                      backgroundColor: colors.parcial,
                      borderColor: colors.parcialBorder,
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: { display: true, text: 'Mes' },
                        ticks: {
                          // Se muestran los nombres reales de los meses
                          callback: (value, index) => monthNames[index]
                        }
                      },
                      y: {
                        title: { display: true, text: 'Cumplimiento (%)' },
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          stepSize: 10,
                          callback: (value) => parseInt(value)
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const { x, y, r, mes } = context.raw;
                            const total = Math.round(r * r);
                            return `${mes}: ${y}% (Volumen: ${total})`;
                          }
                        }
                      }
                    }
                  }}
                />
              );
            })()}
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
