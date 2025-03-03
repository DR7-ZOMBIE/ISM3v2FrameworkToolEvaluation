// components/Evaluacion.jsx
import React, { useState, useEffect } from 'react';
import { db, collection, getDocs, setDoc, doc, updateDoc } from '../firebase-config'; // Importa las funciones de Firebase


// === 1) Datos iniciales (la matriz base con los 40 procesos, incluyendo los nuevos)
const initialData = [
    { id: 'GP-1', proceso: 'GP-1', nombre: 'Gestionar Conocimiento', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'c', nivel: 1, editable: true },
    { id: 'GP-2', proceso: 'GP-2', nombre: 'Auditoría de SGSI y de congruencia con la institución', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'g', nivel: 1, editable: true },
    { id: 'OSP-1', proceso: 'OSP-1', nombre: 'Reportar a la gerencia táctica', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 1, editable: true },
    { id: 'OSP-10', proceso: 'OSP-10', nombre: 'Gestión de respaldos', responsable: 'TI', estado: 'Cumple', porcentaje: 95, categoria: 'o', nivel: 1, editable: true },
    { id: 'OSP-11', proceso: 'OSP-11', nombre: 'Control de Acceso', responsable: 'TI', estado: 'Cumple', porcentaje: 95, categoria: 'p', nivel: 2, editable: true },
    { id: 'OSP-12', proceso: 'OSP-12', nombre: 'Creación de usuarios', responsable: 'TI', estado: 'Cumple', porcentaje: 100, categoria: 'g', nivel: 2, editable: true },
    { id: 'OSP-14', proceso: 'OSP-14', nombre: 'Gestión de la protección del entorno físico', responsable: 'SST', estado: 'Cumple', porcentaje: 100, categoria: 'p', nivel: 2, editable: true },
    { id: 'OSP-16', proceso: 'OSP-16', nombre: 'Gestión de la segmentación y filtros', responsable: 'SEGURIDAD', estado: 'Cumple Parcialmente', porcentaje: 93, categoria: 'o', nivel: 1, editable: true },
    { id: 'OSP-17', proceso: 'OSP-17', nombre: 'Gestión de protección contra código nocivo (malware)', responsable: 'TI', estado: 'Cumple', porcentaje: 97, categoria: 'c', nivel: 1, editable: true },
    { id: 'OSP-19', proceso: 'OSP-19', nombre: 'Auditoría técnica interna (ISM-3)', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'c', nivel: 2, editable: true },
    { id: 'OSP-2', proceso: 'OSP-2', nombre: 'Adquisiciones de equipo y servicios para seguridad en infraestructura de operación regular', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'g', nivel: 2, editable: true },
    { id: 'OSP-20', proceso: 'OSP-20', nombre: 'Emulación de incidentes', responsable: 'TI', estado: 'Cumple', porcentaje: 100, categoria: 'p', nivel: 3, editable: true },
    { id: 'OSP-22', proceso: 'OSP-22', nombre: 'Seguimiento a las alertas', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 2, editable: true },
    { id: 'OSP-24', proceso: 'OSP-24', nombre: 'Manejo de incidentes y cuasi incidentes', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 3, editable: true },
    { id: 'OSP-3', proceso: 'OSP-3', nombre: 'Gestión de inventarios', responsable: 'TI', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 3, editable: true },
    { id: 'OSP-4', proceso: 'OSP-4', nombre: 'Control de cambios en los dominios del sistema de información (IS Environment Change Control)', responsable: 'TI', estado: 'Cumple', porcentaje: 95, categoria: 'o', nivel: 2, editable: true },
    { id: 'OSP-5', proceso: 'OSP-5', nombre: 'Actualizar ambientes (Environment Patching)', responsable: 'TI', estado: 'Cumple', porcentaje: 95, categoria: 'o', nivel: 1, editable: true },
    { id: 'OSP-6', proceso: 'OSP-6', nombre: 'Borrar información de ambientes (Environment Clearing)', responsable: 'TI', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 2, editable: true },
    { id: 'OSP-9', proceso: 'OSP-9', nombre: 'Control de cambios en los controles de seguridad', responsable: 'TI', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 2, editable: true },
    { id: 'SSP-1', proceso: 'SSP-1', nombre: 'Reportar a los responsables últimos (stakeholders)', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 1, editable: true },
    { id: 'SSP-2', proceso: 'SSP-2', nombre: 'Coordinar', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'g', nivel: 1, editable: true },
    { id: 'SSP-6', proceso: 'SSP-6', nombre: 'Asignar recursos a seguridad informática', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'r', nivel: 1, editable: true },
    { id: 'TSP-1', proceso: 'TSP-1', nombre: 'Reportar a la gerencia estratégica', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'v', nivel: 1, editable: true },
    { id: 'TSP-11', proceso: 'TSP-11', nombre: 'Cultura de seguridad', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'r', nivel: 2, editable: true },
    { id: 'TSP-2', proceso: 'TSP-2', nombre: 'Gestionar los recursos asignados', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 1, editable: true },
    { id: 'TSP-3', proceso: 'TSP-3', nombre: 'Definir metas de seguridad', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 1, editable: true },
    { id: 'TSP-9', proceso: 'TSP-9', nombre: 'Capacitación', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'r', nivel: 3, editable: true },
    { id: 'TSP-4', proceso: 'TSP-4', nombre: 'Acuerdos de nivel de servicio', responsable: 'TI', estado: 'Cumple', porcentaje: 95, categoria: 'o', nivel: 3, editable: true },
    { id: 'OSP-7', proceso: 'OSP-7', nombre: 'Fortalecimiento de ambientes', responsable: 'TI', estado: 'Cumple', porcentaje: 100, categoria: 'o', nivel: 2, editable: true },
    { id: 'OSP-15', proceso: 'OSP-15', nombre: 'Gestión de la continuidad de las operaciones', responsable: 'SEGURIDAD', estado: 'Cumple', porcentaje: 100, categoria: 'g', nivel: 3, editable: true },
    { id: 'OSP-8', proceso: 'OSP-8', nombre: 'Control de desarrollo del ciclo de vida del software', responsable: 'TI', estado: 'No Cumple', porcentaje: 56, categoria: 'o', nivel: 3, editable: true },
    { id: 'TSP-6', proceso: 'TSP-6', nombre: 'Definir ambientes y ciclos de vida', responsable: 'SEGURIDAD-TI', estado: 'No Cumple', porcentaje: 70, categoria: 'o', nivel: 2, editable: true },
    { id: 'TSP-7', proceso: 'TSP-7', nombre: 'Chequeo de antecedentes', responsable: 'SEGURIDAD', estado: 'No Medido', porcentaje: 0, categoria: 'o', nivel: 4, editable: true },
    { id: 'TSP-8', proceso: 'TSP-8', nombre: 'Selección de personal de seguridad de la información', responsable: 'SEGURIDAD', estado: 'No Medido', porcentaje: 0, categoria: 'c', nivel: 4, editable: true },
    { id: 'OSP-21', proceso: 'OSP-21', nombre: 'Calidad de información y demostración de cumplimiento', responsable: 'SEGURIDAD-TI', estado: 'No Cumple', porcentaje: 45, categoria: 'g', nivel: 4, editable: true },
    { id: 'OSP-26', proceso: 'OSP-26', nombre: 'Mejoras en la disponibilidad y confiabilidad de la infraestructura', responsable: 'TI', estado: 'No Medido', porcentaje: 0, categoria: 'r', nivel: 4, editable: true },
    { id: 'TSP-3A', proceso: 'TSP-3A', nombre: 'Objetivo de ciberseguridad vs Riesgos', responsable: 'SEGURIDAD', estado: 'No Medido', porcentaje: 0, categoria: 'r', nivel: 4, editable: true },
    { id: 'OSP-19A', proceso: 'OSP-19A', nombre: 'Auditoria técnica externa', responsable: 'SST', estado: 'No Medido', porcentaje: 0, categoria: 'o', nivel: 4, editable: true },
    { id: 'OSP-24A', proceso: 'OSP-24A', nombre: 'Detección de eventos y análisis', responsable: 'SEGURIDAD', estado: 'No Medido', porcentaje: 0, categoria: 'v', nivel: 4, editable: true },
    { id: 'SSP-4', proceso: 'SSP-4', nombre: 'TPSRSR (Transparencia, segregación, supervisión, rotación y separación de responsabilidades)', responsable: 'SEGURIDAD', estado: 'No Medido', porcentaje: 0, categoria: 'g', nivel: 4, editable: true },
];

//=== 1.1) Tabla de acumulado por mes

const initialAcumulado = [
    { mes: '2023 JULIO - RM', cumple: 27, cumpleParcial: 4, noCumple: 1, noMedido: 0 },
    { mes: '2023 AGOSTO - RM', cumple: 28, cumpleParcial: 3, noCumple: 1, noMedido: 0 },
    { mes: '2023 SEPTIEMBRE - RM', cumple: 28, cumpleParcial: 3, noCumple: 1, noMedido: 0 },
    { mes: '2023 OCTUBRE - RM', cumple: 30, cumpleParcial: 2, noCumple: 0, noMedido: 0 },
    { mes: '2023 NOVIEMBRE - RM', cumple: 31, cumpleParcial: 1, noCumple: 0, noMedido: 0 },
    { mes: '2023 DIC - RM', cumple: 28, cumpleParcial: 3, noCumple: 1, noMedido: 0 },
    { mes: '2024 ENERO - RM', cumple: 27, cumpleParcial: 4, noCumple: 1, noMedido: 0 },
    { mes: '2024 FEBRERO - RM', cumple: 26, cumpleParcial: 4, noCumple: 2, noMedido: 0 },
    { mes: '2024 MARZO - RM', cumple: 27, cumpleParcial: 1, noCumple: 4, noMedido: 0 },
    { mes: '2024 ABRIL - RM', cumple: 27, cumpleParcial: 1, noCumple: 4, noMedido: 0 },
    { mes: '2024 MAYO - RM', cumple: 28, cumpleParcial: 1, noCumple: 3, noMedido: 0 },
    { mes: '2024 JUNIO - RM', cumple: 27, cumpleParcial: 2, noCumple: 3, noMedido: 0 },
    { mes: '2024 JULIO - RM', cumple: 28, cumpleParcial: 1, noCumple: 3, noMedido: 0 },
    { mes: '2024 AGOSTO - RM', cumple: 27, cumpleParcial: 2, noCumple: 3, noMedido: 0 },
    { mes: '2024 SEPTIEMBRE - RM', cumple: 27, cumpleParcial: 2, noCumple: 3, noMedido: 0 },
    { mes: '2024 OCTUBRE - RM', cumple: 28, cumpleParcial: 1, noCumple: 3, noMedido: 0 },
    { mes: '2024 NOVIEMBRE - RM', cumple: 29, cumpleParcial: 1, noCumple: 2, noMedido: 0 },
    { mes: '2024 DICIEMBRE - DPJP', cumple: 29, cumpleParcial: 1, noCumple: 2, noMedido: 0 },
    { mes: '2025 ENERO - DPJP', cumple: 29, cumpleParcial: 1, noCumple: 2, noMedido: 0 },
];

// === 1.2) Tabla de acumulado por nivel
const initialNivelStats = [
    { nivel: 1, cumple: 12, cumpleParcial: 1, noCumple: 0, noMedido: 0 },
    { nivel: 2, cumple: 11, cumpleParcial: 0, noCumple: 1, noMedido: 0 },
    { nivel: 3, cumple: 6, cumpleParcial: 0, noCumple: 1, noMedido: 0 },
    { nivel: 4, cumple: 0, cumpleParcial: 0, noCumple: 1, noMedido: 3 },
];


// === 2) Funciones de ayuda
const getEstado = (p) => {
    if (p === 0) return 'No Medido';
    if (p <= 84) return 'No Cumple';
    if (p <= 94) return 'Cumple Parcialmente';
    if (p >= 95) return 'Cumple';
};

// Guardar los datos en Firestore
const saveDataToFirestore = async (data) => {
    const colRef = collection(db, "procesos"); // Nombre de la colección en Firestore
    data.forEach(async (item) => {
        await setDoc(doc(colRef, item.id), item); // Guardar o actualizar el documento por su id
    });
};

// Leer los datos desde Firestore
const fetchDataFromFirestore = async () => {
    const colRef = collection(db, "procesos");
    const snapshot = await getDocs(colRef);
    const data = snapshot.docs.map(doc => doc.data());
    return data;
};

// Función para actualizar el porcentaje y guardar en Firestore
const updatePorcentaje = (e, id, data, setData) => {
    const p = parseFloat(e.target.value);
    const updatedData = data.map(item =>
        item.id === id
            ? { ...item, porcentaje: isNaN(p) ? 0 : p, estado: getEstado(isNaN(p) ? 0 : p) }
            : item
    );
    setData(updatedData);  // Actualiza el estado local
    saveDataToFirestore([updatedData.find(item => item.id === id)]);  // Guarda solo el item actualizado
};

// Actualiza el acumulado por mes
const updateAcumulado = (e, mes, field) => {
    const value = parseInt(e.target.value) || 0;
    setAcumulado(acumulado.map(item =>
        item.mes === mes ? { ...item, [field]: value } : item
    ));
};

// Función para agregar una nueva fila
const addRow = () => {
    setAcumulado([
        ...acumulado,
        { mes: 'Nuevo Mes', cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 }
    ]);
};

// Actualiza el acumulado por nivel
const updateNivelStats = (e, nivel, campo) => {
    const newValue = parseInt(e.target.value, 10); // Convertir el valor a número

    setNivelStats(prevStats =>
        prevStats.map(item => {
            if (item.nivel === nivel) {
                // Actualizamos el campo correspondiente
                const updatedItem = { ...item, [campo]: newValue };

                // Recalcular los porcentajes
                const { pcCumple, pcParcial, pcNoCumple, pcNoMedido } = calculatePercentage(
                    updatedItem.cumple, updatedItem.cumpleParcial, updatedItem.noCumple, updatedItem.noMedido
                );

                // Devolver el objeto actualizado con los nuevos valores y los porcentajes calculados
                return { ...updatedItem, pcCumple, pcParcial, pcNoCumple, pcNoMedido };
            }
            return item; // Si el nivel no coincide, devolverlo tal como está
        })
    );
};

// Función para calcular los porcentajes
const calculatePercentage = (cumple, cumpleParcial, noCumple, noMedido) => {
    const total = cumple + cumpleParcial + noCumple + noMedido;

    const pcCumple = total === 0 ? '0%' : `${Math.round((cumple / total) * 100)}%`;
    const pcParcial = total === 0 ? '0%' : `${Math.round((cumpleParcial / total) * 100)}%`;
    const pcNoCumple = total === 0 ? '0%' : `${Math.round((noCumple / total) * 100)}%`;
    const pcNoMedido = total === 0 ? '0%' : `${Math.round((noMedido / total) * 100)}%`;

    return { pcCumple, pcParcial, pcNoCumple, pcNoMedido };
};

// Orden de prefijos (GP, TSP, SSP, OSP)
const prefixOrderMap = {
    GP: 1,
    TSP: 2,
    SSP: 3,
    OSP: 4,
};

const getPrefix = (proceso) => proceso.split('-')[0];
const getNumero = (proceso) => parseInt(proceso.split('-')[1]) || 0;

// Colores pastel según el estado
const getStatusColor = (estado) => {
    if (estado === 'No Cumple') return 'bg-red-200 text-red-900';
    if (estado === 'Cumple Parcialmente') return 'bg-orange-200 text-orange-900';
    if (estado === 'Cumple') return 'bg-green-200 text-green-900';
    return '';
};

// Mapeo de categorías a nombres descriptivos
const categoriesMap = {
    c: 'ENTRENAMIENTO/CULTURA (C)',
    o: 'OPERAR SEGUROS (O)',
    v: 'VIGILAR/PREVEER (V)',
    r: 'RESILIENCIA/CONTINUIDAD (R)',
    '$': 'INVERSIONES/PRESUPUESTO ($)',
    g: 'GESTION DE SEGURIDAD (G)',
    p: 'PROTECCIÓN (P)',
};

// === 3) Listas desplegables (categorías y niveles)
const possibleCategories = [
    { value: 'c', label: 'ENTRENAMIENTO/CULTURA (C)' },
    { value: 'o', label: 'OPERAR SEGUROS (O)' },
    { value: 'v', label: 'VIGILAR/PREVEER (V)' },
    { value: 'r', label: 'RESILIENCIA/CONTINUIDAD (R)' },
    { value: '$', label: 'INVERSIONES/PRESUPUESTO ($)' },
    { value: 'g', label: 'GESTION DE SEGURIDAD (G)' },
    { value: 'p', label: 'PROTECCIÓN (P)' },
];

const possibleLevels = [1, 2, 3, 4];

// === 4) Componente principal
const Evaluacion = () => {
    const [data, setData] = useState(initialData);
    const [acumulado, setAcumulado] = useState(initialAcumulado);
    const [nivelStats, setNivelStats] = useState(initialNivelStats);

    // Guardar datos iniciales en Firestore cuando el componente se monta
    useEffect(() => {
        saveDataToFirestore(initialData); // Guardamos los datos en Firestore
    }, []);

    // Obtener los datos de Firestore cuando el componente se monta
    useEffect(() => {
        const loadData = async () => {
            const fetchedData = await fetchDataFromFirestore();
            setData(fetchedData); // Actualizamos el estado con los datos obtenidos
        };
        loadData();
    }, []);

    // Función para actualizar el porcentaje y guardar en Firestore
    const updatePorcentaje = (e, id) => {
        const p = parseFloat(e.target.value);
        setData(data.map(item =>
            item.id === id
                ? { ...item, porcentaje: isNaN(p) ? 0 : p, estado: getEstado(isNaN(p) ? 0 : p) }
                : item
        ));

        // Guardar el cambio en Firestore
        const updatedItem = data.find(item => item.id === id);
        saveDataToFirestore([updatedItem]); // Guardamos solo el item actualizado
    };


    // Función para actualizar valores de los campos en la tabla
    const updateAcumulado = (e, mes, field) => {
        const value = parseInt(e.target.value) || 0;
        const updatedAcumulado = acumulado.map(item =>
            item.mes === mes ? { ...item, [field]: value } : item
        );
        setAcumulado(updatedAcumulado);  // Actualiza el estado local
        saveDataToFirestore(updatedAcumulado);  // Guarda todo el acumulado
    };

    // Actualizar el acumulado por nivel y guardar en Firestore
    const updateNivelStats = (e, nivel, campo) => {
        const newValue = parseInt(e.target.value, 10); // Convertir el valor a número
        const updatedNivelStats = nivelStats.map(item => {
            if (item.nivel === nivel) {
                const updatedItem = { ...item, [campo]: newValue };
                // Recalcular los porcentajes
                const { pcCumple, pcParcial, pcNoCumple, pcNoMedido } = calculatePercentage(
                    updatedItem.cumple, updatedItem.cumpleParcial, updatedItem.noCumple, updatedItem.noMedido
                );
                return { ...updatedItem, pcCumple, pcParcial, pcNoCumple, pcNoMedido };
            }
            return item;
        });
        setNivelStats(updatedNivelStats);  // Actualiza el estado local
        saveDataToFirestore(updatedNivelStats);  // Guarda todo el nivelStats
    };


    // Función para agregar una nueva fila a la tabla
    const addRow = () => {
        setAcumulado([
            ...acumulado,
            { mes: 'Nuevo Mes', cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 }
        ]);
    };

    // Actualizar el acumulado por nivel
    useEffect(() => {
        // Recalcular las estadísticas por nivel cuando cambian los datos
        const newStats = [
            { nivel: 1, cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 },
            { nivel: 2, cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 },
            { nivel: 3, cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 },
            { nivel: 4, cumple: 0, cumpleParcial: 0, noCumple: 0, noMedido: 0 }
        ];

        data.forEach(item => {
            const statsItem = newStats.find(s => s.nivel === item.nivel);
            switch (item.estado) {
                case 'Cumple':
                    statsItem.cumple += 1;
                    break;
                case 'Cumple Parcialmente':
                    statsItem.cumpleParcial += 1;
                    break;
                case 'No Cumple':
                    statsItem.noCumple += 1;
                    break;
                case 'No Medido':
                    statsItem.noMedido += 1;
                    break;
                default:
                    break;
            }
        });

        const updatedStats = newStats.map(item => {
            const { pcCumple, pcParcial, pcNoCumple, pcNoMedido } = calculatePercentage(
                item.cumple, item.cumpleParcial, item.noCumple, item.noMedido
            );
            return { ...item, pcCumple, pcParcial, pcNoCumple, pcNoMedido };
        });

        setNivelStats(updatedStats);
    }, [data]);

    // Función para actualizar un campo genérico y guardar en Firestore
    const updateField = (id, field, newValue) => {
        setData(prevData => {
            const updatedData = prevData.map(item => {
                if (item.id === id) {
                    if (field === 'nivel') {
                        return { ...item, nivel: parseInt(newValue, 10) };
                    }
                    if (field === 'categoria') {
                        return { ...item, categoria: newValue };
                    }
                }
                return item;
            });

            // Guardamos los cambios en Firestore
            saveDataToFirestore(updatedData);
            return updatedData;
        });
    };

    // Ordenar la tabla principal
    const sortedData = [...data].sort((a, b) => {
        const prefixA = getPrefix(a.proceso);
        const prefixB = getPrefix(b.proceso);
        const orderA = prefixOrderMap[prefixA] || 99;
        const orderB = prefixOrderMap[prefixB] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return getNumero(a.proceso) - getNumero(b.proceso);
    });

    // Filtrar filas con estado !== "No Medido"
    const displayedData = sortedData;

    // === 5) Construir el resumen por categoría ===
    // Creamos un objeto donde agrupamos conteos por categoría
    const categoryStats = {};
    // Inicializamos contadores
    Object.keys(categoriesMap).forEach(cat => {
        categoryStats[cat] = {
            nombre: categoriesMap[cat],
            cumple: 0,
            cumpleParcial: 0,
            noCumple: 0,
            noMedido: 0,
        };
    });

    // Llenamos los contadores por categoría
    displayedData.forEach(item => {
        const cat = item.categoria;
        // Si aparece una categoría no mapeada, la inicializamos
        if (!categoryStats[cat]) {
            categoryStats[cat] = {
                nombre: cat,
                cumple: 0,
                cumpleParcial: 0,
                noCumple: 0,
                noMedido: 0,
            };
        }
        switch (item.estado) {
            case 'Cumple':
                categoryStats[cat].cumple += 1;
                break;
            case 'Cumple Parcialmente':
                categoryStats[cat].cumpleParcial += 1;
                break;
            case 'No Cumple':
                categoryStats[cat].noCumple += 1;
                break;
            case 'No Medido':
                categoryStats[cat].noMedido += 1;
                break;
            default:
                break;
        }
    });

    // Convertimos el objeto en un array para renderizar en la tabla
    const categoryRows = Object.keys(categoryStats).map(cat => {
        const { nombre, cumple, cumpleParcial, noCumple, noMedido } = categoryStats[cat];
        const total = cumple + cumpleParcial + noCumple + noMedido;

        // Calculamos porcentajes
        const pcCumple = total > 0 ? Math.round((cumple / total) * 100) + '%' : '0%';
        const pcParcial = total > 0 ? Math.round((cumpleParcial / total) * 100) + '%' : '0%';
        const pcNoCumple = total > 0 ? Math.round((noCumple / total) * 100) + '%' : '0%';
        const pcNoMedido = total > 0 ? Math.round((noMedido / total) * 100) + '%' : '0%';

        return {
            cat,
            nombre,
            cumple,
            cumpleParcial,
            noCumple,
            noMedido,
            pcCumple,
            pcParcial,
            pcNoCumple,
            pcNoMedido,
        };
    });

    // Ocultamos categorías que no tengan registros
    const displayedCategories = categoryRows.filter(row =>
        row.cumple + row.cumpleParcial + row.noCumple + row.noMedido > 0
    );

    // Calcular los porcentajes
    const calculatePercentage = (cumple, cumpleParcial, noCumple, noMedido) => {
        const total = cumple + cumpleParcial + noCumple + noMedido;
        const pcCumple = total === 0 ? '0%' : `${Math.round((cumple / total) * 100)}%`;
        const pcParcial = total === 0 ? '0%' : `${Math.round((cumpleParcial / total) * 100)}%`;
        const pcNoCumple = total === 0 ? '0%' : `${Math.round((noCumple / total) * 100)}%`;
        const pcNoMedido = total === 0 ? '0%' : `${Math.round((noMedido / total) * 100)}%`;
        return { pcCumple, pcParcial, pcNoCumple, pcNoMedido };
    };

    // Función para guardar todos los datos de la matriz base
    const updateAllData = () => {
        saveDataToFirestore(data); // Guarda todos los datos de la matriz base
        saveDataToFirestore(acumulado); // Guarda los datos de la tabla acumulada
        saveDataToFirestore(nivelStats); // Guarda las estadísticas de nivel
        alert('Los datos se han actualizado correctamente.');
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
                                {/* Proceso */}
                                <td className="border px-2 py-1 text-center">{item.proceso}</td>

                                {/* Nombre */}
                                <td className="border px-2 py-1 text-center">{item.nombre}</td>

                                {/* Responsable */}
                                <td className="border px-2 py-1 text-center">
                                    {item.editable ? (
                                        <input
                                            type="text"
                                            value={item.responsable}
                                            onChange={(e) => updateField(item.id, 'responsable', e.target.value)}
                                            className="w-full text-center border rounded text-[10px] p-1"
                                        />
                                    ) : (
                                        <span>{item.responsable}</span>
                                    )}
                                </td>

                                {/* Estado */}
                                <td className={`border px-2 py-1 text-center ${getStatusColor(item.estado)}`}>
                                    {item.estado}
                                </td>

                                {/* % Cumplimiento */}
                                <td className="border px-2 py-1 text-center">
                                    {item.editable ? (
                                        <input
                                            type="number"
                                            value={item.porcentaje ?? ''}
                                            onChange={(e) => updatePorcentaje(e, item.id)}
                                            className="w-12 text-center border rounded text-[10px] p-1"
                                        />
                                    ) : (
                                        <span className="text-gray-500">-</span>
                                    )}
                                </td>

                                {/* Categoría (Dropdown) */}
                                <td className="border px-2 py-1 text-center">
                                    {item.editable ? (
                                        <select
                                            value={item.categoria}
                                            onChange={(e) => updateField(item.id, 'categoria', e.target.value)}
                                            className="border rounded text-[10px] p-1"
                                        >
                                            {possibleCategories.map(cat => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span>{item.categoria}</span>
                                    )}
                                </td>

                                {/* Nivel (Dropdown) */}
                                <td className="border px-2 py-1 text-center">
                                    {item.editable ? (
                                        <select
                                            value={item.nivel}
                                            onChange={(e) => updateField(item.id, 'nivel', e.target.value)}
                                            className="border rounded text-[10px] p-1"
                                        >
                                            {possibleLevels.map(lv => (
                                                <option key={lv} value={lv}>
                                                    {lv}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span>{item.nivel}</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Botón de actualizar */}
            <div className="flex justify-center mt-4">
                <button
                    onClick={updateAllData}
                    className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                    Actualizar Todos los Datos
                </button>
            </div>
                        <br />
                        <br />
                        <hr />
            {/* === Tabla de resumen por categoría === */}
            <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
                    <thead className="bg-green-200 text-green-900">
                        <tr>
                            <th rowSpan={2} className="border px-2 py-1 text-center align-middle">
                                Estado por Categoría
                            </th>
                            <th colSpan={4} className="border px-2 py-1 text-center">
                                Totales
                            </th>
                            <th colSpan={4} className="border px-2 py-1 text-center">
                                %
                            </th>
                        </tr>
                        <tr>
                            <th className="border px-2 py-1 text-center">Cumplen</th>
                            <th className="border px-2 py-1 text-center">Parcial</th>
                            <th className="border px-2 py-1 text-center">No Cumple</th>
                            <th className="border px-2 py-1 text-center">No Medido</th>

                            <th className="border px-2 py-1 text-center">Cumplen</th>
                            <th className="border px-2 py-1 text-center">Parcial</th>
                            <th className="border px-2 py-1 text-center">No Cumple</th>
                            <th className="border px-2 py-1 text-center">No Medido</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {displayedCategories.map(row => (
                            <tr key={row.cat} className="hover:bg-gray-100">
                                <td className="border px-2 py-1 text-center font-semibold">
                                    {row.nombre}
                                </td>
                                <td className="border px-2 py-1 text-center">{row.cumple}</td>
                                <td className="border px-2 py-1 text-center">{row.cumpleParcial}</td>
                                <td className="border px-2 py-1 text-center">{row.noCumple}</td>
                                <td className="border px-2 py-1 text-center">{row.noMedido}</td>

                                <td className="border px-2 py-1 text-center">{row.pcCumple}</td>
                                <td className="border px-2 py-1 text-center">{row.pcParcial}</td>
                                <td className="border px-2 py-1 text-center">{row.pcNoCumple}</td>
                                <td className="border px-2 py-1 text-center">{row.pcNoMedido}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                        <hr />

                <div className="p-2 pb-12">
                    {/* === Tabla acumulada === */}
                    <div className="overflow-x-auto mb-8 mt-8"> {/* Aumentamos el margen superior con mt-8 */}
                        <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
                            <thead className="bg-blue-200 text-blue-900">
                                <tr>
                                    {['Mes', 'Cumple', 'Cumple Parcialmente', 'No Cumple', 'No Medido'].map(h => (
                                        <th key={h} className="border px-2 py-1 text-center">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {acumulado.map(item => (
                                    <tr key={item.mes} className="hover:bg-gray-100">
                                        <td className="border px-2 py-1 text-center">{item.mes}</td>
                                        <td className="border px-2 py-1 text-center">
                                            <input
                                                type="number"
                                                value={item.cumple}
                                                onChange={(e) => updateAcumulado(e, item.mes, 'cumple')}
                                                className="w-12 text-center border rounded text-[10px] p-1"
                                            />
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            <input
                                                type="number"
                                                value={item.cumpleParcial}
                                                onChange={(e) => updateAcumulado(e, item.mes, 'cumpleParcial')}
                                                className="w-12 text-center border rounded text-[10px] p-1"
                                            />
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            <input
                                                type="number"
                                                value={item.noCumple}
                                                onChange={(e) => updateAcumulado(e, item.mes, 'noCumple')}
                                                className="w-12 text-center border rounded text-[10px] p-1"
                                            />
                                        </td>
                                        <td className="border px-2 py-1 text-center">
                                            <input
                                                type="number"
                                                value={item.noMedido}
                                                onChange={(e) => updateAcumulado(e, item.mes, 'noMedido')}
                                                className="w-12 text-center border rounded text-[10px] p-1"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Botón para agregar una fila */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={addRow}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md"
                        >
                            Agregar Fila
                        </button>
                    </div>
                </div>

                        
                <div className="p-2 pb-12">
                    {/* === Tabla de Estado por Nivel de ISM3 === */}
                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full border-collapse text-[10px] shadow-lg rounded-lg">
                            <thead className="bg-blue-200 text-blue-900">
                                <tr>
                                    <th className="border px-2 py-1 text-center">Estado por Nivel de ISM3</th>
                                    <th className="border px-2 py-1 text-center">Cumplen</th>
                                    <th className="border px-2 py-1 text-center">Cumplen Parcialmente</th>
                                    <th className="border px-2 py-1 text-center">No Cumplen</th>
                                    <th className="border px-2 py-1 text-center">No Medido</th>
                                    <th className="border px-2 py-1 text-center">% Cumplen</th>
                                    <th className="border px-2 py-1 text-center">% Cumplen Parcialmente</th>
                                    <th className="border px-2 py-1 text-center">% No Cumplen</th>
                                    <th className="border px-2 py-1 text-center">% No Medido</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {nivelStats.map(item => (
                                    <tr key={item.nivel} className="hover:bg-gray-100">
                                        <td className="border px-2 py-1 text-center">Nivel {item.nivel}</td>
                                        <td className="border px-2 py-1 text-center">{item.cumple}</td>
                                        <td className="border px-2 py-1 text-center">{item.cumpleParcial}</td>
                                        <td className="border px-2 py-1 text-center">{item.noCumple}</td>
                                        <td className="border px-2 py-1 text-center">{item.noMedido}</td>
                                        <td className="border px-2 py-1 text-center">{item.pcCumple}</td>
                                        <td className="border px-2 py-1 text-center">{item.pcParcial}</td>
                                        <td className="border px-2 py-1 text-center">{item.pcNoCumple}</td>
                                        <td className="border px-2 py-1 text-center">{item.pcNoMedido}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>


            </div>
        </div >

    );
};

export default Evaluacion;
