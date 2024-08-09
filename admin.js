document.addEventListener('DOMContentLoaded', () => {
    const temaForm = document.getElementById('adminForm');
    const eliminarTemaButton = document.getElementById('eliminarTema');
    const temaEliminarSelect = document.getElementById('temaEliminar');
    const preguntasExistentes = document.getElementById('preguntasExistentes');
    const irAExamenesButton = document.getElementById('irAExamenes');

    let temas = JSON.parse(localStorage.getItem('temas')) || {};

    function cargarTemas() {
        temaEliminarSelect.innerHTML = '';
        for (let tema in temas) {
            const option = document.createElement('option');
            option.value = tema;
            option.textContent = tema;
            temaEliminarSelect.appendChild(option);
        }
    }

    function agregarTema() {
        const nuevoTema = document.getElementById('temaNuevo').value.trim();
        const preguntasTexto = document.getElementById('preguntasRespuestas').value.trim();
        const preguntasArray = preguntasTexto.split('\n').map(line => line.trim()).filter(line => line !== '');

        if (!nuevoTema) {
            alert('Por favor, ingrese un nombre para el tema.');
            return;
        }

        const preguntas = [];
        preguntasArray.forEach(preguntaTexto => {
            const [numeroYPregunta, ...respuestas] = preguntaTexto.split(/[a-d]\)/).map(part => part.trim());
            const [numero, pregunta] = numeroYPregunta.split('.-').map(part => part.trim());

            if (numero && pregunta && respuestas.length === 4) {
                preguntas.push({
                    numero,
                    pregunta,
                    respuestas,
                    correcta: ''
                });
            } else {
                alert('Formato incorrecto en las preguntas y respuestas.');
                return;
            }
        });

        temas[nuevoTema] = preguntas;
        localStorage.setItem('temas', JSON.stringify(temas));
        cargarTemas();
        alert('Tema agregado exitosamente.');
        document.getElementById('temaNuevo').value = '';
        document.getElementById('preguntasRespuestas').value = '';
    }

    function eliminarTema() {
        const temaEliminar = temaEliminarSelect.value;
        if (!temaEliminar) {
            alert('Por favor, seleccione un tema para eliminar.');
            return;
        }

        delete temas[temaEliminar];
        localStorage.setItem('temas', JSON.stringify(temas));
        cargarTemas();
        preguntasExistentes.innerHTML = '';
        alert('Tema y preguntas eliminados exitosamente.');
    }

    function mostrarPreguntas() {
        const tema = temaEliminarSelect.value;
        if (!tema || !temas[tema]) {
            preguntasExistentes.innerHTML = '';
            return;
        }

        preguntasExistentes.innerHTML = '';
        temas[tema].forEach(pregunta => {
            const divPregunta = document.createElement('div');
            divPregunta.classList.add('pregunta');
            divPregunta.innerHTML = `
                <p><strong>${pregunta.numero}.-</strong> ${pregunta.pregunta}</p>
                <p><strong>Respuestas:</strong></p>
                <ul>
                    <li>a) ${pregunta.respuestas[0]}</li>
                    <li>b) ${pregunta.respuestas[1]}</li>
                    <li>c) ${pregunta.respuestas[2]}</li>
                    <li>d) ${pregunta.respuestas[3]}</li>
                </ul>
                <p><strong>Respuesta Correcta:</strong> 
                    <input type="text" id="respuesta_${pregunta.numero}" value="${pregunta.correcta.toUpperCase() || ''}" placeholder="Respuesta correcta">
                </p>
                <hr>
            `;
            preguntasExistentes.appendChild(divPregunta);
        });
    }

    function guardarRespuestas() {
        const tema = temaEliminarSelect.value;
        if (!tema || !temas[tema]) {
            alert('Por favor, seleccione un tema para guardar respuestas.');
            return;
        }

        temas[tema].forEach(pregunta => {
            const respuestaInput = document.getElementById(`respuesta_${pregunta.numero}`);
            if (respuestaInput) {
                pregunta.correcta = respuestaInput.value.trim().toLowerCase();
            }
        });

        localStorage.setItem('temas', JSON.stringify(temas));
        alert('Respuestas correctas guardadas exitosamente.');
        mostrarPreguntas();
    }

    temaForm.addEventListener('submit', (event) => {
        event.preventDefault();
        agregarTema();
    });

    eliminarTemaButton.addEventListener('click', eliminarTema);
    temaEliminarSelect.addEventListener('change', mostrarPreguntas);
    irAExamenesButton.addEventListener('click', () => {
        window.location.href = 'exam.html';
    });

    // Se agrega un botón para guardar respuestas correctas
    const guardarRespuestasButton = document.createElement('button');
    guardarRespuestasButton.id = 'guardarRespuestas';
    guardarRespuestasButton.textContent = 'Guardar Respuestas Correctas';
    document.body.insertBefore(guardarRespuestasButton, irAExamenesButton);

    guardarRespuestasButton.addEventListener('click', guardarRespuestas);

    cargarTemas();
});


