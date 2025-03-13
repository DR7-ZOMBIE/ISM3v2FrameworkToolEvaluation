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

// Cálculos de estadísticas de categoría (se mantiene igual)
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

// Cálculos de estadísticas de niveles (se mantiene igual)
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
  // Definición de los clientes y sus propiedades:
  const clients = [
    {
      name: 'Universidad Cooperativa de Colombia',
      code: 'UCC',
      collection: 'procesos_UCC',
      metas: {
        'No cumple': [0, 59],
        'Cumple deficientemente': [60, 69],
        'Cumple aceptable': [70, 79],
        'Cumple a alto grado': [80, 89],
        'Cumple plenamente': [90, 100],
      }
    },
    {
      name: 'Cajacopi',
      code: 'CAJACOPI',
      collection: 'procesos_Cajacopi',
      metas: {
        'No cumple': [0, 59],
        'Cumple deficientemente': [60, 69],
        'Cumple aceptable': [70, 79],
        'Cumple a alto grado': [80, 89],
        'Cumple plenamente': [90, 100],
      }
    },
    {
      name: 'Cámara de Comercio de Medellín',
      code: 'CAMARA',
      collection: 'procesos_Camara',
      metas: {
        'No cumple': [0, 59],
        'Cumple deficientemente': [60, 69],
        'Cumple aceptable': [70, 79],
        'Cumple a alto grado': [80, 89],
        'Cumple plenamente': [90, 100],
      }
    },
    {
      name: 'SisteCrédito',
      code: 'SISTECREDITO',
      collection: 'procesos', // Colección actual con 40 procesos
      metas: {
        'No Medido': [0, 0],
        'No Cumple': [1, 84],
        'Cumple Parcialmente': [85, 94],
        'Cumple': [95, 100],
      }
    }
  ];
  
  // Estado para el cliente seleccionado, por defecto el primero
  const [selectedClient, setSelectedClient] = useState(clients[0]);

  // Estados de la data
  const [data, setData] = useState([]);
  const [acumulado, setAcumulado] = useState([]);
  const [nivelStats, setNivelStats] = useState([]);
  const [categoryStats, setCategoryStats] = useState({});

  // Escuchamos cambios en la colección de procesos según el cliente seleccionado.
  // Si la colección está vacía (y no es la de SisteCrédito) se obtiene la data de la colección 'procesos'
  useEffect(() => {
    const colRef = collection(db, selectedClient.collection);
    const unsubscribe = onSnapshot(colRef, async (snapshot) => {
      if (snapshot.docs.length === 0 && selectedClient.collection !== 'procesos') {
        // Si no hay datos en la colección del cliente, consumimos la colección de SisteCrédito
        const dataFromSiste = await fetchDocumentsFromFirestore('procesos');
        setData(dataFromSiste);
        // Guardamos los datos en la colección del cliente actual para que no se quede vacía
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

  // Cargamos la colección "acumulado" (se asume que es común o se puede adaptar)
  useEffect(() => {
    const loadAcumulado = async () => {
      const acumuladoData = await fetchDocumentsFromFirestore('acumulado');
      setAcumulado(acumuladoData);
    };
    loadAcumulado();
  }, []);

  // Actualiza el porcentaje y calcula el estado usando las metas del cliente seleccionado
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

  // Actualización parcial de cualquier campo en Firestore usando updateDoc
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

  // Para el select de responsables (se mantiene igual)
  const uniqueResponsables = Array.from(new Set(data.map(item => item.responsable)));

  return (
    <div className="p-4 pb-12">
      {/* Sección superior para seleccionar el cliente */}
      <div className="mb-6 flex items-center">
        <label className="mr-2 font-semibold text-lg">Cliente:</label>
        <select
          value={selectedClient.code}
          onChange={(e) => {
            const client = clients.find(c => c.code === e.target.value);
            setSelectedClient(client);
          }}
          className="border rounded p-2 text-lg"
        >
          {clients.map(client => (
            <option key={client.code} value={client.code}>{client.name}</option>
          ))}
        </select>
      </div>

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
                <td className={`border px-2 py-1 text-center ${getStatusColor(item.estado)}`}>
                  {item.estado}
                </td>
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
