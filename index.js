document.addEventListener('DOMContentLoaded', () => {
    const temaForm = document.getElementById('temaForm');
    const resultadosExamenes = document.getElementById('resultadosExamenes');
    let temas = JSON.parse(localStorage.getItem('temas')) || {};
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];

    function cargarTemas() {
        const temaSelect = document.getElementById('tema');
        temaSelect.innerHTML = '';
        for (let tema in temas) {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            temaSelect.appendChild(option);
        }
    }

    function mostrarResultados() {
        resultadosExamenes.innerHTML = '<h2>Resultados de Exámenes Anteriores</h2>';
        const temasResultados = resultados.reduce((acc, resultado) => {
            if (!acc.includes(resultado.tema)) {
                acc.push(resultado.tema);
            }
            return acc;
        }, []);

        temasResultados.forEach(tema => {
            const divTema = document.createElement('div');
            divTema.classList.add('tema-revision');
            divTema.textContent = tema;
            divTema.addEventListener('click', () => mostrarExamenesTema(tema));
            resultadosExamenes.appendChild(divTema);
        });

        const borrarRevisiones = document.createElement('button');
        borrarRevisiones.id = 'borrarRevisiones';
        borrarRevisiones.textContent = 'Borrar Revisiones';
        resultadosExamenes.appendChild(borrarRevisiones);
    }

    function mostrarExamenesTema(tema) {
        resultadosExamenes.innerHTML = `<h2>Exámenes del Tema: ${tema}</h2>`;
        const resultadosTema = resultados.filter(resultado => resultado.tema === tema);

        resultadosTema.forEach((resultado, index) => {
            const divResultado = document.createElement('div');
            divResultado.classList.add('resultado-examen');
            divResultado.innerHTML = `
                <p><strong>Intento:</strong> ${index + 1}</p>
                <p><strong>Preguntas:</strong> ${resultado.numPreguntas}</p>
                <p><strong>Aciertos:</strong> ${resultado.aciertos}</p>
                <p><strong>Porcentaje:</strong> ${resultado.porcentaje}%</p>
                <button onclick="revisarExamen(${index})">Revisar Examen</button>
                <hr>
            `;
            resultadosExamenes.appendChild(divResultado);
        });

        const volverAtras = document.createElement('button');
        volverAtras.textContent = 'Volver';
        volverAtras.addEventListener('click', mostrarResultados);
        resultadosExamenes.appendChild(volverAtras);
    }

    window.revisarExamen = function(index) {
        localStorage.setItem('revisarExamen', JSON.stringify(resultados[index]));
        window.location.href = 'exam.html';
    };

    temaForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const tema = document.getElementById('tema').value;
        const tipoExamen = parseInt(document.getElementById('tipoExamen').value);
        localStorage.setItem('examenActual', JSON.stringify({ tema, tipoExamen }));
        window.location.href = 'exam.html';
    });

    document.getElementById('borrarRevisiones').addEventListener('click', () => {
        const tema = document.getElementById('tema').value;
        if (!tema) {
            alert('Selecciona un tema para borrar las revisiones.');
            return;
        }

        resultados = resultados.filter(resultado => resultado.tema !== tema);
        localStorage.setItem('resultados', JSON.stringify(resultados));
        mostrarResultados();
        alert('Las revisiones del tema seleccionado han sido borradas.');
    });

    cargarTemas();
    mostrarResultados();
});







