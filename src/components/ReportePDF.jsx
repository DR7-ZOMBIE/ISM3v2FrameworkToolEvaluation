// ReportePDF.jsx
import React from 'react';
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer';

// Definición de estilos para el PDF con una apariencia más cuidada
const styles = StyleSheet.create({
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

// Documento PDF que recibe un objeto pdfData (imágenes en base64)
const MyDocument = ({ pdfData }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>Reporte de Cumplimiento</Text>
      {pdfData.radar && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráfico Radar</Text>
          <Image style={styles.image} src={pdfData.radar} />
        </View>
      )}
      {pdfData.line && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráfico de Línea</Text>
          <Image style={styles.image} src={pdfData.line} />
        </View>
      )}
      {pdfData.bar && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráfico Barras</Text>
          <Image style={styles.image} src={pdfData.bar} />
        </View>
      )}
      {pdfData.pie && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráfico Pie</Text>
          <Image style={styles.image} src={pdfData.pie} />
        </View>
      )}
      {pdfData.stacked && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráfico Área Apilada</Text>
          <Image style={styles.image} src={pdfData.stacked} />
        </View>
      )}
      {pdfData.grouped && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráfico Barras Agrupadas</Text>
          <Image style={styles.image} src={pdfData.grouped} />
        </View>
      )}
      {pdfData.donut && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gráfico Donut</Text>
          <Image style={styles.image} src={pdfData.donut} />
        </View>
      )}
      {pdfData.gauge && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indicador Global</Text>
          <Image style={styles.image} src={pdfData.gauge} />
        </View>
      )}
      {pdfData.boxPlot && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Box Plot</Text>
          <Image style={styles.image} src={pdfData.boxPlot} />
        </View>
      )}
      {pdfData.violin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Violin Plot</Text>
          <Image style={styles.image} src={pdfData.violin} />
        </View>
      )}
      <Text style={styles.footer}>Velasco & Calle</Text>
    </Page>
  </Document>
);

// Componente que muestra el enlace para descargar el PDF
const ReportePDF = ({ pdfData }) => (
  <div style={{ marginTop: '20px', textAlign: 'center' }}>
    <PDFDownloadLink
      document={<MyDocument pdfData={pdfData} />}
      fileName="reporte_cumplimiento.pdf"
    >
      {({ loading }) =>
        loading ? 'Generando PDF...' : 'Descargar Reporte en PDF'
      }
    </PDFDownloadLink>
  </div>
);

export default ReportePDF;
