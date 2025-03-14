// Evaluacion.jsx
import React, { useState, useEffect } from 'react';
import {
  db,
  collection,
  getDocs,
  setDoc,
  doc,
  onSnapshot,
  deleteDoc,
  updateDoc
} from '../firebase-config';

import AcumuladoTable from '../components/AcumuladoTable';
import CategoryTable from '../components/CategoryTable';
import NivelTable from '../components/NivelTable';

import {
  Container,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox
} from '@mui/material';

// Objeto que contiene la descripción de cada proceso (según la matriz de procesos que manejas)
const processDescriptions = {
  "GP-1": "Gestión del conocimiento en seguridad de la información a través de la recopilación, análisis y difusión de datos críticos para el SGSI.",
  "GP-2": "Auditoría del SGSI para validar la congruencia entre la gestión de seguridad y los requerimientos institucionales.",
  "OSP-1": "Generación de informes operativos para la gerencia táctica, evidenciando el desempeño de los controles de seguridad.",
  "OSP-10": "Gestión y verificación de las copias de seguridad, garantizando la disponibilidad y recuperación de la información.",
  "OSP-11": "Implementación y supervisión de controles de acceso que aseguran que solo personal autorizado acceda a recursos sensibles.",
  "OSP-12": "Administración del proceso de alta de usuarios, asignación de credenciales y configuración de derechos de acceso.",
  "OSP-14": "Protección del entorno físico mediante la implementación de medidas de seguridad en las instalaciones.",
  "OSP-15": "Planificación y ejecución de estrategias para la continuidad de las operaciones ante eventos disruptivos.",
  "OSP-16": "Definición y aplicación de políticas de segmentación de red y filtros para minimizar la exposición a ataques.",
  "OSP-17": "Implementación de soluciones para la detección, prevención y eliminación de malware en los sistemas.",
  "OSP-19": "Auditoría técnica interna para evaluar la eficacia de los controles de seguridad implementados en el SGSI.",
  "OSP-19A": "Auditoría técnica externa realizada por terceros para validar la robustez y conformidad de los controles de seguridad.",
  "OSP-2": "Gestión de la adquisición de equipos y servicios que aseguran la seguridad de la infraestructura de operación.",
  "OSP-20": "Simulación de incidentes de seguridad para evaluar la capacidad de respuesta y mejorar los planes de contingencia.",
  "OSP-21": "Verificación de la calidad de la información y demostración del cumplimiento de los requerimientos de seguridad.",
  "OSP-22": "Monitoreo y seguimiento de alertas de seguridad para garantizar una respuesta rápida ante eventos críticos.",
  "OSP-24": "Gestión integral de incidentes y cuasi incidentes, abarcando la contención, análisis y documentación.",
  "OSP-24A": "Implementación de mecanismos para la detección temprana y análisis detallado de eventos de seguridad.",
  "OSP-26": "Optimización de la infraestructura para mejorar la disponibilidad y confiabilidad, reduciendo puntos de fallo.",
  "OSP-3": "Inventario y clasificación de activos de TI, asegurando la protección y trazabilidad de los mismos.",
  "OSP-4": "Control de cambios en los entornos de información para minimizar riesgos asociados a modificaciones.",
  "OSP-5": "Aplicación oportuna de parches y actualizaciones en los ambientes, mitigando vulnerabilidades.",
  "OSP-6": "Limpieza y eliminación segura de información residual en entornos, previniendo filtraciones.",
  "OSP-7": "Refuerzo de la seguridad en los ambientes de TI, mediante mejoras en configuraciones y controles.",
  "OSP-8": "Supervisión del ciclo de vida del desarrollo de software, integrando prácticas de seguridad desde el inicio.",
  "OSP-9": "Gestión y documentación de cambios en los controles de seguridad para asegurar su efectividad.",
  "SSP-1": "Emisión de informes estratégicos para stakeholders, comunicando el estado y desempeño del SGSI.",
  "SSP-2": "Coordinación entre las áreas involucradas en la gestión de seguridad para asegurar la integración de políticas.",
  "SSP-4": "Establecimiento de reglas de transparencia, segregación, supervisión, rotación y separación de responsabilidades para mitigar riesgos internos.",
  "SSP-6": "Asignación de recursos financieros, humanos y tecnológicos que permitan la adecuada implementación del SGSI.",
  "TSP-1": "Generación de reportes a la gerencia estratégica para facilitar la toma de decisiones basadas en indicadores de seguridad.",
  "TSP-11": "Fomento de una cultura de seguridad mediante la concientización y establecimiento de buenas prácticas en la organización.",
  "TSP-2": "Administración eficiente de los recursos asignados a la seguridad, garantizando su uso óptimo y alineación con los objetivos.",
  "TSP-3": "Definición de metas y objetivos específicos de seguridad basados en el análisis de riesgos y necesidades del negocio.",
  "TSP-3A": "Equilibrio entre los objetivos de ciberseguridad y la exposición a riesgos, determinando inversiones y acciones correctivas.",
  "TSP-4": "Establecimiento y monitoreo de acuerdos de nivel de servicio para asegurar que los controles cumplan con estándares predefinidos.",
  "TSP-6": "Definición de los entornos operativos y ciclo de vida de los activos, integrando medidas de seguridad en cada fase.",
  "TSP-7": "Verificación de antecedentes del personal en roles críticos para garantizar la idoneidad y confiabilidad.",
  "TSP-8": "Proceso de selección y reclutamiento del personal especializado en seguridad de la información.",
  "TSP-9": "Desarrollo e implementación de programas de capacitación continua en temas de seguridad de la información."
};

// Función para determinar el color de fondo según el estado de cumplimiento
const getStatusColor = (estado) => {
  switch (estado) {
    case 'No cumple':
    case 'No Cumple':
      return 'bg-red-200 text-red-900';
    case 'Cumple deficientemente':
      return 'bg-orange-200 text-orange-900';
    case 'Cumple aceptable':
      return 'bg-yellow-200 text-yellow-900';
    case 'Cumple a alto grado':
      return 'bg-green-200 text-green-900';
    case 'Cumple plenamente':
      return 'bg-blue-200 text-blue-900';
    case 'No Medido':
      return 'bg-gray-200 text-gray-900';
    case 'Cumple Parcialmente':
      return 'bg-orange-200 text-orange-900';
    case 'Cumple':
      return 'bg-green-200 text-green-900';
    default:
      return '';
  }
};

// Función genérica que devuelve el estado según la meta del cliente
const getEstado = (p, metas) => {
  for (const [estado, range] of Object.entries(metas)) {
    const [min, max] = range;
    if (p >= min && p <= max) return estado;
  }
  return '';
};

const saveDocumentsToFirestore = async (data, collectionName, idKey) => {
  const colRef = collection(db, collectionName);
  await Promise.all(
    data.map((item) => setDoc(doc(colRef, item[idKey]), item))
  );
};

const fetchDocumentsFromFirestore = async (collectionName) => {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => doc.data());
};

// Cálculos de estadísticas de categoría
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
      id: category,
      nombre: categoryNames[category],
      cumple: 0,
      cumpleParcial: 0,
      noCumple: 0,
      noMedido: 0
    };
  });

  data.forEach(item => {
    const { estado, categoria } = item;
    if (!categoryStats[categoria]) {
      categoryStats[categoria] = { id: categoria, nombre: categoria, cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
    }
    switch (estado) {
      case 'Cumple':
      case 'Cumple plenamente':
        categoryStats[categoria].cumple += 1;
        break;
      case 'Cumple Parcialmente':
      case 'Cumple deficientemente':
        categoryStats[categoria].cumpleParcial += 1;
        break;
      case 'No Cumple':
      case 'No cumple':
        categoryStats[categoria].noCumple += 1;
        break;
      case 'No Medido':
        categoryStats[categoria].noMedido += 1;
        break;
      default:
        break;
    }
  });

  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    const total = stats.cumple + stats.cumpleParcial + stats.noCumple + stats.noMedido;
    categoryStats[category].pcCumple = total === 0 ? '0%' : `${Math.round((stats.cumple / total) * 100)}%`;
    categoryStats[category].pcParcial = total === 0 ? '0%' : `${Math.round((stats.cumpleParcial / total) * 100)}%`;
    categoryStats[category].pcNoCumple = total === 0 ? '0%' : `${Math.round((stats.noCumple / total) * 100)}%`;
    categoryStats[category].pcNoMedido = total === 0 ? '0%' : `${Math.round((stats.noMedido / total) * 100)}%`;
  });

  return categoryStats;
};

// Cálculos de estadísticas de niveles
const calculateNivelStats = (data) => {
  const nivelStats = {};
  for (let i = 1; i <= 4; i++) {
    nivelStats[i] = {
      id: i.toString(),
      nivel: i,
      nombre: `Nivel ${i}`,
      cumple: 0,
      cumpleParcial: 0,
      noCumple: 0,
      noMedido: 0
    };
  }

  data.forEach(item => {
    const { estado, nivel } = item;
    if (estado === 'Cumple' || estado === 'Cumple plenamente') nivelStats[nivel].cumple++;
    else if (estado === 'Cumple Parcialmente' || estado === 'Cumple deficientemente') nivelStats[nivel].cumpleParcial++;
    else if (estado === 'No Cumple' || estado === 'No cumple') nivelStats[nivel].noCumple++;
    else if (estado === 'No Medido') nivelStats[nivel].noMedido++;
  });

  Object.keys(nivelStats).forEach(nivel => {
    const stats = nivelStats[nivel];
    const total = stats.cumple + stats.cumpleParcial + stats.noCumple + stats.noMedido;
    nivelStats[nivel].pcCumple = total === 0 ? '0%' : `${Math.round((stats.cumple / total) * 100)}%`;
    nivelStats[nivel].pcParcial = total === 0 ? '0%' : `${Math.round((stats.cumpleParcial / total) * 100)}%`;
    nivelStats[nivel].pcNoCumple = total === 0 ? '0%' : `${Math.round((stats.noCumple / total) * 100)}%`;
    nivelStats[nivel].pcNoMedido = total === 0 ? '0%' : `${Math.round((stats.noMedido / total) * 100)}%`;
  });

  return nivelStats;
};

const Evaluacion = () => {
  // Estándar de metas para todas las empresas
  const standardMetas = {
    'No Cumple': [0, 84],
    'Cumple Parcialmente': [85, 94],
    'Cumple': [95, 100]
  };

  // Clientes
  const clients = [
    {
      name: 'Universidad Cooperativa de Colombia',
      code: 'UCC',
      collection: 'procesos_UCC',
      metas: standardMetas
    },
    {
      name: 'Cajacopi',
      code: 'CAJACOPI',
      collection: 'procesos_Cajacopi',
      metas: standardMetas
    },
    {
      name: 'Cámara de Comercio de Medellín',
      code: 'CAMARA',
      collection: 'procesos_Camara',
      metas: standardMetas
    },
    {
      name: 'SisteCrédito',
      code: 'SISTECREDITO',
      collection: 'procesos',
      metas: standardMetas
    }
  ];

  // Estado del cliente seleccionado
  const [selectedClient, setSelectedClient] = useState(clients[0]);

  // Estados para la data
  const [data, setData] = useState([]);
  const [acumulado, setAcumulado] = useState([]);
  const [nivelStats, setNivelStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  // Listener para la colección de procesos
  useEffect(() => {
    const colRef = collection(db, selectedClient.collection);
    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      if (snapshot.docs.length === 0 && selectedClient.collection !== 'procesos') {
        const dataFromSiste = await fetchDocumentsFromFirestore('procesos');
        setData(dataFromSiste);
        saveDocumentsToFirestore(dataFromSiste, selectedClient.collection, 'id');

        const catStats = calculateCategoryStats(dataFromSiste);
        setCategoryStats(catStats);
        saveDocumentsToFirestore(Object.values(catStats), 'categoryStats', 'id');

        const nivStats = calculateNivelStats(dataFromSiste);
        setNivelStats(Object.values(nivStats));
        saveDocumentsToFirestore(Object.values(nivStats), 'nivelStats', 'id');
      } else {
        const procesos = snapshot.docs.map(doc => doc.data());
        setData(procesos);

        const catStats = calculateCategoryStats(procesos);
        setCategoryStats(catStats);
        saveDocumentsToFirestore(Object.values(catStats), 'categoryStats', 'id');

        const nivStats = calculateNivelStats(procesos);
        setNivelStats(Object.values(nivStats));
        saveDocumentsToFirestore(Object.values(nivStats), 'nivelStats', 'id');
      }
    });
    return () => unsubscribe();
  }, [selectedClient]);

  // Listener para la colección "acumulado"
  useEffect(() => {
    const acumRef = collection(db, 'acumulado');
    const unsubscribeAcum = onSnapshot(acumRef, (snapshot) => {
      const acumuladoData = snapshot.docs.map(doc => doc.data());
      setAcumulado(acumuladoData);
    });
    return () => unsubscribeAcum();
  }, []);

  // Actualiza el porcentaje y calcula el estado usando las metas
  const updatePorcentaje = (e, id) => {
    const p = parseFloat(e.target.value);
    const newPercentage = isNaN(p) ? 0 : p;
    const estado = getEstado(newPercentage, selectedClient.metas);
    const updatedData = data.map(item =>
      item.id === id
        ? { ...item, porcentaje: newPercentage, estado }
        : item
    );
    setData(updatedData);
    saveDocumentsToFirestore(updatedData, selectedClient.collection, 'id');
  };

  // Actualiza cualquier campo en Firestore
  const updateField = async (id, field, value) => {
    const updatedData = data.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setData(updatedData);
    const docRef = doc(db, selectedClient.collection, id);
    await updateDoc(docRef, { [field]: value });
  };

  const updateNivelStats = (e, nivel, campo) => {
    const newValue = parseInt(e.target.value, 10);
    const updatedNivelStats = nivelStats.map(item =>
      item.nivel === nivel ? { ...item, [campo]: newValue } : item
    );
    setNivelStats(updatedNivelStats);
    saveDocumentsToFirestore(updatedNivelStats, 'nivelStats', 'id');
  };

  const addRowAcumulado = () => {
    const newRow = { id: Date.now().toString(), mes: '', cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0, noAplica: 0 };
    saveDocumentsToFirestore([newRow], 'acumulado', 'id');
  };

  const deleteRowAcumulado = async (id) => {
    try {
      await deleteDoc(doc(db, 'acumulado', id));
    } catch (error) {
      console.error("Error al eliminar la fila:", error);
    }
  };

  const updateAcumulado = (e, id, field) => {
    const value = field === 'mes' ? e.target.value : parseInt(e.target.value, 10) || 0;
    const updatedAcumulado = acumulado.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setAcumulado(updatedAcumulado);
    saveDocumentsToFirestore(updatedAcumulado, 'acumulado', 'id');
  };

  // Para el select de responsables
  const uniqueResponsables = Array.from(new Set(data.map(item => item.responsable)));

  // Nueva función para actualizar el campo "evaluar" (checklist)
  const updateEvaluar = async (id, value) => {
    await updateField(id, 'evaluar', value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Selección de Cliente */}
      <Box 
        mb={4} 
        display="flex" 
        flexDirection={{ xs: 'column', sm: 'row' }} 
        alignItems="center" 
        justifyContent="center" 
        gap={2}
      >
        <FormControl variant="outlined" sx={{ minWidth: 240 }}>
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
              <MenuItem key={client.code} value={client.code}>
                {client.name}
              </MenuItem>
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
        Reporte de cumplimiento
      </Typography>

      {/* Tabla de procesos con columna "Descripción" */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
          <thead className="bg-blue-200 text-blue-900">
            <tr>
              {[
                'Proceso ISM3', 
                'Nombre', 
                'Descripción',
                'Responsable', 
                'Evaluar', 
                'Estado de Cumplimiento', 
                '% Cumplimiento', 
                'Categoría', 
                'Nivel'
              ].map(h => (
                <th key={h} className="border px-2 py-1 text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="border px-2 py-1 text-center">{item.proceso}</td>
                <td className="border px-2 py-1 text-center">{item.nombre}</td>
                <td className="border px-2 py-1 text-center">
                  { item.descripcion 
                    ? item.descripcion 
                    : (processDescriptions[item.proceso] 
                        ? processDescriptions[item.proceso] 
                        : "Sin descripción disponible") }
                </td>
                <td className="border px-2 py-1 text-center">
                  <select
                    value={item.responsable}
                    onChange={(e) => updateField(item.id, 'responsable', e.target.value)}
                    className="border rounded text-[10px] p-1"
                  >
                    {uniqueResponsables.map(res => (
                      <option key={res} value={res}>{res}</option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={item.evaluar === undefined ? true : item.evaluar}
                    onChange={(e) => updateEvaluar(item.id, e.target.checked)}
                  />
                </td>
                <td className={`border px-2 py-1 text-center ${getStatusColor(item.estado)}`}>
                  {item.estado}
                </td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="number"
                    value={item.porcentaje}
                    onChange={(e) => updatePorcentaje(e, item.id)}
                    className="w-12 text-center border rounded text-[10px] p-1"
                    disabled={item.evaluar === false}
                  />
                </td>
                <td className="border px-2 py-1 text-center">
                  <select
                    value={item.categoria}
                    onChange={(e) => updateField(item.id, 'categoria', e.target.value)}
                    className="border rounded text-[10px] p-1"
                  >
                    {['c', 'o', 'v', 'r', '$', 'g', 'p'].map(categoria => (
                      <option key={categoria} value={categoria}>{categoria}</option>
                    ))}
                  </select>
                </td>
                <td className="border px-2 py-1 text-center">
                  <select
                    value={item.nivel}
                    onChange={(e) => updateField(item.id, 'nivel', parseInt(e.target.value, 10))}
                    className="border rounded text-[10px] p-1"
                  >
                    {[1, 2, 3, 4].map(nivel => (
                      <option key={nivel} value={nivel}>{nivel}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AcumuladoTable
        acumulado={acumulado}
        updateAcumulado={updateAcumulado}
        addRowAcumulado={addRowAcumulado}
        deleteRowAcumulado={deleteRowAcumulado}
      />
      <CategoryTable categoryStats={Object.values(categoryStats)} />
      <NivelTable nivelStats={nivelStats} updateNivelStats={updateNivelStats} />
    </Container>
  );
};

export default Evaluacion;
