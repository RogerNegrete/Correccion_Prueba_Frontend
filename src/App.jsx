import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Remueve una posible barra final de la URL base
const baseURL = process.env.REACT_APP_BACKEND_URL?.replace(/\/$/, '') || 'http://localhost:3001';
axios.defaults.baseURL = baseURL;
console.log('Backend URL:', axios.defaults.baseURL);

function App() {
    const [items, setItems] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        nombre: '',
        edad: '',
        seguro: 'A',  // Valor por defecto
        alcolico: 'no',
        lentes: 'no',
        enfermedad: 'no',
        editandoId: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const cargarItems = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/items');
            setItems(res.data);
        } catch (error) {
            setError('Error al cargar items: ' + error.message);
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const buscarItems = async () => {
        try {
            const res = await axios.get(`/api/items/buscar?termino=${busqueda}`);
            setItems(res.data);
        } catch (error) {
            alert('Error en búsqueda: ' + error.message);
        }
    };

    const manejarSubmit = async (e) => {
        e.preventDefault();
        try {
            const itemData = {
                nombre: formData.nombre,
                edad: formData.edad,
                seguro: formData.seguro,
                alcolico: formData.alcolico,
                lentes: formData.lentes,
                enfermedad: formData.enfermedad
            };

            if (formData.editandoId) {
                await axios.put(`/api/items/${formData.editandoId}`, itemData);
            } else {
                await axios.post('/api/items', itemData);
            }
            setFormData({
                id: '',
                nombre: '',
                edad: '',
                seguro: 'A',
                alcolico: 'no',
                lentes: 'no',
                enfermedad: 'no',
                editandoId: null
            });
            await cargarItems();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const eliminarItem = async (id) => {
        try {
            await axios.delete(`/api/items/${id}`);
            await cargarItems();
        } catch (error) {
            alert('Error al eliminar item: ' + error.message);
        }
    };

    const editarItem = (item) => {
        setFormData({
            ...item,
            editandoId: item.id
        });
    };

    useEffect(() => {
        cargarItems();
    }, []);

    return (
        <div className="App">
            <h1>Calculadora de Seguro de Autos</h1>
            
            {error && <div className="error-mensaje">{error}</div>}
            {loading && <div className="loading-mensaje">Cargando...</div>}
            
            <div className="busqueda">
                <input
                    type="text"
                    placeholder="Buscar items..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />
                <button onClick={buscarItems}>Buscar</button>
                <button onClick={cargarItems}>Mostrar Todos</button>
            </div>

            <form onSubmit={manejarSubmit} className="formulario">
                <input
                    type="text"
                    placeholder="Nombre"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
                <input
                    type="number"
                    placeholder="Edad"
                    required
                    value={formData.edad}
                    onChange={(e) => setFormData({...formData, edad: e.target.value})}
                />
                <select
                    value={formData.seguro}
                    onChange={(e) => setFormData({...formData, seguro: e.target.value})}
                >
                    <option value="A">Cobertura Amplia (A)</option>
                    <option value="B">Daños a Terceros (B)</option>
                </select>
                <select
                    value={formData.alcolico}
                    onChange={(e) => setFormData({...formData, alcolico: e.target.value})}
                >
                    <option value="no">No consume alcohol</option>
                    <option value="si">Sí consume alcohol</option>
                </select>
                <select
                    value={formData.lentes}
                    onChange={(e) => setFormData({...formData, lentes: e.target.value})}
                >
                    <option value="no">No usa lentes</option>
                    <option value="si">Sí usa lentes</option>
                </select>
                <select
                    value={formData.enfermedad}
                    onChange={(e) => setFormData({...formData, enfermedad: e.target.value})}
                >
                    <option value="no">No tiene enfermedad</option>
                    <option value="si">Sí tiene enfermedad</option>
                </select>
                <button type="submit">
                    {formData.editandoId ? 'Actualizar' : 'Calcular Seguro'}
                </button>
            </form>

            <div className="lista-items">
                {items.map(item => (
                    <div key={item.id} className="item">
                        <h3>{item.nombre}</h3>
                        <p>Edad: {item.edad}</p>
                        <p>Tipo de Seguro: {item.seguro === 'A' ? 'Cobertura Amplia' : 'Daños a Terceros'}</p>
                        <p>Consume Alcohol: {item.alcolico}</p>
                        <p>Usa Lentes: {item.lentes}</p>
                        <p>Tiene Enfermedad: {item.enfermedad}</p>
                        <p className="costo-total">Costo Total: ${item.costoTotal?.toFixed(2)}</p>
                        <div className="acciones">
                            <button onClick={() => editarItem(item)}>Editar</button>
                            <button onClick={() => eliminarItem(item.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;