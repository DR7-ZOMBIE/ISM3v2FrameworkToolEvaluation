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
  Filler,
} from 'chart.js';
import { Container, Typography, Button, Paper, Box } from '@mui/material';
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
  Filler
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

const Reportes = () => {
  const radarRef = useRef(null);
  const lineRef = useRef(null);
  const barRef = useRef(null);
  const pieRef = useRef(null);

  // Estados para los datos
  const [radarData, setRadarData] = useState({});
  const [lineData, setLineData] = useState({});
  const [barData, setBarData] = useState({});
  const [pieData, setPieData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        // Realiza el fetching de datos
        const procesos = await fetchDocumentsFromFirestore('procesos');
        const acumulado = await fetchDocumentsFromFirestore('acumulado');
        const nivelStatsData = await fetchDocumentsFromFirestore('nivelStats');

        // (A) Radar: % Cumple por Categoría
        const catStats = calculateCategoryStats(procesos);
        const catKeys = Object.keys(catStats);
        const labelsRadar = catKeys.map((key) => catStats[key].nombre.toUpperCase());
        const dataRadar = catKeys.map((key) => {
          const s = catStats[key];
          const total = s.cumple + s.cumpleParcial + s.noCumple + s.noMedido || 1;
          return Math.round((s.cumple / total) * 100);
        });

        // (B) Línea: Acumulado por Mes
        const labelsLine = acumulado.map((item) => item.mes);
        const lineDatasets = [
          {
            label: 'Cumple',
            data: acumulado.map((item) => item.cumple),
            backgroundColor: colors.cumple,
            borderColor: colors.cumpleBorder,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
          {
            label: 'Cumple Parcial',
            data: acumulado.map((item) => item.cumpleParcial),
            backgroundColor: colors.parcial,
            borderColor: colors.parcialBorder,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
          {
            label: 'No Cumple',
            data: acumulado.map((item) => item.noCumple),
            backgroundColor: colors.noCumple,
            borderColor: colors.noCumpleBorder,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
          {
            label: 'No Medido',
            data: acumulado.map((item) => item.noMedido),
            backgroundColor: colors.noMedido,
            borderColor: colors.noMedidoBorder,
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
          },
        ];

        // (C) Barras: Estadísticas por Nivel ISM3 (porcentajes)
        const nivelLabels = nivelStatsData.map((item) => item.nombre || `Nivel ${item.nivel}`);
        const barDatasets = [
          {
            label: 'Cumple',
            data: nivelStatsData.map((item) => parseFloat(item.pcCumple.replace('%', ''))),
            backgroundColor: colors.cumple,
            borderColor: colors.cumpleBorder,
            borderWidth: 1,
          },
          {
            label: 'Cumple Parcialmente',
            data: nivelStatsData.map((item) => parseFloat(item.pcParcial.replace('%', ''))),
            backgroundColor: colors.parcial,
            borderColor: colors.parcialBorder,
            borderWidth: 1,
          },
          {
            label: 'No Cumple',
            data: nivelStatsData.map((item) => parseFloat(item.pcNoCumple.replace('%', ''))),
            backgroundColor: colors.noCumple,
            borderColor: colors.noCumpleBorder,
            borderWidth: 1,
          },
          {
            label: 'No Medido',
            data: nivelStatsData.map((item) => parseFloat(item.pcNoMedido.replace('%', ''))),
            backgroundColor: colors.noMedido,
            borderColor: colors.noMedidoBorder,
            borderWidth: 1,
          },
        ];

        // (D) Pie: Estado de cumplimiento del Último Mes
        const lastMonth = acumulado[acumulado.length - 1] || { cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
        const totalLastMonth = lastMonth.cumple + lastMonth.cumpleParcial + lastMonth.noCumple + lastMonth.noMedido || 1;
        const pieDatasetData = [
          Math.round((lastMonth.cumple / totalLastMonth) * 100),
          Math.round((lastMonth.cumpleParcial / totalLastMonth) * 100),
          Math.round((lastMonth.noCumple / totalLastMonth) * 100),
          Math.round((lastMonth.noMedido / totalLastMonth) * 100),
        ];

        // Actualizamos los estados con los datos calculados
        setRadarData({
          labels: labelsRadar,
          datasets: [
            {
              label: '% Cumple',
              data: dataRadar,
              backgroundColor: 'rgba(26, 188, 156, 0.3)',
              borderColor: colors.cumpleBorder,
              borderWidth: 2,
              pointBackgroundColor: colors.cumpleBorder,
              pointRadius: 5,
            },
          ],
        });

        setLineData({
          labels: labelsLine,
          datasets: lineDatasets,
        });

        setBarData({
          labels: nivelLabels,
          datasets: barDatasets,
        });

        setPieData({
          labels: ['Cumple', 'Cumple Parcial', 'No Cumple', 'No Medido'],
          datasets: [
            {
              data: pieDatasetData,
              backgroundColor: [
                colors.cumple,
                colors.parcial,
                colors.noCumple,
                colors.noMedido,
              ],
              borderColor: '#fff',
              borderWidth: 2,
            },
          ],
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []); // Se ejecuta solo una vez al montar el componente

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
    <Container maxWidth="lg" sx={{ backgroundColor: '#ffffff', color: '#000000', py: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Reporte estadístico de cumplimiento
      </Typography>

      <Paper sx={{ p: 3, mb: 8, height: 600, overflow: 'auto' }} ref={radarRef}>
        <Typography variant="h6" align="center" gutterBottom>
          % Cumple por Categoría
        </Typography>
        <Radar 
          data={radarData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { ticks: { beginAtZero: true, max: 100 } } },
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Porcentaje de Cumplimiento por Categoría' },
            },
          }} 
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 8, height: 600, overflow: 'auto' }} ref={lineRef}>
        <Typography variant="h6" align="center" gutterBottom>
          Comportamiento acumulado por mes
        </Typography>
        <Line 
          data={lineData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Evolución Mensual Acumulada', font: { size: 20 } },
            },
            scales: { y: { beginAtZero: true } },
          }} 
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 8, height: 600, overflow: 'auto' }} ref={barRef}>
        <Typography variant="h6" align="center" gutterBottom>
          Cumplimiento por nivel de ISM3
        </Typography>
        <Bar 
          data={barData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Cumplimiento por Nivel de ISM3', font: { size: 20 } },
            },
            scales: { y: { beginAtZero: true, max: 100 } },
          }} 
        />
      </Paper>

      <Paper sx={{ p: 3, mb: 8, height: 600, overflow: 'auto' }} ref={pieRef}>
        <Typography variant="h6" align="center" gutterBottom>
          Estado de cumplimiento (Último Mes)
        </Typography>
        <Pie 
          data={pieData} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: true, position: 'top' },
              title: { display: true, text: 'Cumplimiento del Último Mes', font: { size: 20 } },
            },
          }} 
        />
      </Paper>

      <Box textAlign="center" mt={2}>
        <Button variant="contained" color="primary" onClick={exportPDF}>
          Descargar reporte en PDF
        </Button>
      </Box>
    </Container>
  );
};

export default Reportes;