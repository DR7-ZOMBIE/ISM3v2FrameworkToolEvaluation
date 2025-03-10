import React, { useState, useEffect } from 'react';
import { 
  db, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  onSnapshot,
  deleteDoc 
} from '../firebase-config';

import AcumuladoTable from '../components/AcumuladoTable';
import CategoryTable from '../components/CategoryTable';
import NivelTable from '../components/NivelTable';

const initialData = [
  { id: 'GP-1', proceso: 'GP-1', nombre: 'Gestionar Conocimiento', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'c', nivel: 1, editable: true },
  { id: 'GP-2', proceso: 'GP-2', nombre: 'Auditoría de SGSI y de congruencia con la institución', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'g', nivel: 1, editable: true },
  { id: 'OSP-1', proceso: 'OSP-1', nombre: 'Reportar a la gerencia táctica', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 1, editable: true },
];

const getStatusColor = (estado) => {
  if (estado === 'No Cumple') return 'bg-red-200 text-red-900';
  if (estado === 'Cumple Parcialmente') return 'bg-orange-200 text-orange-900';
  if (estado === 'Cumple') return 'bg-green-200 text-green-900';
  return '';
};

const getEstado = (p) => {
  if (p === 0) return 'No Medido';
  if (p <= 84) return 'No Cumple';
  if (p <= 94) return 'Cumple Parcialmente';
  if (p >= 95) return 'Cumple';
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
      id: category, // Usamos la clave de la categoría como id
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
    switch (item.estado) {
      case 'Cumple':
        categoryStats[categoria].cumple += 1;
        break;
      case 'Cumple Parcialmente':
        categoryStats[categoria].cumpleParcial += 1;
        break;
      case 'No Cumple':
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

const calculateNivelStats = (data) => {
  const nivelStats = {};
  for (let i = 1; i <= 4; i++) {
    nivelStats[i] = {
      id: i.toString(), // Convertimos el nivel a string para usarlo como id
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
    if (estado === 'Cumple') nivelStats[nivel].cumple++;
    else if (estado === 'Cumple Parcialmente') nivelStats[nivel].cumpleParcial++;
    else if (estado === 'No Cumple') nivelStats[nivel].noCumple++;
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
  const [data, setData] = useState(initialData);
  const [acumulado, setAcumulado] = useState([]);
  const [nivelStats, setNivelStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  // Al primer montaje, guardamos los procesos iniciales
  useEffect(() => {
    saveDocumentsToFirestore(initialData, 'procesos', 'id');
  }, []);

  // Escuchamos los cambios en la colección "procesos"
  useEffect(() => {
    const colRef = collection(db, 'procesos');
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const procesos = snapshot.docs.map((doc) => doc.data());
      setData(procesos);
      const catStats = calculateCategoryStats(procesos);
      setCategoryStats(catStats);
      // Guardamos las estadísticas de categoría en su colección:
      saveDocumentsToFirestore(Object.values(catStats), 'categoryStats', 'id');
      
      const nivStats = calculateNivelStats(procesos);
      setNivelStats(Object.values(nivStats));
      // Guardamos las estadísticas de niveles en su colección:
      saveDocumentsToFirestore(Object.values(nivStats), 'nivelStats', 'id');
    });
    return () => unsubscribe();
  }, []);

  // Cargamos la colección "acumulado"
  useEffect(() => {
    const loadAcumulado = async () => {
      const acumuladoData = await fetchDocumentsFromFirestore('acumulado');
      setAcumulado(acumuladoData);
    };
    loadAcumulado();
  }, []);

  const handleUpdateProcesos = (updatedData) => {
    setData(updatedData);
    saveDocumentsToFirestore(updatedData, 'procesos', 'id');
    const catStats = calculateCategoryStats(updatedData);
    setCategoryStats(catStats);
    saveDocumentsToFirestore(Object.values(catStats), 'categoryStats', 'id');
    const nivStats = calculateNivelStats(updatedData);
    setNivelStats(Object.values(nivStats));
    saveDocumentsToFirestore(Object.values(nivStats), 'nivelStats', 'id');
  };

  const updatePorcentaje = (e, id) => {
    const p = parseFloat(e.target.value);
    const updatedData = data.map(item =>
      item.id === id
        ? { ...item, porcentaje: isNaN(p) ? 0 : p, estado: getEstado(isNaN(p) ? 0 : p) }
        : item
    );
    handleUpdateProcesos(updatedData);
  };

  const updateField = (id, field, value) => {
    const updatedData = data.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleUpdateProcesos(updatedData);
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
    const updatedAcumulado = [...acumulado, newRow];
    setAcumulado(updatedAcumulado);
    saveDocumentsToFirestore(updatedAcumulado, 'acumulado', 'id');
  };

  const deleteRowAcumulado = async (id) => {
    await deleteDoc(doc(db, 'acumulado', id));
    const updatedAcumulado = acumulado.filter(item => item.id !== id);
    setAcumulado(updatedAcumulado);
  };

  const updateAcumulado = (e, id, field) => {
    const value = field === 'mes' ? e.target.value : parseInt(e.target.value, 10) || 0;
    const updatedAcumulado = acumulado.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setAcumulado(updatedAcumulado);
    saveDocumentsToFirestore(updatedAcumulado, 'acumulado', 'id');
  };

  return (
    <div className="p-2 pb-12">
      {/* Tabla de procesos */}
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
          <thead className="bg-blue-200 text-blue-900">
            <tr>
              {['Proceso ISM3', 'Nombre', 'Responsable', 'Estado de Cumplimiento', '% Cumplimiento', 'Categoría', 'Nivel'].map(h => (
                <th key={h} className="border px-2 py-1 text-center">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map(item => (
              <tr key={item.id} className="hover:bg-gray-100">
                <td className="border px-2 py-1 text-center">{item.proceso}</td>
                <td className="border px-2 py-1 text-center">{item.nombre}</td>
                <td className="border px-2 py-1 text-center">{item.responsable}</td>
                <td className={`border px-2 py-1 text-center ${getStatusColor(item.estado)}`}>{item.estado}</td>
                <td className="border px-2 py-1 text-center">
                  <input
                    type="number"
                    value={item.porcentaje}
                    onChange={(e) => updatePorcentaje(e, item.id)}
                    className="w-12 text-center border rounded text-[10px] p-1"
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
    </div>
  );
};

export default Evaluacion;
