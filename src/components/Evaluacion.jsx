import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, setDoc, doc, updateDoc } from '../firebase-config'; // Importa las funciones de Firebase

import AcumuladoTable from '../components/AcumuladoTable'; // Componente para la tabla de Acumulado
import CategoryTable from '../components/CategoryTable';   // Componente para la tabla de Categorías
import NivelTable from '../components/NivelTable';         // Componente para la tabla de Niveles

// === Datos iniciales (matrices base con procesos, acumulado y estadísticas)
const initialData = [
    { id: 'GP-1', proceso: 'GP-1', nombre: 'Gestionar Conocimiento', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'c', nivel: 1, editable: true },
    { id: 'GP-2', proceso: 'GP-2', nombre: 'Auditoría de SGSI y de congruencia con la institución', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'g', nivel: 1, editable: true },
    { id: 'OSP-1', proceso: 'OSP-1', nombre: 'Reportar a la gerencia táctica', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 1, editable: true },
];

// === Función para obtener el color basado en el estado
const getStatusColor = (estado) => {
    if (estado === 'No Cumple') return 'bg-red-200 text-red-900';
    if (estado === 'Cumple Parcialmente') return 'bg-orange-200 text-orange-900';
    if (estado === 'Cumple') return 'bg-green-200 text-green-900';
    return '';
};

// === Función para obtener el estado en función del porcentaje
const getEstado = (p) => {
    if (p === 0) return 'No Medido';
    if (p <= 84) return 'No Cumple';
    if (p <= 94) return 'Cumple Parcialmente';
    if (p >= 95) return 'Cumple';
};

// === Guardar los datos en Firestore
const saveDataToFirestore = async (data, collectionName) => {
    const colRef = collection(db, collectionName);
    data.forEach(async (item) => {
        await setDoc(doc(colRef, item.id), item);
    });
};

// === Leer los datos desde Firestore
const fetchDataFromFirestore = async (collectionName) => {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map(doc => doc.data());
    return data;
};

// === Cálculo de estadísticas por categoría y nivel
const calculateCategoryStats = (data) => {
    const categoryStats = {};
    const possibleCategories = ['c', 'o', 'v', 'r', '$', 'g', 'p'];
    const categoryNames = { c: 'Cultura/Entrenamiento', o: 'Operar Seguros', v: 'Vigilar/Prever', r: 'Resiliencia/Continuidad', $: 'Inversiones/Presupuesto', g: 'Gestión de Seguridad', p: 'Planeación' };

    // Inicializa las categorías
    possibleCategories.forEach(category => {
        categoryStats[category] = { nombre: categoryNames[category], cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
    });

    data.forEach(item => {
        const estado = item.estado;
        const categoria = item.categoria;

        // Cuenta los estados
        if (estado === 'Cumple') categoryStats[categoria].cumple++;
        else if (estado === 'Cumple Parcialmente') categoryStats[categoria].cumpleParcial++;
        else if (estado === 'No Cumple') categoryStats[categoria].noCumple++;
        else if (estado === 'No Medido') categoryStats[categoria].noMedido++;
    });

    // Calcula los porcentajes por categoría
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

    // Inicializa los niveles
    for (let i = 1; i <= 4; i++) {
        nivelStats[i] = { nombre: `Nivel ${i}`, cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 };
    }

    // Cuenta los estados por nivel
    data.forEach(item => {
        const estado = item.estado;
        const nivel = item.nivel;

        if (estado === 'Cumple') nivelStats[nivel].cumple++;
        else if (estado === 'Cumple Parcialmente') nivelStats[nivel].cumpleParcial++;
        else if (estado === 'No Cumple') nivelStats[nivel].noCumple++;
        else if (estado === 'No Medido') nivelStats[nivel].noMedido++;
    });

    // Calcula los porcentajes por nivel
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

    useEffect(() => {
        // Guardar datos iniciales en Firestore cuando el componente se monta
        saveDataToFirestore(initialData, 'procesos');
        saveDataToFirestore([], 'acumulado');
        saveDataToFirestore([], 'nivelStats');
    }, []);

    useEffect(() => {
        const loadAcumulado = async () => {
            const fetchedAcumulado = await fetchDataFromFirestore('acumulado');
            setAcumulado(fetchedAcumulado);
        };
        loadAcumulado();
    }, []);


    // Guardar los datos en Firestore
    const saveDataToFirestore = async (data, collectionName) => {
        const colRef = collection(db, collectionName);
        data.forEach(async (item) => {
            await setDoc(doc(colRef, item.mes), item); // Usamos el campo 'mes' como id
        });
    };

    useEffect(() => {
        const loadData = async () => {
            const fetchedData = await fetchDataFromFirestore('procesos');
            setData(fetchedData);
            const calculatedCategoryStats = calculateCategoryStats(fetchedData);
            setCategoryStats(calculatedCategoryStats);
            const calculatedNivelStats = calculateNivelStats(fetchedData);
            setNivelStats(calculatedNivelStats);
        };
        const loadAcumulado = async () => {
            const fetchedAcumulado = await fetchDataFromFirestore('acumulado');
            setAcumulado(fetchedAcumulado);
        };

        loadData();
        loadAcumulado();
    }, []);

    const updatePorcentaje = (e, id) => {
        const p = parseFloat(e.target.value);
        setData(data.map(item =>
            item.id === id
                ? { ...item, porcentaje: isNaN(p) ? 0 : p, estado: getEstado(isNaN(p) ? 0 : p) }
                : item
        ));

        const updatedItem = data.find(item => item.id === id);
        saveDataToFirestore([updatedItem], 'procesos');
    };

    const updateField = (id, field, value) => {
        const updatedData = data.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setData(updatedData);
        saveDataToFirestore(updatedData, 'procesos');

        // Recalcular las estadísticas después de la actualización
        const recalculatedCategoryStats = calculateCategoryStats(updatedData);
        setCategoryStats(recalculatedCategoryStats);
        const recalculatedNivelStats = calculateNivelStats(updatedData);
        setNivelStats(recalculatedNivelStats);
    };

    const updateNivelStats = (e, nivel, campo) => {
        const newValue = parseInt(e.target.value, 10);
        const updatedNivelStats = nivelStats.map(item => {
            if (item.nivel === nivel) {
                const updatedItem = { ...item, [campo]: newValue };
                return updatedItem;
            }
            return item;
        });
        setNivelStats(updatedNivelStats);
        saveDataToFirestore(updatedNivelStats, 'nivelStats');
    };

    useEffect(() => {
        // Cargar los datos de la colección "acumulado" desde Firestore cuando el componente se monta
        const loadAcumulado = async () => {
            const fetchedAcumulado = await fetchDataFromFirestore('acumulado');
            setAcumulado(fetchedAcumulado);
        };
        loadAcumulado();
    }, []);

    useEffect(() => {
        const loadAcumulado = async () => {
            const fetchedAcumulado = await fetchDataFromFirestore('acumulado');
            setAcumulado(fetchedAcumulado);
        };
        loadAcumulado();
    }, []);

    // Función para agregar una nueva fila con valores predeterminados
    const addRow = () => {
        const newRow = {
            mes: '', // Mes vacío para que lo edite el usuario
            cumple: 0,
            cumpleParcial: 0,
            noCumple: 0,
            noMedido: 0,
            noAplica: 0
        };
        setAcumulado([...acumulado, newRow]);
    };

    // Función para eliminar una fila
    const deleteRow = (index) => {
        const updatedRows = acumulado.filter((_, i) => i !== index);
        setAcumulado(updatedRows);
    };

    // Función para actualizar un campo específico de una fila
    const updateAcumulado = (e, mes, field) => {
        const updatedAcumulado = acumulado.map(item =>
            item.mes === mes ? { ...item, [field]: parseInt(e.target.value) || 0 } : item
        );
        setAcumulado(updatedAcumulado);
        saveDataToFirestore(updatedAcumulado, 'acumulado'); // Guardar los datos actualizados en Firestore
    };


    return (
        <div className="p-2 pb-12">
            {/* === Tabla principal === */}
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
                                        onChange={(e) => updateField(item.id, 'nivel', e.target.value)}
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

            {/* === Tabla de acumulado por mes === */}
            <AcumuladoTable acumulado={acumulado} updateAcumulado={updateAcumulado} />

            {/* === Tabla de categorías === */}
            <CategoryTable categoryStats={Object.values(categoryStats)} />

            {/* === Tabla de niveles === */}
            <NivelTable nivelStats={Object.values(nivelStats)} updateNivelStats={updateNivelStats} />
        </div>
    );
};

export default Evaluacion;
