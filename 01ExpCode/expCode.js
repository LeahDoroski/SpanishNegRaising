// Remove command prefix
PennController.ResetPrefix(null);

// Turn off debugger
//DebugOff();


// Saving responses of particpants demographic info:
Header(
    newVar("age").global(),
    newVar("gender").global(),
    newVar("education").global(),
    newVar("languages").global(),
    newVar("region_childhood").global(),
    newVar("region_current").global()
)
.log( "PROLIFIC_ID" , GetURLParameter("id") )
.log( "age" , getVar("age"))
.log( "gender" , getVar("gender") )
.log( "education" , getVar("education") )
.log( "languages", getVar("languages") )
.log( "region_childhood", getVar("region_childhood") )
.log( "region_current", getVar("region_current") )
; 

// Define Pick and pick for creating randomized lists of experimental trials to store and access during Sequence
function Pick(set,n) {
    assert(set instanceof Object, "First argument of pick cannot be a plain string" );
    n = Number(n);
    if (isNaN(n) || n<0) n = 0;
    this.args = [set];
    set.remainingSet = null;
    this.run = function(arrays){
        if (set.remainingSet===null) set.remainingSet = arrays[0];
        const newArray = [];
        for (let i = 0; i < n && set.remainingSet.length; i++)
            newArray.push( set.remainingSet.shift() );
        return newArray;
    }
}

function pick(set, n) { return new Pick(set,n); }

Sequence(
    "consent",
    //"setcounter",
    "participants",
    "instructions",
    randomize("practice_trial"),
    "begin_experiment",
    // Picks 4 random sets of 11 trials from the 44 exp_items and runs a set, then runs the specific filler item and the attention check
    pick(liste=randomize("exp_trial"),11), "filler_for_AC1", "attention_check1",
    pick(liste,11), "filler_for_AC2", "attention_check2",
    pick(liste,11), "filler_for_AC3", "attention_check3",
    pick(liste,11), "filler_for_AC4", "attention_check4",
    "send",
    "completion_screen"
);


// Set the counter, which keeps track of number of clicks onto the experiment so that each person who clicks on the exp gets sent to a new group
// otherwise, if a new person clicks while someone is still taking the exp, they go to the same participant group
//SetCounter("setcounter"); // Here is the counter


// consent form:
newTrial("consent",
    newHtml("consent_form", "Spanish_NR_consent.html")
        .cssContainer({"width":"920px", "margin":"auto", "line-height":"1.2em"})  //width a bit bigger
        .checkboxWarning("Debes aceptar antes de continuar.")
        .print()
    ,
    newHtml("form", `<div class='fancy'><input name='consent' id='consent' type='checkbox'><label for='consent'>Tengo 18 años o más y he leído la información general sobre el proyecto de investigación. Doy mi consentimiento para participar en el proyecto y que mis datos sean procesados dentro de este ámbito. Además, doy mi consentimiento para todos los casos de procesamiento de datos descritos en la sección "Uso posterior de los datos".</label></div>`)
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px"})
        .print()
    ,
    newFunction("check_consent", () => $("#consent").change( e=>{
        if (e.target.checked) getButton("go_to_participants").enable()._runPromises();
        else getButton("go_to_participants").disable()._runPromises();
    }) ).call()
    ,
    newButton("go_to_participants", "<b>Empezar el estudio</b>")
        .center()
        .cssContainer({"margin-bottom":"30px"})
        .disable()
        .print()
        .wait(getHtml("consent_form").test.complete()
            .failure(getHtml("consent_form").warn())
            )
);


// Participants:
newTrial("participants",
    defaultText
        .cssContainer({"width":"80%","margin":"auto", "margin-bottom":"1em", "font-size":"18px"})
        .print()
    ,
    newText("participant_info_header", "<div class='fancy'><h2>Datos Demográficos</h2><p>Todos los datos obtenidos serán tratados de forma estrictamente anónima y no será posible su identificación posteriormente.</p></div>")
        .cssContainer({"text-align":"center", "width":"820px", "margin":"auto", "margin-bottom":"20px"})
    ,
    // Edad(age)
    newText("<b>¿Cuál es su edad?</b>")
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px"})
    ,
    newDropDown("age_input", "por favor, seleccione una categoría para continuar.") 
        .add(
            "18-29",
            "30-39",
            "40-49",
            "50-59",
            "60-69",
            "70-79",
            "80-89",
            "90-99",
            "100+"
        )
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px", "font-size":"18px"})
        .log()
        .print()
        .wait()
    ,
    // Gender
    newText("<b>¿Con qué género se identifica?") 
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px"})
    ,
    newDropDown("gender_input", "por favor, seleccione una categoría.") 
        .add(
            "Femenino",  
            "Masculino",  
            "No binario",  
            "Otro",  
            "Prefiero no contestar"  
        )
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px", "font-size":"18px"})
        .log()
        .print()
        .wait()
    ,
    // Education level
    newText("<b>¿Cuál es el nivel de estudios más alto que ha completado?</b>")  
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px"})
    ,
    newDropDown("education_input", "por favor, seleccione una categoría.")  
        .add(
            "Sin estudios",
            "Educación primaria", 
            "Educación secundaria",
            "Formación profesional de grado superior",
            "Educación universitaria"
        )
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px", "font-size":"18px"})
        .log()
        .print()
        .wait()
    ,
    // Other languages
    newText("<b>¿Habla alguna otra lengua (que no sea español) regularmente en su hogar?</b> </br>(Presione ENTER para continuar)")  
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px"})
    ,
    newTextInput("other_languages_input")
        .cssContainer({"text-align":"center"})
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px", "font-size":"18px"})
        .length(25)
        .log()
        .print()
        .wait()
    ,
    // Childhood Region
    newText("<b> ¿En qué región o regiones de España pasó la mayor parte de su infancia?</b> </br> (Una vez haya seleccionado un lugar, por favor desplácese hacia abajo para continuar)")  
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px"})
    ,
    newScale("region_childhood_input",
            "Andalucía",
            "Aragón",
            "Canarias",
            "Cantabria",
            "Castilla y León",
            "Castilla-La Mancha",
            "Cataluña",
            "Ceuta",
            "Comunidad de Madrid",
            "Comunidad Foral de Navarra",
            "Comunidad Valenciana",
            "Extremadura",
            "Galicia",
            "Islas Baleares",
            "La Rioja",
            "Melilla",
            "País Vasco",
            "Principado de Asturias",
            "Región de Murcia"
            )
        .checkbox()  //logs the ultimate check/uncheck state in value column next to region name in Parameter
        .vertical()
        .cssContainer({"text-align":"center"})
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px", "font-size":"18px"})
        .print()
        .log("all")   //logs all choice selections (check and uncheck) in order in the Value column of Parameter - Choice
        .wait()
    ,
    // Current Region
    newText("<b>¿En qué región o regiones de España reside actualmente?</b>")  
        .cssContainer({"text-align":"center"})
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px"})
    ,
    newScale("region_current_input",
            "Andalucía",
            "Aragón",
            "Canarias",
            "Cantabria",
            "Castilla y León",
            "Castilla-La Mancha",
            "Cataluña",
            "Ceuta",
            "Comunidad de Madrid",
            "Comunidad Foral de Navarra",
            "Comunidad Valenciana",
            "Extremadura",
            "Galicia",
            "Islas Baleares",
            "La Rioja",
            "Melilla",
            "País Vasco",
            "Principado de Asturias",
            "Región de Murcia"
            )
        .checkbox()
        .vertical()
        .cssContainer({"text-align":"center"})
        .cssContainer({"width":"820px", "margin":"auto", "margin-bottom":"20px", "font-size":"18px"})
        .log("all")  //logs all choice selections (check and uncheck) in order in the Value column of Parameter - Choice
        .print()
        .wait()
    ,
    // Button to move to instructions
    newButton("go_to_instructions", "<b>Ir a las instrucciones</b>")  
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px"
        })
        .print()
        .wait()
    ,
    // Save the participant responses into variables to appear in csv
    getVar("age").set(getDropDown("age_input")),
    getVar("gender").set(getDropDown("gender_input")),
    getVar("education").set(getDropDown("education_input")),
    getVar("languages").set(getTextInput("other_languages_input")),
    getVar("region_childhood").set(getScale("region_childhood_input")),  //only saves the most recent choice, whether a check or uncheck
    getVar("region_current").set(getScale("region_current_input"))       //only saves the most recent choice, whether a check or uncheck
);


// Instructions 
newTrial("instructions",
    newText("instructions_top", "<h2>Instrucciones</h2> <br/>Primero, leerá una frase y se le preguntará cuán aceptable le suena (si considera que un hablante nativo la hubiera dicho).")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"10px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    newText("instructions_top2", "Dependiendo de su respuesta, se le pedirá que conteste a una segunda pregunta acerca de la interpretación de esa frase.")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"10px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    newText("instructions_top4", "A continuación, le mostramos un ejemplo similar a los que encontrará durante el estudio.</br>Puede probar a clicar los distintos botones para entender cómo funciona.")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"12px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Example of a trial:
    newText("sentence_instructions", " <i>Frase</i>: <b>María no quería que Juan viniera a la fiesta.</b>")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"18px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        //.print()
    ,
    newText("question1_instructions", "En una escala del 1 al 7, ¿cuán aceptable le suena la frase?")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"-8px",
                //"font-family": "Helvetica, sans-serif",
                "text-align":"center",
                "font-size":"18px"
            })
            //.print()
    ,
    // Add 7 point LikertScale:
    newScale("scaleQ1_instructions", "1","2","3","4","5","6","7")
        .before( newText("left", "<p style='color:red;'>&#10007;</p>") )
        .after( newText("right", "<p style='color:green;'>&#10003;</p>") )
        .keys()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"45px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .labelsPosition("top")
        //.cssContainer({ "margin":"auto","margin-bottom":"20px"})
        //.print()
    ,
    // Print Q2 +LN reading:
    newText("question2_instructions", "En la medida en que esta frase le resulta aceptable, ¿puede tener la siguiente interpretación?<br/> <i>Interpretación</i>: <b>María quería que Juan no viniera a la fiesta.</b>")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"15px",
            //"font-family":"Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        //.print()
    ,
    // Add "yes"/"no" response scale for Q2
    newScale("scaleQ2_instructions", "<span style='margin: 2em;'>No</span>", "<span style='margin: 2em;'>Sí</span>")
        .labelsPosition("top")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"25px",
            //"font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        //.print()
    ,
    // disable the second question until participants click on something on the first question:
    getScale("scaleQ2_instructions").disable()
    ,
     //if 1, 2 or 3 is chosen for Q1
    getScale("scaleQ1_instructions")
        // unselect Q2 response and log NA if they had beforehand selected a value
        .callback(getScale("scaleQ1_instructions")
            .test.selected(1).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(2))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(3))
                .success(
                    getScale("scaleQ2_instructions").unselect()  // deselects logged value when "no" is selected
                )
        )
        // (re-)disables Q2 scale
        .callback(getScale("scaleQ1_instructions")
            .test.selected(1).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(2))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(3))
                .success(
                    getScale("scaleQ2_instructions").disable()
                )
        )
        // no message that sentence has no interpretation if "no" for Q1 - difficult to make the logic with printing on the canvas
        // changes scale labels to grey if "no" for Q1
        .callback(getScale("scaleQ1_instructions")
            .test.selected(1).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(2))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(3))
                .success(
                    getScale("scaleQ2_instructions")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // changes Q2 text to grey
        .callback(getScale("scaleQ1_instructions")
            .test.selected(1).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(2))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(3))
                .success(
                    getText("question2_instructions")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
    // prints continue button: deleted the button for the practice.
    ,
    // Button to move to next trial: deleted
    //if 4-7 is chosen for Q1
    getScale("scaleQ1_instructions")
        // unselect Q2 response if they had selected a value(this is useful if Q1 is chosen >Q2 is selected>Q1 is changed)
        .callback(getScale("scaleQ1_instructions")
            .test.selected(7).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(6))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(5))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(4))
                .success(
                    getScale("scaleQ2_instructions").unselect()  // removes and deselects logged value //CHECK what is being logged!!
                )
        )
        // enables Q2
        .callback(getScale("scaleQ1_instructions")
            .test.selected(7).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(6))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(5))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(4))
                .success(
                    getScale("scaleQ2_instructions").enable() // re-enables the scale when redeciding yes
                )
        )
    ,
    //if 4-7 for Q1
    getScale("scaleQ1_instructions")
        //changes scale labels back to black
        .callback(getScale("scaleQ1_instructions")
            .test.selected(7).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(6))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(5))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(4))
                .success(
                    getScale("scaleQ2_instructions")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
        // changes Q2 text back to black
        .callback(getScale("scaleQ1_instructions")
            .test.selected(7).or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(6))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(5))
                             .or(getScale("scaleQ1_instructions").callback(getScale("scaleQ1_instructions")).test.selected(4))
                .success(
                    getText("question2_instructions")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
    ,
    newCanvas("instructions_example_item_blue", 600, 260)
        .cssContainer({
            "text-align":"center",
            "overflow":"hidden",
            "align-items":"center",
            "background-color":"#aed6f1",
            "border-radius":"10px",
            "margin-top":"-85px",
            "margin-bottom":"20px",
            "margin":"auto"
            //"font-family":"Helvetica, sans-serif",
            //"font-size":"14px"
        })
        .add("center at 300", "middle at 30", getText("sentence_instructions"))
        .add("center at 300", "middle at 70", getText("question1_instructions"))
        .add("center at 300", "middle at 170", getText("question2_instructions"))
        .add("center at 300", "middle at 100", getScale("scaleQ1_instructions"))
        .add("center at 300", "middle at 230", getScale("scaleQ2_instructions"))
        .print()
    ,
    newText("instructions_bottom1", "Además de esto, de vez en cuando se le puede pedir que responda a preguntas sobre el contenido de la frase anterior.")
        .cssContainer({
            "margin":"auto",
            "margin-top":"18px",
            "margin-bottom":"18px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
     newText("instructions_bottom2", "Antes de empezar con el experimento, primero haremos una fase de entrenamiento con cinco frases para que pueda practicar. <br/>Tras esto, vendrá el estudio que funciona exactamente igual que la fase anterior, pero con más frases a evaluar.</br></br>¡Empezamos con la práctica!")
        .cssContainer({
            "margin":"auto",
            "margin-top":"18px",
            "margin-bottom":"18px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    newButton("go_to_exercise", "<b>Empezar la práctica</b>")
        .cssContainer({"margin":"auto","margin-bottom":"20px", "font-size":"18px"})
        .print()
        .wait()
);


//Practice Trials:
Template("ES_NR_practice.csv", row =>
    newTrial("practice_trial",
        // Question1_practice:
        newText("sentence_practice", "<i>Frase</i>: <b>"+row.Sentence+"</b><br/>")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"40px",
                //"font-family": "Helvetica, sans-serif",
                "text-align":"center",
                "font-size":"18px"
            })
            .print()
        ,
        newText("question1_practice", "En una escala del 1 al 7, ¿cuán aceptable le suena la frase?")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"-8px",
                //"font-family": "Helvetica, sans-serif",
                "text-align":"center",
                "font-size":"18px"
            })
            .print()
        ,
        // Add 7 point LikertScale:
        newScale("scaleQ1_practice", "1","2","3","4","5","6","7")
            .before( newText("left", "<p style='color:red;'>&#10007;</p>") )
            .after( newText("right", "<p style='color:green;'>&#10003;</p>") )
            .keys()
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"30px",
                "font-family":"Helvetica, sans-serif",
                "font-weight":"bold",
                "font-size":"18px"
            })
            .log()
            .labelsPosition("top")
            //.cssContainer({ "margin":"auto","margin-bottom":"20px"})
            .print()
        ,
        // Print Q2 +LN reading:
        newText("question2_practice", "En la medida en que esta frase le resulta aceptable, ¿puede tener la siguiente interpretación?<br/><i>Interpretación</i>: <b>"+row.LN_reading_practice)
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"10px",
                //"font-family":"Helvetica, sans-serif",
                "text-align":"center",
                "font-size":"18px"
            })
            .print()
        ,
        // Add "yes"/"no" response scale for Q2
        newScale("scaleQ2_practice", "<span style='margin: 2em;'>No</span>", "<span style='margin: 2em;'>Sí</span>")
            .labelsPosition("top")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"25px",
                "font-family":"Helvetica, sans-serif",
                "font-weight":"bold",
                "font-size":"18px"
            })
            .log()
            .print()
        ,
        // disable the second question until participants click on something on the first question:
        getScale("scaleQ2_practice").disable()
        ,
        //if 1, 2 or 3 is chosen for Q1
        getScale("scaleQ1_practice")
            // unselect and unlog(?) Q2 response if they had previously selected a value for Q2
            .callback(getScale("scaleQ1_practice")
                .test.selected(1).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(2))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(3))
                    .success(
                        getScale("scaleQ2_practice").unselect().log(0)  // first unselect scale in trial, then relog dummy value //CHECK what is being logged!!
                    )
            )
            // (re-)disables Q2 scale
            .callback(getScale("scaleQ1_practice")
                .test.selected(1).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(2))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(3))
                    .success(
                        getScale("scaleQ2_practice").disable()
                    )
            )
            // gives message that sentence has no interpretation if 1-3 for Q1
            .callback(getScale("scaleQ1_practice")
                .test.selected(1).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(2))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(3))
                    .success(
                        getText("no_interpretation_practice").print()
                    )
            )
            // changes scale labels to grey if 1-3 for Q1
            .callback(getScale("scaleQ1_practice")
                .test.selected(1).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(2))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(3))
                    .success(
                        getScale("scaleQ2_practice")
                            .cssContainer({
                                "color":"#D3D3D3"
                            })
                    )
            )
            // changes Q2 text to grey if 1-3 for Q1
            .callback(getScale("scaleQ1_practice")
                .test.selected(1).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(2))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(3))
                    .success(
                        getText("question2_practice")
                            .cssContainer({
                                "color":"#D3D3D3"
                            })
                    )
            )
            // prints continue button if 1-3 for Q1:
            .callback(getScale("scaleQ1_practice")
                .test.selected(1).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(2))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(3))
                    .success(
                        getButton("go_to_next_practice").print().wait()
                    )
            )
        ,
        //if 4-7 is chosen for Q1
        getScale("scaleQ1_practice")
            // unselect Q2 response if they had previously selected a value
            //  this is useful if Q1 is chosen with 4-7 then Q2 is selected then Q1 is changed to different value of 4-7
            .callback(getScale("scaleQ1_practice")
                .test.selected(7).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(6))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(5))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(4))
                    .success(
                        getScale("scaleQ2_practice").unselect()  // deselects value requiring participants to reselect a value
                    )
            )
            // enables Q2
            .callback(getScale("scaleQ1_practice")
                .test.selected(7).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(6))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(5))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(4))
                    .success(
                        getScale("scaleQ2_practice").enable().log()  // re-asserts to log the scale when redeciding yes! //CHECK what is being logged!!
                    )
            )
            // removes continue button when 7 is first clicked
            .callback(getScale("scaleQ1_practice")
                .test.selected(7).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(6))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(5))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(4))
                    .success(
                        getButton("go_to_next_practice").remove()
                    )
            )
        ,
        //if 4-7 for Q1
        getScale("scaleQ1_practice")
            // removes the no interpretation message
            .callback(getScale("scaleQ1_practice")
                .test.selected(7).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(6))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(5))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(4))
                    .success(
                        getText("no_interpretation_practice").remove()
                    )
            )
            //changes scale labels back to black
            .callback(getScale("scaleQ1_practice")
                .test.selected(7).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(6))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(5))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(4))
                    .success(
                        getScale("scaleQ2_practice")
                            .cssContainer({
                                "color":"black"
                            })
                    )
            )
            // changes Q2 text back to black
            .callback(getScale("scaleQ1_practice")
                .test.selected(7).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(6))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(5))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(4))
                    .success(
                        getText("question2_practice")
                            .cssContainer({
                                "color":"black"
                            })
                    )
            )
        ,
        // prints continue button if Q1 is 1-3:
        getScale("scaleQ1_practice")
            .callback(getScale("scaleQ1_practice")
                .test.selected(1).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(2))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(3))
                    .success(
                        getButton("go_to_next_practice").print().wait()
                    )
            )
        ,
        //prints continue button if checked 4-7 for Q1 and Q2 was selected
        getScale("scaleQ1_practice")
            .callback(getScale("scaleQ1_practice")
                .test.selected(7).or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(6))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(5))
                                 .or(getScale("scaleQ1_practice").callback(getScale("scaleQ1_practice")).test.selected(4))
                    .success(
                        getScale("scaleQ2_practice")
                            .callback(getScale("scaleQ2_practice")
                                .test.selected()
                                    .success(
                                        getButton("go_to_next_practice").print().wait()
                                    )
                            )
                    )
            )
        ,
        // Message saying no interpretation if checked "no"
        newText("no_interpretation_practice", "La frase no es aceptable.")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"20px",
                "font-size":"18px",
                "font-weight":"bold",
                "text-align":"center",
                "color":"#0039a6"
            })
        ,
        // Button to move to next trial
        newButton("go_to_next_practice", "Continuar") // must come after tests
            .cssContainer({"margin":"auto"})
            .wait()
    ) //end particular practice trial
    // log this information into the results file
    .log("Item_number",row.Item_practice) // item number
    // .log("sentence_number",row.practice_item_number) //actual sentence number
    .log("condition",row.Condition_practice) // condition for practice items
    //.log("pred",row.practice_pred) // predicate type
    //.log("group", row.group) // Participant group - only for exp items
); // end practice trial template



//pre-experiment:
//Message: End of Practice
newTrial("begin_experiment",
        newText("pre_experiment", "<p>¡Perfecto! Con esto finalizamos la fase de entrenamiento.<br> Pulse el botón de <q>continuar</q> para empezar con el experimento.  </p>")
        .cssContainer({"margin":"auto", "line-height":"1.7em", "font-size":"18px"})
        .print()
    ,
    newButton("go_to_experiment", "Continuar")
        .cssContainer({"margin":"auto", "font-size":"18px"})
        .print()
        .wait()
);



// Experimental trials
Template("ES_NR_ExpItems.csv", row =>
    newTrial("exp_trial",
        // Question1:
        newText("sentence_exp", "<i>Frase</i>: <b>"+row.Sentence+"</b><br/>")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"40px",
                //"font-family": "Helvetica, sans-serif",
                "text-align":"center",
                "font-size":"18px"
            })
            .print()
        ,
        newText("question1_exp", "En una escala del 1 al 7, ¿cuán aceptable le suena la frase?")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"-8px",
                //"font-family": "Helvetica, sans-serif",
                "text-align":"center",
                "font-size":"18px"
            })
            .print()
        ,
        // Add 7 point LikertScale:
        newScale("scaleQ1_exp", "1","2","3","4","5","6","7")
            .before( newText("left", "<p style='color:red;'>&#10007;</p>") )
            .after( newText("right", "<p style='color:green;'>&#10003;</p>") )
            .keys()
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"30px",
                "font-family":"Helvetica, sans-serif",
                "font-weight":"bold",
                "font-size":"18px"
            })
            .log()
            .labelsPosition("top")
            //.cssContainer({ "margin":"auto","margin-bottom":"20px"})
            .print()
        ,
        // Print Q2 +LN reading:
        newText("question2_exp", "En la medida en que esta frase le resulta aceptable, ¿puede tener la siguiente interpretación?<br/><i>Interpretación</i>: <b>"+row.LN_reading_experiment)
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"10px",
                //"font-family":"Helvetica, sans-serif",
                "text-align":"center",
                "font-size":"18px"
            })
            .print()
        ,
        // Add "yes"/"no" response scale for Q2
        newScale("scaleQ2_exp", "<span style='margin: 2em;'>No</span>", "<span style='margin: 2em;'>Sí</span>")
            .labelsPosition("top")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"25px",
                "font-family":"Helvetica, sans-serif",
                "font-weight":"bold",
                "font-size":"18px"
            })
            .log()
            .print()
        ,
        // disable the second question until participants click on something on the first question:
        getScale("scaleQ2_exp").disable()
        ,
        //if 1, 2 or 3 is chosen for Q1
        getScale("scaleQ1_exp")
            // unselect and unlog(?) Q2 response if they had previously selected a value for Q2
            .callback(getScale("scaleQ1_exp")
                .test.selected(1).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(2))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(3))
                    .success(
                        getScale("scaleQ2_exp").unselect().log(0)  // first unselect scale in trial, then relog dummy value //CHECK what is being logged!!
                    )
            )
            // (re-)disables Q2 scale
            .callback(getScale("scaleQ1_exp")
                .test.selected(1).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(2))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(3))
                    .success(
                        getScale("scaleQ2_exp").disable()
                    )
            )
            // gives message that sentence has no interpretation if 1-3 for Q1
            .callback(getScale("scaleQ1_exp")
                .test.selected(1).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(2))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(3))
                    .success(
                        getText("no_interpretation_exp").print()
                    )
            )
            // changes scale labels to grey if 1-3 for Q1
            .callback(getScale("scaleQ1_exp")
                .test.selected(1).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(2))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(3))
                    .success(
                        getScale("scaleQ2_exp")
                            .cssContainer({
                                "color":"#D3D3D3"
                            })
                    )
            )
            // changes Q2 text to grey if 1-3 for Q1
            .callback(getScale("scaleQ1_exp")
                .test.selected(1).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(2))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(3))
                    .success(
                        getText("question2_exp")
                            .cssContainer({
                                "color":"#D3D3D3"
                            })
                    )
            )
            // prints continue button if 1-3 for Q1:
            .callback(getScale("scaleQ1_exp")
                .test.selected(1).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(2))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(3))
                    .success(
                        getButton("go_to_next_exp").print().wait()
                    )
            )
        ,
        //if 4-7 is chosen for Q1
        getScale("scaleQ1_exp")
            // unselect Q2 response if they had previously selected a value
            //  this is useful if Q1 is chosen with 4-7 then Q2 is selected then Q1 is changed to different value of 4-7
            .callback(getScale("scaleQ1_exp")
                .test.selected(7).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(6))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(5))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(4))
                    .success(
                        getScale("scaleQ2_exp").unselect()  // deselects value requiring participants to reselect a value
                    )
            )
            // enables Q2
            .callback(getScale("scaleQ1_exp")
                .test.selected(7).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(6))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(5))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(4))
                    .success(
                        getScale("scaleQ2_exp").enable().log()  // re-asserts to log the scale when redeciding yes! //CHECK what is being logged!!
                    )
            )
            // removes continue button when 7 is first clicked
            .callback(getScale("scaleQ1_exp")
                .test.selected(7).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(6))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(5))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(4))
                    .success(
                        getButton("go_to_next_exp").remove()
                    )
            )
        ,
        //if 4-7 for Q1
        getScale("scaleQ1_exp")
            // removes the no interpretation message
            .callback(getScale("scaleQ1_exp")
                .test.selected(7).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(6))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(5))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(4))
                    .success(
                        getText("no_interpretation_exp").remove()
                    )
            )
            //changes scale labels back to black
            .callback(getScale("scaleQ1_exp")
                .test.selected(7).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(6))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(5))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(4))
                    .success(
                        getScale("scaleQ2_exp")
                            .cssContainer({
                                "color":"black"
                            })
                    )
            )
            // changes Q2 text back to black
            .callback(getScale("scaleQ1_exp")
                .test.selected(7).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(6))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(5))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(4))
                    .success(
                        getText("question2_exp")
                            .cssContainer({
                                "color":"black"
                            })
                    )
            )
        ,
        // prints continue button if Q1 is 1-3:
        getScale("scaleQ1_exp")
            .callback(getScale("scaleQ1_exp")
                .test.selected(1).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(2))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(3))
                    .success(
                        getButton("go_to_next_exp").print().wait()
                    )
            )
        ,
        //prints continue button if checked 4-7 for Q1 and Q2 was selected
        getScale("scaleQ1_exp")
            .callback(getScale("scaleQ1_exp")
                .test.selected(7).or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(6))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(5))
                                 .or(getScale("scaleQ1_exp").callback(getScale("scaleQ1_exp")).test.selected(4))
                    .success(
                        getScale("scaleQ2_exp")
                            .callback(getScale("scaleQ2_exp")
                                .test.selected()
                                    .success(
                                        getButton("go_to_next_exp").print().wait()
                                    )
                            )
                    )
            )
        ,
        // Message saying no interpretation if checked "no"
        newText("no_interpretation_exp", "La frase no es aceptable.")
            .cssContainer({
                "margin":"auto",
                "margin-bottom":"20px",
                "font-size":"18px",
                "font-weight":"bold",
                "text-align":"center",
                "color":"#0039a6"
            })
        ,
        // Button to move to next trial
        newButton("go_to_next_exp", "Continuar") // must come after tests
            .cssContainer({"margin":"auto"})
            .wait()
    ) //end particular experimental trial
    // log this information into the results file
    .log("sentence_number",row.SentenceNum)  // sentence number
    .log("item_type",row.Items)  // Item type: control or critical
    .log("item_number",row.ItemNum)  // item number
    .log("group",row.Group)  // Participant group for exp items
    .log("condition",row.Condition)  // condition for exp items
    .log("verb",row.Verb)  // predicate
    .log("verb_type",row.VerbType)  // predicate type: NR or non-NR
    .log("mood",row.Mood)  // mood: Ind or Subj
    .log("mood_type",row.TypeMood)  // -ra or -se with Subj
    .log("NPI",row.NPI)  // NPI yes or no
    .log("NPI_type",row.NPIType)  // NPI type: en Ns or hasta
    .log("EmbVerb",row.EmbeddedVerb)  // Embedded verb
); // end experimental trial template




// Specific filler item for attention check 1
newTrial("filler_for_AC1",
    // Question1:
    newText("sentence_filler_AT1", "<i>Frase</i>: <b>Enrique aseguraba que el festival iba a comenzar hasta las siete.</b><br/>")  // Item 41
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"40px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    newText("question1_filler_AT1", "En una escala del 1 al 7, ¿cuán aceptable le suena la frase?")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"-8px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add 7 point LikertScale:
    newScale("scaleQ1_filler_AT1", "1","2","3","4","5","6","7")
        .before( newText("left", "<p style='color:red;'>&#10007;</p>") )
        .after( newText("right", "<p style='color:green;'>&#10003;</p>") )
        .keys()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"30px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .labelsPosition("top")
        //.cssContainer({ "margin":"auto","margin-bottom":"20px"})
        .print()
    ,
    // Print Q2 +LN reading:
    newText("question2_filler_AT1", "En la medida en que esta frase le resulta aceptable, ¿puede tener la siguiente interpretación?<br/><i>Interpretación</i>: <b>Enrique aseguraba que el festival no iba a comenzar hasta las siete.</b>")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"10px",
            //"font-family":"Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add "yes"/"no" response scale for Q2
    newScale("scaleQ2_filler_AT1", "<span style='margin: 2em;'>No</span>", "<span style='margin: 2em;'>Sí</span>")
        .labelsPosition("top")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"25px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .print()
    ,
    // disable the second question until participants click on something on the first question:
    getScale("scaleQ2_filler_AT1").disable()
    ,
    //if 1, 2 or 3 is chosen for Q1
    getScale("scaleQ1_filler_AT1")
        // unselect and unlog(?) Q2 response if they had previously selected a value for Q2
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(1).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT1").unselect().log(0)  // first unselect scale in trial, then relog dummy value //CHECK what is being logged!!
                )
        )
        // (re-)disables Q2 scale
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(1).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT1").disable()
                )
        )
        // gives message that sentence has no interpretation if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(1).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(3))
                .success(
                    getText("no_interpretation_filler_AT1").print()
                )
        )
        // changes scale labels to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(1).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT1")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // changes Q2 text to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(1).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(3))
                .success(
                    getText("question2_filler_AT1")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // prints continue button if 1-3 for Q1:
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(1).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT1").print().wait()
                )
        )
    ,
    //if 4-7 is chosen for Q1
    getScale("scaleQ1_filler_AT1")
        // unselect Q2 response if they had previously selected a value
        //  this is useful if Q1 is chosen with 4-7 then Q2 is selected then Q1 is changed to different value of 4-7
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(7).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT1").unselect()  // deselects value requiring participants to reselect a value
                )
        )
        // enables Q2
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(7).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT1").enable().log()  // re-asserts to log the scale when redeciding yes! //CHECK what is being logged!!
                )
        )
        // removes continue button when 7 is first clicked
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(7).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(4))
                .success(
                    getButton("go_to_next_filler_AT1").remove()
                )
        )
    ,
    //if 4-7 for Q1
    getScale("scaleQ1_filler_AT1")
        // removes the no interpretation message
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(7).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(4))
                .success(
                    getText("no_interpretation_filler_AT1").remove()
                )
        )
        //changes scale labels back to black
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(7).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT1")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
        // changes Q2 text back to black
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(7).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(4))
                .success(
                    getText("question2_filler_AT1")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
    ,
    // prints continue button if Q1 is 1-3:
    getScale("scaleQ1_filler_AT1")
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(1).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT1").print().wait()
                )
        )
    ,
    //prints continue button if checked 4-7 for Q1 and Q2 was selected
    getScale("scaleQ1_filler_AT1")
        .callback(getScale("scaleQ1_filler_AT1")
            .test.selected(7).or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT1").callback(getScale("scaleQ1_filler_AT1")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT1")
                        .callback(getScale("scaleQ2_filler_AT1")
                            .test.selected()
                                .success(
                                    getButton("go_to_next_filler_AT1").print().wait()
                                )
                        )
                )
        )
    ,
    // Message saying no interpretation if checked "no"
    newText("no_interpretation_filler_AT1", "La frase no es aceptable.")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px",
            "font-weight":"bold",
            "text-align":"center",
            "color":"#0039a6"
        })
    ,
    // Button to move to next trial
    newButton("go_to_next_filler_AT1", "Continuar") // must come after tests
        .cssContainer({"margin":"auto"})
        .wait()
);



// Attention check 1
newTrial("attention_check1",
    newText("ac1_question", "¿De qué temas trataba la frase anterior?")  
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"20px",
            //"font-weight":"bold",
            "text-align":"center"
        })
        .print()
    ,
    newScale("scale_attention_check1",         //TRANSLATE CHOICE RESPONSES!!
        "a. Gregorio y una carta rota.",
        "b. Enrique y un festival.",  // correct answer
        "c. Estela y un circo.",
        "d. Alicia y un intercambio de libros."
        )
        .labelsPosition("right")
        .vertical()
        .log()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px"
        })
        .print()
        .wait()
    ,
    newButton("continue_AT1", "Continuar")
        .cssContainer({"margin":"auto"})
        .print()
        .wait()
);


// Specific filler item for attention check 2
newTrial("filler_for_AC2",
    // Question1:
    newText("sentence_filler_AT2", "<i>Frase</i>: <b>Teresa sabía que fuese a llover ese mes.</b><br/>") // Item 43
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"40px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    newText("question1_filler_AT2", "En una escala del 1 al 7, ¿cuán aceptable le suena la frase?")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"-8px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add 7 point LikertScale:
    newScale("scaleQ1_filler_AT2", "1","2","3","4","5","6","7")
        .before( newText("left", "<p style='color:red;'>&#10007;</p>") )
        .after( newText("right", "<p style='color:green;'>&#10003;</p>") )
        .keys()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"30px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .labelsPosition("top")
        //.cssContainer({ "margin":"auto","margin-bottom":"20px"})
        .print()
    ,
    // Print Q2 +LN reading:
    newText("question2_filler_AT2", "En la medida en que esta frase le resulta aceptable, ¿puede tener la siguiente interpretación?<br/><i>Interpretación</i>: <b>Teresa sabía que no iba a llover ese mes.</b>")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"10px",
            //"font-family":"Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add "yes"/"no" response scale for Q2
    newScale("scaleQ2_filler_AT2", "<span style='margin: 2em;'>No</span>", "<span style='margin: 2em;'>Sí</span>")
        .labelsPosition("top")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"25px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .print()
    ,
    // disable the second question until participants click on something on the first question:
    getScale("scaleQ2_filler_AT2").disable()
    ,
    //if 1, 2 or 3 is chosen for Q1
    getScale("scaleQ1_filler_AT2")
        // unselect and unlog(?) Q2 response if they had previously selected a value for Q2
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(1).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT2").unselect().log(0)  // first unselect scale in trial, then relog dummy value //CHECK what is being logged!!
                )
        )
        // (re-)disables Q2 scale
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(1).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT2").disable()
                )
        )
        // gives message that sentence has no interpretation if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(1).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(3))
                .success(
                    getText("no_interpretation_filler_AT2").print()
                )
        )
        // changes scale labels to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(1).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT2")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // changes Q2 text to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(1).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(3))
                .success(
                    getText("question2_filler_AT2")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // prints continue button if 1-3 for Q1:
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(1).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT2").print().wait()
                )
        )
    ,
    //if 4-7 is chosen for Q1
    getScale("scaleQ1_filler_AT2")
        // unselect Q2 response if they had previously selected a value
        //  this is useful if Q1 is chosen with 4-7 then Q2 is selected then Q1 is changed to different value of 4-7
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(7).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT2").unselect()  // deselects value requiring participants to reselect a value
                )
        )
        // enables Q2
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(7).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT2").enable().log()  // re-asserts to log the scale when redeciding yes! //CHECK what is being logged!!
                )
        )
        // removes continue button when 7 is first clicked
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(7).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(4))
                .success(
                    getButton("go_to_next_filler_AT2").remove()
                )
        )
    ,
    //if 4-7 for Q1
    getScale("scaleQ1_filler_AT2")
        // removes the no interpretation message
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(7).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(4))
                .success(
                    getText("no_interpretation_filler_AT2").remove()
                )
        )
        //changes scale labels back to black
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(7).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT2")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
        // changes Q2 text back to black
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(7).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(4))
                .success(
                    getText("question2_filler_AT2")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
    ,
    // prints continue button if Q1 is 1-3:
    getScale("scaleQ1_filler_AT2")
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(1).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT2").print().wait()
                )
        )
    ,
    //prints continue button if checked 4-7 for Q1 and Q2 was selected
    getScale("scaleQ1_filler_AT2")
        .callback(getScale("scaleQ1_filler_AT2")
            .test.selected(7).or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT2").callback(getScale("scaleQ1_filler_AT2")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT2")
                        .callback(getScale("scaleQ2_filler_AT2")
                            .test.selected()
                                .success(
                                    getButton("go_to_next_filler_AT2").print().wait()
                                )
                        )
                )
        )
    ,
    // Message saying no interpretation if checked "no"
    newText("no_interpretation_filler_AT2", "La frase no es aceptable.")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px",
            "font-weight":"bold",
            "text-align":"center",
            "color":"#0039a6"
        })
    ,
    // Button to move to next trial
    newButton("go_to_next_filler_AT2", "Continuar") // must come after tests
        .cssContainer({"margin":"auto"})
        .wait()
);



// Attention check 2
newTrial("attention_check2",
    newText("ac2_question", "¿De qué temas trataba la frase anterior?")  
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"20px",
            "text-align":"center", 
        })
        .print()
    ,
    newScale("scale_attention_check2",
        "a. Teresa y la lluvia.",  // correct answer
        "b. Beatriz y los setos del jardín.",
        "c. Gabriela y un abrigo.",
        "d. Celia, Jasón e ir a dar un paseo."
        )
        .labelsPosition("right")
        .vertical()
        .log()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px"
        })
        .print()
        .wait()
    ,
    newButton("continue_AT2", "Continuar")
        .cssContainer({"margin":"auto"})
        .print()
        .wait()
); 



// Specific filler item for attention check 3
newTrial("filler_for_AC3",
    // Question1:
    newText("sentence_filler_AT3", "<i>Frase</i>: <b>Hugo recordaba que Yolanda había viajado en años.</b><br/>") // Item 42
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"40px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    newText("question1_filler_AT3", "En una escala del 1 al 7, ¿cuán aceptable le suena la frase?")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"-8px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add 7 point LikertScale:
    newScale("scaleQ1_filler_AT3", "1","2","3","4","5","6","7")
        .before( newText("left", "<p style='color:red;'>&#10007;</p>") )
        .after( newText("right", "<p style='color:green;'>&#10003;</p>") )
        .keys()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"30px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .labelsPosition("top")
        //.cssContainer({ "margin":"auto","margin-bottom":"20px"})
        .print()
    ,
    // Print Q2 +LN reading:
    newText("question2_filler_AT3", "En la medida en que esta frase le resulta aceptable, ¿puede tener la siguiente interpretación?<br/><i>Interpretación</i>: <b>Hugo recordaba que Yolanda no había viajado en años.</b>")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"10px",
            //"font-family":"Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add "yes"/"no" response scale for Q2
    newScale("scaleQ2_filler_AT3", "<span style='margin: 2em;'>No</span>", "<span style='margin: 2em;'>Sí</span>")
        .labelsPosition("top")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"25px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .print()
    ,
    // disable the second question until participants click on something on the first question:
    getScale("scaleQ2_filler_AT3").disable()
    ,
    //if 1, 2 or 3 is chosen for Q1
    getScale("scaleQ1_filler_AT3")
        // unselect and unlog(?) Q2 response if they had previously selected a value for Q2
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(1).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT3").unselect().log(0)  // first unselect scale in trial, then relog dummy value //CHECK what is being logged!!
                )
        )
        // (re-)disables Q2 scale
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(1).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT3").disable()
                )
        )
        // gives message that sentence has no interpretation if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(1).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(3))
                .success(
                    getText("no_interpretation_filler_AT3").print()
                )
        )
        // changes scale labels to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(1).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT3")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // changes Q2 text to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(1).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(3))
                .success(
                    getText("question2_filler_AT3")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // prints continue button if 1-3 for Q1:
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(1).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT3").print().wait()
                )
        )
    ,
    //if 4-7 is chosen for Q1
    getScale("scaleQ1_filler_AT3")
        // unselect Q2 response if they had previously selected a value
        //  this is useful if Q1 is chosen with 4-7 then Q2 is selected then Q1 is changed to different value of 4-7
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(7).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT3").unselect()  // deselects value requiring participants to reselect a value
                )
        )
        // enables Q2
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(7).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT3").enable().log()  // re-asserts to log the scale when redeciding yes! //CHECK what is being logged!!
                )
        )
        // removes continue button when 7 is first clicked
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(7).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(4))
                .success(
                    getButton("go_to_next_filler_AT3").remove()
                )
        )
    ,
    //if 4-7 for Q1
    getScale("scaleQ1_filler_AT3")
        // removes the no interpretation message
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(7).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(4))
                .success(
                    getText("no_interpretation_filler_AT3").remove()
                )
        )
        //changes scale labels back to black
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(7).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT3")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
        // changes Q2 text back to black
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(7).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(4))
                .success(
                    getText("question2_filler_AT3")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
    ,
    // prints continue button if Q1 is 1-3:
    getScale("scaleQ1_filler_AT3")
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(1).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT3").print().wait()
                )
        )
    ,
    //prints continue button if checked 4-7 for Q1 and Q2 was selected
    getScale("scaleQ1_filler_AT3")
        .callback(getScale("scaleQ1_filler_AT3")
            .test.selected(7).or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT3").callback(getScale("scaleQ1_filler_AT3")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT3")
                        .callback(getScale("scaleQ2_filler_AT3")
                            .test.selected()
                                .success(
                                    getButton("go_to_next_filler_AT3").print().wait()
                                )
                        )
                )
        )
    ,
    // Message saying no interpretation if checked "no"
    newText("no_interpretation_filler_AT3", "La frase no es aceptable.")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px",
            "font-weight":"bold",
            "text-align":"center",
            "color":"#0039a6"
        })
    ,
    // Button to move to next trial
    newButton("go_to_next_filler_AT3", "Continuar") // must come after tests
        .cssContainer({"margin":"auto"})
        .wait()
);


// Attention check 3
newTrial("attention_check3",
    newText("ac3_question", "¿De qué temas trataba la frase anterior?")  
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"20px",
            "text-align":"center"
        })
        .print()
    ,
    newScale("scale_attention_check3",
        "a. Alan, Sandra y pintar.",
        "b. Julip, Pedro y beber un refresco.",
        "c. Valeria, Rubén y llamar al médico.",
        "d. Hugo, Yolanda y viajar."  // correct answer
        )
        .labelsPosition("right")
        .vertical()
        .log()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px"
        })
        .print()
        .wait()
    ,
    newButton("continue_AT3", "Continuar")
        .cssContainer({"margin":"auto"})
        .print()
        .wait()
);



// Specific filler item for attention check 4
newTrial("filler_for_AC4",
    // Question1:
    newText("sentence_filler_AT4", "<i>Frase</i>: <b>Claudia estaba segura de que su prima hubiese dibujado ese año.</b><br/>")  // Item 44
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"40px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    newText("question1_filler_AT4", "En una escala del 1 al 7, ¿cuán aceptable le suena la frase?")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"-8px",
            //"font-family": "Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add 7 point LikertScale:
    newScale("scaleQ1_filler_AT4", "1","2","3","4","5","6","7")
        .before( newText("left", "<p style='color:red;'>&#10007;</p>") )
        .after( newText("right", "<p style='color:green;'>&#10003;</p>") )
        .keys()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"30px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .labelsPosition("top")
        //.cssContainer({ "margin":"auto","margin-bottom":"20px"})
        .print()
    ,
    // Print Q2 +LN reading:
    newText("question2_filler_AT4", "En la medida en que esta frase le resulta aceptable, ¿puede tener la siguiente interpretación?<br/><i>Interpretación</i>: <b>Claudia estaba segura de que su prima no había dibujado ese año.</b>")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"10px",
            //"font-family":"Helvetica, sans-serif",
            "text-align":"center",
            "font-size":"18px"
        })
        .print()
    ,
    // Add "yes"/"no" response scale for Q2
    newScale("scaleQ2_filler_AT4", "<span style='margin: 2em;'>No</span>", "<span style='margin: 2em;'>Sí</span>")
        .labelsPosition("top")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"25px",
            "font-family":"Helvetica, sans-serif",
            "font-weight":"bold",
            "font-size":"18px"
        })
        .log()
        .print()
    ,
    // disable the second question until participants click on something on the first question:
    getScale("scaleQ2_filler_AT4").disable()
    ,
    //if 1, 2 or 3 is chosen for Q1
    getScale("scaleQ1_filler_AT4")
        // unselect and unlog(?) Q2 response if they had previously selected a value for Q2
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(1).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT4").unselect().log(0)  // first unselect scale in trial, then relog dummy value //CHECK what is being logged!!
                )
        )
        // (re-)disables Q2 scale
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(1).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT4").disable()
                )
        )
        // gives message that sentence has no interpretation if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(1).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(3))
                .success(
                    getText("no_interpretation_filler_AT4").print()
                )
        )
        // changes scale labels to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(1).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(3))
                .success(
                    getScale("scaleQ2_filler_AT4")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // changes Q2 text to grey if 1-3 for Q1
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(1).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(3))
                .success(
                    getText("question2_filler_AT4")
                        .cssContainer({
                            "color":"#D3D3D3"
                        })
                )
        )
        // prints continue button if 1-3 for Q1:
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(1).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT4").print().wait()
                )
        )
    ,
    //if 4-7 is chosen for Q1
    getScale("scaleQ1_filler_AT4")
        // unselect Q2 response if they had previously selected a value
        //  this is useful if Q1 is chosen with 4-7 then Q2 is selected then Q1 is changed to different value of 4-7
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(7).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT4").unselect()  // deselects value requiring participants to reselect a value
                )
        )
        // enables Q2
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(7).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT4").enable().log()  // re-asserts to log the scale when redeciding yes! //CHECK what is being logged!!
                )
        )
        // removes continue button when 7 is first clicked
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(7).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(4))
                .success(
                    getButton("go_to_next_filler_AT4").remove()
                )
        )
    ,
    //if 4-7 for Q1
    getScale("scaleQ1_filler_AT4")
        // removes the no interpretation message
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(7).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(4))
                .success(
                    getText("no_interpretation_filler_AT4").remove()
                )
        )
        //changes scale labels back to black
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(7).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT4")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
        // changes Q2 text back to black
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(7).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(4))
                .success(
                    getText("question2_filler_AT4")
                        .cssContainer({
                            "color":"black"
                        })
                )
        )
    ,
    // prints continue button if Q1 is 1-3:
    getScale("scaleQ1_filler_AT4")
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(1).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(2))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(3))
                .success(
                    getButton("go_to_next_filler_AT4").print().wait()
                )
        )
    ,
    //prints continue button if checked 4-7 for Q1 and Q2 was selected
    getScale("scaleQ1_filler_AT4")
        .callback(getScale("scaleQ1_filler_AT4")
            .test.selected(7).or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(6))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(5))
                             .or(getScale("scaleQ1_filler_AT4").callback(getScale("scaleQ1_filler_AT4")).test.selected(4))
                .success(
                    getScale("scaleQ2_filler_AT4")
                        .callback(getScale("scaleQ2_filler_AT4")
                            .test.selected()
                                .success(
                                    getButton("go_to_next_filler_AT4").print().wait()
                                )
                        )
                )
        )
    ,
    // Message saying no interpretation if checked "no"
    newText("no_interpretation_filler_AT4", "La frase no es aceptable.")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px",
            "font-weight":"bold",
            "text-align":"center",
            "color":"#0039a6"
        })
    ,
    // Button to move to next trial
    newButton("go_to_next_filler_AT4", "Continuar") // must come after tests
        .cssContainer({"margin":"auto"})
        .wait()
);



// Attention check 4
newTrial("attention_check4",
    newText("ac4_question", "¿De qué temas trataba la frase anterior?")
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"20px",
            "text-align":"center"
        })
        .print()
    ,
    newScale("scale_attention_check4",
        "a. Olga, su madre y construir una casa.",
        "b. Guillermo, su abuela y cocinar comida juntos.",
        "c. Helena, su hermano y cantar.",
        "d. Claudia, su prima y dibujar."  // correct answer
        )
        .labelsPosition("right")
        .vertical()
        .log()
        .cssContainer({
            "margin":"auto",
            "margin-bottom":"20px",
            "font-size":"18px"
        })
        .print()
        .wait()
    ,
    newButton("continue_AT4", "Continuar")
        .cssContainer({"margin":"auto"})
        .print()
        .wait()
);


// Send results manually
SendResults("send");


//Explanation of the study: remember to include here the link to relink participants to Prolific
newTrial("completion_screen",
    newHtml("NR_explanation", "Spanish_NR_explanation.html") 
        .cssContainer({"line-height":"1.7em"})
        .cssContainer({"margin":"auto"})
        .print()
      ,
    newButton("void", "")
          .wait()
); 