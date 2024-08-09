document.addEventListener('DOMContentLoaded', () => {
    const preguntasContainer = document.getElementById('preguntasContainer');
    const resultadoDiv = document.getElementById('resultado');
    const examenForm = document.getElementById('examenForm');

    let temas = JSON.parse(localStorage.getItem('temas')) || {};
    let resultados = JSON.parse(localStorage.getItem('resultados')) || [];
    const examenActual = JSON.parse(localStorage.getItem('examenActual'));
    const revisarExamen = JSON.parse(localStorage.getItem('revisarExamen'));

    function iniciarExamen() {
        if (!examenActual) return;
        const { tema, tipoExamen } = examenActual;
        const preguntasTema = temas[tema];

        // Seleccionar preguntas aleatorias
        let preguntasAleatorias = preguntasTema.sort(() => 0.5 - Math.random()).slice(0, tipoExamen);

        // Guardar las preguntas aleatorias en localStorage para corrección posterior
        localStorage.setItem('preguntasExamenActual', JSON.stringify(preguntasAleatorias));

        preguntasAleatorias.forEach((pregunta, index) => {
            const divPregunta = document.createElement('div');
            divPregunta.classList.add('pregunta');

            const pPregunta = document.createElement('p');
            pPregunta.textContent = pregunta.pregunta;
            divPregunta.appendChild(pPregunta);

            const letras = ['A', 'B', 'C', 'D'];
            pregunta.respuestas.forEach((respuesta, idx) => {
                const label = document.createElement('label');
                label.textContent = `${letras[idx]}) ${respuesta.toUpperCase()}`;

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `pregunta${index}`;
                input.value = letras[idx];

                label.prepend(input);
                divPregunta.appendChild(label);
                divPregunta.appendChild(document.createElement('br'));
            });

            preguntasContainer.appendChild(divPregunta);
        });
    }

    function mostrarExamenGuardado() {
        if (!revisarExamen) return;
        const { preguntas } = revisarExamen;
        preguntasContainer.innerHTML = '';

        preguntas.forEach((pregunta, index) => {
            const divPregunta = document.createElement('div');
            divPregunta.classList.add('pregunta');

            const pPregunta = document.createElement('p');
            pPregunta.textContent = pregunta.pregunta;
            divPregunta.appendChild(pPregunta);

            const letras = ['A', 'B', 'C', 'D'];
            pregunta.respuestas.forEach((respuesta, idx) => {
                const label = document.createElement('label');
                label.textContent = `${letras[idx]}) ${respuesta.toUpperCase()}`;

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `pregunta${index}`;
                input.value = letras[idx];
                input.disabled = true;
                if (letras[idx] === pregunta.seleccionada) {
                    input.checked = true;
                }

                label.prepend(input);
                divPregunta.appendChild(label);
                divPregunta.appendChild(document.createElement('br'));
            });

            preguntasContainer.appendChild(divPregunta);
        });

        const pResultado = document.createElement('p');
        pResultado.textContent = `Resultado: ${revisarExamen.aciertos} de ${revisarExamen.numPreguntas} (${revisarExamen.porcentaje}%)`;
        resultadoDiv.appendChild(pResultado);

        localStorage.removeItem('revisarExamen');
    }

    function calcularResultado() {
        const preguntasGuardadas = JSON.parse(localStorage.getItem('preguntasExamenActual'));
        const { tipoExamen, tema } = examenActual;

        let correctas = 0;
        let preguntasRevisadas = [];
        let respuestasVacias = false;

        preguntasGuardadas.forEach((pregunta, index) => {
            const seleccionada = document.querySelector(`input[name="pregunta${index}"]:checked`)?.value || '';

            if (seleccionada === '') {
                respuestasVacias = true;
            }

            const seleccionadaCorrecta = seleccionada.toUpperCase();
            const correcta = pregunta.correcta.toUpperCase();
            if (seleccionadaCorrecta === correcta) {
                correctas++;
            }

            preguntasRevisadas.push({
                pregunta: pregunta.pregunta,
                respuestas: pregunta.respuestas.map(res => res.toUpperCase()), // Convertir todas las respuestas a mayúsculas
                correcta: pregunta.correcta.toUpperCase(),
                seleccionada: seleccionadaCorrecta,
                acierto: seleccionadaCorrecta === correcta
            });
        });

        if (respuestasVacias) {
            if (!confirm('Faltan respuestas por contestar. ¿Quieres continuar?')) {
                return;
            }
        }

        const porcentaje = ((correctas / tipoExamen) * 100).toFixed(2);
        const resultado = {
            tema,
            numPreguntas: tipoExamen,
            aciertos: correctas,
            porcentaje,
            preguntas: preguntasRevisadas
        };

        resultados.push(resultado);
        localStorage.setItem('resultados', JSON.stringify(resultados));
        resultadoDiv.textContent = `Has acertado ${correctas} de ${tipoExamen} preguntas (${porcentaje}%)`;
        mostrarCorrecionPreguntas(preguntasRevisadas);
        mostrarBotonFinalizarRevision();
        localStorage.removeItem('examenActual');
        localStorage.removeItem('preguntasExamenActual'); // Limpiar las preguntas guardadas
    }

    function mostrarCorrecionPreguntas(preguntasRevisadas) {
        preguntasContainer.innerHTML = '';
        preguntasRevisadas.forEach((pregunta, index) => {
            const divPregunta = document.createElement('div');
            divPregunta.classList.add('pregunta');

            const pPregunta = document.createElement('p');
            pPregunta.textContent = pregunta.pregunta;
            divPregunta.appendChild(pPregunta);

            const letras = ['A', 'B', 'C', 'D'];
            pregunta.respuestas.forEach((respuesta, idx) => {
                const label = document.createElement('label');
                const letra = letras[idx];
                label.textContent = `${letra}) ${respuesta}`;

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `pregunta${index}`;
                input.value = letra;
                input.disabled = true;

                if (letra === pregunta.seleccionada) {
                    input.checked = true;
                }

                if (letra === pregunta.correcta) {
                    label.style.color = 'green'; // Respuesta correcta
                } else if (letra === pregunta.seleccionada) {
                    label.style.color = 'red'; // Respuesta incorrecta
                }

                label.prepend(input);
                divPregunta.appendChild(label);
                divPregunta.appendChild(document.createElement('br'));
            });

            // Mostrar la respuesta correcta debajo
            const pRespuestaCorrecta = document.createElement('p');
            pRespuestaCorrecta.textContent = `Respuesta correcta: ${pregunta.correcta} ${pregunta.acierto ? '(Acierto)' : '(Error)'}`;
            pRespuestaCorrecta.style.color = pregunta.acierto ? 'green' : 'red';
            divPregunta.appendChild(pRespuestaCorrecta);

            preguntasContainer.appendChild(divPregunta);
        });
    }

    function mostrarBotonFinalizarRevision() {
        const botonFinalizarRevision = document.createElement('button');
        botonFinalizarRevision.textContent = 'Finalizar Revisión';
        botonFinalizarRevision.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        resultadoDiv.appendChild(botonFinalizarRevision);
    }

    function limpiarRevisiones() {
        const tema = examenActual?.tema;
        if (!tema) {
            alert('No hay un tema seleccionado para borrar revisiones.');
            return;
        }

        resultados = resultados.filter(resultado => resultado.tema !== tema);
        localStorage.setItem('resultados', JSON.stringify(resultados));
        resultadosExamenes.innerHTML = '';
        alert('Las revisiones del tema seleccionado han sido borradas.');
    }

    if (revisarExamen) {
        mostrarExamenGuardado();
    } else {
        iniciarExamen();
    }

    if (examenForm) {
        examenForm.addEventListener('submit', (event) => {
            event.preventDefault();
            calcularResultado();
        });
    }

    document.getElementById('borrarRevisiones').addEventListener('click', limpiarRevisiones);
});


