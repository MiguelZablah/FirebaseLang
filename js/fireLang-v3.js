//Variable con la pagina que se va a editar
var basePage = "demoPruebasMiguel"; // Se crea en el html ahora

// Initialize Cloud FireBase for lang
firebase.initializeApp({
    apiKey: "AIzaSyCckVUzB0PiNtjPSpZMRfNFHVU8QeF0epc",
    authDomain: "firelang-01.firebaseapp.com",
    databaseURL: "https://firelang-01.firebaseio.com",
    storageBucket: "firelang-01.appspot.com"
});

// Iniciaizamos variables y creamos otras para el login
var db = firebase.database();
var Auth = firebase.auth(); 
var auth = null;

//Creacion de objeto Bundle
var bundle = { "en":{}, "es":{}};

//Actualizacion en momento real para el idioma en en objecto Bundle
var pageData = db.ref(basePage);

var startLiseting = function() {
    pageData.once('value', function(snapshot) {
        bundle = { "en":{}, "es":{}};
        if (snapshot.exists()) {
            $.each(snapshot.val(), function(index, element) {
                
                //Se agregan los elementos con su index
                bundle[index] = element;
                
                //Se modifican los inputs si es que cambian
                fillInputs(lngSelected); 
                //Se llena el select con los idiomas
                if(userExist){
                    modalActulizar();
                }
                fillSelect();
            });
        }else if(userExist){
            // Crea la base nueva en el firebase
            var creationObj = {
                ["en"] : {
                    ["homeButton"]: "xxx", 
                    ["backButton"]: "xxx",
                    ["downloadButton"]: "xxx"
                },
                ["es"] : {
                    ["homeButton"]: "xxx", 
                    ["backButton"]: "xxx",
                    ["downloadButton"]: "xxx"
                }
            };
            db.ref().update({[basePage] : creationObj});
            // Avisa al Usuario y recarga pagina
            if(!alert('No existia la base entonces la creamos! Nombre: ' + basePage)){window.location.reload();}
        }
    });
}
//Si el usuario ya existe se mantiene logIn
var userExist = false;
Auth.onAuthStateChanged(function(user) {
    window.user = user; // user is undefined if no user signed in
    if(user){
        //Desplega la informacion para el usuario existente
        $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
        //console.log("jalo?");
        userExist = true;
    }
});
startLiseting();

// Variables de nombre de idiomas en base de datos
var lngSelected;

$(document).ready(function() {

    //Te define base data que estas editando
    $("#titleForm").text("Editando: '"+basePage+"'");

    // Cuando se cierra y abre el modal se borra los inputs
    // Modal de agregar idioma
    $('#addLangModal').on('hidden.bs.modal', function () {
        // Cuando cierras el modal se limpia el input
        $('#newLang').val('').end();
    });
    // Modal de agregar key y value
    $('#addKeyValueModal').on('hidden.bs.modal', function () {
        // Cuando cierras el modal se limpia el input
        $('#newkey').val('').end();
    });

    // Cuando cambia el idioma selecionado cambia los inputs y la variable
    $('#selectLang').change(function () {
        lngSelected = $('#selectLang').val();
        fillInputs(lngSelected);
        $('#formContainer').show();
    });

    // Cuando le des click al btn se actuliza firebase
    $("#btnUpload").click(function(e) {
        e.preventDefault();
        
        // Se guarda el areglo de los inputs
        var NewBundle = getData();

        // Actulizar firebase 
        actulizarFirebase(lngSelected, NewBundle);
    });

    // Cuando le des click al btn se cargan todos items nuevos
    $("#btnItems").click(function(e) {
        e.preventDefault();
        
        // Se esconde el modal cuando le das click
        $('#agregarItems').modal('hide');

        // Se crea un nuevo objeto con el bundle viejo
        var newObjectLang = bundle;
        
        // Se agrega a cada idioma
        Object.keys(newObjectLang).forEach(function (key) {
            // Se agregan las variables al nuevo objeto 1 por 1
            Object.keys(allItems).forEach(function (keyVal) {
                // Se agregan las variables a cada idioma con el string por defult
                newObjectLang[key][keyVal] = "xxx";
            });
        });
        
        // Se actuliza firebase una ves que tengamos todas las nuevas variables agregadas
        Object.keys(newObjectLang).forEach(function (key) {
            // Se llama la funcion para actulizar la base de datos por idioma
            actulizarFirebase(key, newObjectLang[key]);
            //console.log(newObjectLang[key]);
        });

    });

    // Para cerrar secion
    $("#signOut").click(function(e) {
        e.preventDefault();

        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        }, function(error) {
            // An error happened.
        });
        
        // Redeciona a la pagina de login
        document.location.href="/home/getview/fireLang";
    });

    // Para iniciar seccion
    $('#doLogin').on('click', function (e) {
        e.preventDefault();

        // Se esconde el modal cuando le das click a login
        $('#loginModal').modal('hide');
        // Muestra el mensaje de si se pudo o no iniciar seccion
        $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
        $('#messageModal').modal('show');

        // Se valida que se ingreso informacion a el correo y pass
        if( $('#loginEmail').val() != '' && $('#loginPassword').val() != '' ){
            // Se almacena la infomarcion
            var data = {
                email: $('#loginEmail').val(),
                password: $('#loginPassword').val()
            };
            // Se manda a firebase para authenticarlo
            firebase.auth().signInWithEmailAndPassword(data.email, data.password)
                .then(function(authData) {
                // Si si se pudo conectar
                    // Se pone la variable de auth
                    auth = authData;
                    // Se muestra el mensaje de que si se pudo
                    $('#messageModalLabel').html(spanText('Success!', ['center', 'success']));
                    setTimeout(function () {
                        $('#messageModal').modal('hide');
                        // Ya existe una funcion que esta checando en tiempo real que si este en seccion
                    }, 500);
                    // Corre el real time Update
                    startLiseting();
                })
                .catch(function(error) {
                // Si no se pudo conectar
                    console.log("Login Failed!", error);
                    $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']));
                });
        }
    });

    // Para agregar idioma
    $('#agregarLang').on('click', function (e) {
        e.preventDefault();

        // Se esconde el modal cuando le das click
        $('#addLangModal').modal('hide');

        // Se valida que se ingreso informacion a el correo y pass
        if( $('#newLang').val() != '' ){
            // Se almacena la infomarcion
            var nuevoIdioma = $('#newLang').val();
            setTimeout(function () {
                // Se agregar el idioma y se copia la info de el de en
                agregarIdiomaFirebase(nuevoIdioma);
            }, 500);
        }else{
            // Si no se pudo conectar
            console.log("Error al subir el idioma");
            $('#messageModalLabel').html(spanText('ERROR: error al subir el idioma', ['danger']));
        }
    });

    // Para agregar Variable
    $('#agregarKeyValue').on('click', function (e) {
        e.preventDefault();

        // Se esconde el modal cuando le das click
        $('#addKeyValueModal').modal('hide');

        // Se valida que se ingreso informacion a el correo y pass
        if( $('#newkey').val() != '' && $('#newValue').val() != '' ){
            //se almacena la infomarcion
            var key = $('#newkey').val();
            var val = $('#newValue').val();
            setTimeout(function () {
                // Se agregar el idioma y se copia la info de el de en
                agregarVariableFirebase(key, val);
            }, 500);
        }else{
            // Si no se pudo conectar
            console.log("Error al subir la variable");
            $('#messageModalLabel').html(spanText('ERROR: Error al subir la variable', ['danger']));
        }
    });

    // Eliminar idioma selecionado
    $('#btn-eliminarIdioma').on('click', function (e) {
        e.preventDefault();

        // Si hay un idioma selecionado
        if(lngSelected != null){
        // Si si
            // Se corre la funcion para eliminar el idioma
            deleteModal(lngSelected, true);// El true es para decirle que si es un idioma
        }else{
        // Si no
            // Se manda un mensaje que tiene que selecionar un idioma
            $('#messageModalLabel').html(spanText('Error! Selecione un idioma...', ['center', 'warning']))
            $('#messageModal').modal('show');
        }

    });

    // Eliminar todos los checkbox selecionados
    $('#btn-eliminarMuchosValores').on('click', function (e) {
        e.preventDefault();

        // Objeto donde se guardan los items selecionados
        var chekedBox=[];

        // Se llena el checkbox
        $("input:checkbox").each(function(){
            var $this = $(this);

            if($this.is(":checked")){
                chekedBox.push($this.attr("id"));
            }
        });

        // Si hay un idioma selecionado
        if(chekedBox.length > 0){
        // Si si
            // Se manda a borrar todos los checkbox
            console.log("Si hay checked boxes");
            massdeleteElements(chekedBox);
        }else{
        // Si no
            // Se manda un mensaje que tiene que selecionar algun item
            $('#messageModalLabel').html(spanText('Error! Selecione una variable...', ['center', 'warning']))
            $('#messageModal').modal('show');
        }

    });

});

// object global de todos los items
var allItems;

//Carga los datos de local storage
$(document).ready(function() {
    //Si se modifico cuando se quita la pagina se guardan los cambios
    $(window).on("unload", saveObject);
    //Carga el objeto con todos los items
    loadObject();
});

//Funcion para cargar datos de local storage
function loadObject() {
    allItems = JSON.parse(localStorage.globalItems);
    //console.log(allItems);
}

//Funcion para guardar objecto a local storage
function saveObject() {
    localStorage.allItems = globalItems;
}


// Crea spans para desplegar mensajes
function spanText(textStr, textClasses) {
    var classNames = textClasses.map(c => 'text-'+c).join(' ');
    return '<span class="'+classNames+'">'+ textStr + '</span>';
}

// Llean el select con las opciones de idioma
function fillSelect(){

    // Se guarda el objeto en una nueva variable
    var array = bundle;
    // Variable para identificar la primera vuelta
    var firstRun = true;
    // Primer input para forzar al usaurio a selecionar una opcion
    var blankOption = '<option disabled selected value>' + '-- select an option --' + '</option>';
    // Se lee las primeras llaves del objecto bundle que en este caso son los idiomas
    $('#selectLang').html($.map(array, function (val, key) {
        // Se hace un if para agregar el input disable solo en la primera vuelta
        if(firstRun){
            firstRun = false;
            return blankOption + '<option value="' + key + '">' + key + '</option>';
        }
        return '<option value="' + key + '">' + key + '</option>';
        
    }).join(''));

}

// Funcion para mostrar actulizacion
function modalActulizar(){
    // Para cuando se actulize la base de datos sepas
    // Se muestra un modal
    $('#messageModal').modal('show');
    // Se pone un icono de carga
    $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
    // Borra todo el select
    $('#selectLang').find('option').remove().end();
    // Se esconde el form
    $('#formContainer').hide();

    // Empieza time out
    setTimeout(function () {
        // Se muestra el mensaje
        $('#messageModalLabel').html(spanText('Base de datos actulizada', ['center', 'success']));
        // Esconde el modal
        $('#messageModal').modal('hide');
    }, 800);// Fin Timeout
}

// Toma todos los input con su valor y los mete en un objecto
// Esto para luego actulizar la base de datos
function getData() {
    var newBundle = [];
    // Se va por todo el form tomando los valores
    $("form#formContainer :input[type=text]").each(function(){
        var input = $(this);
        var key = input.attr('id');
        var keyValue = $('#'+key+' :input[type=text]').val();
        newBundle[key] = keyValue;
    });

    return newBundle;
}

// Funcion para actulizacion el idioma de  firebase
function actulizarFirebase(language, newInfo){
    var refIndex = basePage + "/" + language;
    db.ref(refIndex)
    .set(newInfo);

    // Corre el real time Update
    startLiseting();
}

// Funcion para agregar un idioma al firebase
function agregarIdiomaFirebase(language){
    var newLangObject = [];
    // Recorre todas las llaves de objeto para cambiar su value a "xxx"
    Object.keys(bundle.en).forEach(function (key) {
        newLangObject[key] = "xxx";
    });

    // Crea el nuevo idioma con valor predeterminado de "xxx"
    var refIndex = basePage + "/" + language;
    db.ref(refIndex)
    .set(newLangObject);

    // Corre el real time Update
    startLiseting();
}

// Funcion para agregar elementos al firebase
function agregarVariableFirebase(keyVal, val){
    var refIndex = basePage + "/";
    // Recorre todas las llaves de firebase
    Object.keys(bundle).forEach(function (key) {
        db.ref(refIndex + key).update({[keyVal] : val});
    });
    
    // Corre el real time Update
    startLiseting();
}

// Funcion para borrar un elemento de firebase
function deleteElement(keyToDelete){
    // Se borra el input del form en el html
    $( "#"+keyToDelete ).remove();

    // Se borra el elemento de todos los idiomas en la base de datos
    borrarElemento(keyToDelete);

    // Se esconde el modale
    $('#deletMessaje').modal('hide');

    // Corre el real time Update
    startLiseting();
}

// Funcion para borrar muchos elemento de firebase
function massdeleteElements(objIDElemet){
    // Referencia a base de datos
    var refIndex = basePage + "/";
    
    // Se pasa por todos los elementos del objeto
    objIDElemet.forEach(function(el) {
        var keyToDelete = cleanId(el);
        $( "#"+keyToDelete ).remove();
        borrarElemento(keyToDelete);
    });

    // Se esconde el modale
    $('#massDeleteItems').modal('hide');

    // Corre el real time Update
    startLiseting();
}

// funcion borrar elmento por elemento
function borrarElemento(keyElement){
    var refIndex = basePage + "/";
    Object.keys(bundle).forEach(function (key) {
        db.ref(refIndex + key).child(keyElement).remove();

        // Lo borra local mente tambien para que sea mas rapido
        Object.keys(bundle[key]).forEach(function (key) {
            delete bundle[keyElement];
        });
    });
}

// Funcion para borrar un idioma de firebase
function deleteLang(language){
    // Se borra el idioma
    var refIndex = basePage + "/" + language;
    db.ref(refIndex).remove();

    // Se esconde el modale
    $('#deletMessaje').modal('hide');

    // Corre el real time Update
    startLiseting();
}

// Cambia los inputs por otros
function fillInputs(lng){

    // Borra todo el form
    $('#formContainer')[0].reset();

    // Pone en la variable la parte del objecto a generar
    var arr = bundle[lng];

    // Vuelvea a crear el form
    $.each(arr, function(key, value) {
        // LLama a la funcion para crear los inputs
        addInput(key, value);
    });
}

// Funcion abrir modal de advertencia antes de eliminar
function deleteModal(id, deleteLang){
    // Se checa si es un idoma o una variable
    if(!deleteLang){
    // Si es una variable
        // Se quita el ^-^btn
        id = cleanId(id);

        // Se agrega el id al modal de eliminar
        $(".btn-eliminar").attr('id', id);

        // Se agrega la funcion para borrar el 
        $(".btn-eliminar").attr('onclick', 'deleteElement(this.id);');
        
        // Se edita el mensaje
        $('#borrarModalLabel').html(spanText('Seguro que quieres Eliminar la variable: ' + id, ['danger']));

    }else if(deleteLang){
    // Si es un idioma
        // Se agrega el idioma como id
        $(".btn-eliminar").attr('id', id);

        // Se agrega la funcion para borrar el idioma al btn
        $(".btn-eliminar").attr('onclick', 'deleteLang(this.id);');
        
        // Se edita el mensaje
        $('#borrarModalLabel').html(spanText('Seguro que quieres Eliminar este idioma: ' + id, ['danger']));
    }

    // Se abre el modale
    $('#deletMessaje').modal('show');
}

// Limpia el id/key para poderse usar
function cleanId(id){
    // Se quita el '^-^' y lo demas
    var deleteAfter = id.indexOf('^-^');
    idNew = id.substring(0, deleteAfter != -1 ? deleteAfter : id.length);
    return idNew;
}

// Crea los inputs del form
function addInput(key, keyValue) {
    // Para la actulizacion en tiempo real de los inputs, evita tambien que se dupliquen
    if ($('#' + key + ' :input[type=text]').length) {
        $('#' + key + ' :input[type=text]').val(keyValue);
    } else {
        // Se crea la label
        var label = $("<label />", {
            addClass: "col-form-label",
            id: key,
            append: [key + ": "]
        });
        // Se cre el input
        var input = $('<input />', {
            addClass: "form-control",
            type: "text",
            name: key,
            id: key,
            value: keyValue
        });
        // se crea el checkbox que va dentro del input
        var checkBoxInput = $('<input />', {
            type: "checkbox",
            id: key + "^-^checkBox",
            'aria-label': "Checkbox for following text input"
        });
        // Se crea el wrapper del checkbox
        var spanCheckBox = $('<span />', {
            addClass: "input-group-addon",
            append: [checkBoxInput]
        });
        // Se crea el button que va dentro el input
        var buttonInput = $('<button />', {
            addClass: "btn btn-outline-danger",
            type: "button",
            id: key + "^-^btn",
            onClick: "deleteModal(this.id);",
            append: ["Borrar"]
        });
        // Se crea el wrapper del button
        var spanInput = $('<span />', {
            addClass: "input-group-btn",
            append: [buttonInput]
        });
        // Se crea el wrapper del input con el button
        var divInput = $('<div />', {
            addClass: "input-group",
            id: "inputContainer",
            append: [spanCheckBox, input, spanInput]
        });
        // Se crea el wrapper de todo el form group
        // y se agregar todo el contenido
        $("<div />", {
            addClass: "form-group col-md-6",
            id: key,
            append: [label, divInput],
            appendTo: "#formContainer"
        });
    }
}
