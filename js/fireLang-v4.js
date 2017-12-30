/* Local Storage Controller */
var localStorageController = (function(window){

    return{
        
        createLocalStorage: function(localStorageKey, localStorageValue) {
            window.localStorage.setItem(localStorageKey, localStorageValue);
        },
        
        readsLocalStorage: function(localStorageKey) {
            return window.localStorage.getItem(localStorageKey);
        },

        deleteSpecificLocalStorage: function(localStorageKey) {
            localStorage.removeItem(localStorageKey);
        },

        deleteAllLocalStorage: function() {
            window.localStorage.clear();
        }
    }

}(window));

/* Cookie Controller */
var cookieController = (function(){

    // Create Cookie
    var createsCookie = function(cookieName, cookieValue, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = cookieName + "=" + cookieValue + expires + "; path=/";
    }

    return{
        
        createCookie: function(cookieName, cookieValue, days = 10) {
            createsCookie(cookieName, cookieValue, days);
        },
        
        readCookie: function(cookieName) {
            var nameEQ = cookieName + "=";
            var ca = document.cookie.split(';');
            for(var i=0;i < ca.length;i++) {
                var c = ca[i];
                while (c.charAt(0)==' ') c = c.substring(1,c.length);
                if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
            }
            return null;
        },

        eraseCookie: function(cookieName) {
            createsCookie(cookieName,"",-1);
        }
    }

}());

/* Firebase Controller */
var fireController = (function($, firebase) {
    // General Variables
    var Auth, auth, basePage, db, userExist, pageData;

    // Sets main variable
    basePage = "demoPruebasMiguel";

    // Object with firebase variables
    var fireLangVar = {
        fireKey: "AIzaSyCckVUzB0PiNtjPSpZMRfNFHVU8QeF0epc",
        fireDom: "firelang-01.firebaseapp.com",
        fireDBUrl: "https://firelang-01.firebaseio.com",
        fireSB: "firelang-01.appspot.com",
        langObj: []
    }

    // Default Obj
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

    var initFirebase = function() {
        firebase.initializeApp({
            apiKey: fireLangVar.fireKey,
            authDomain: fireLangVar.fireDom,
            databaseURL: fireLangVar.fireDBUrl,
            storageBucket: fireLangVar.fireSB,
        });

        db = firebase.database();
        Auth = firebase.auth(); 
        auth = null;
        pageData = db.ref(basePage);
    }

    var initNoConflicFirebase = function() {
        var fireLag = firebase.initializeApp({
            apiKey: fireLangVar.fireKey,
            authDomain: fireLangVar.fireDom,
            databaseURL: fireLangVar.fireDBUrl,
            storageBucket: fireLangVar.fireSB
        }, "fireLag");

        db = fireLag.database();
        Auth = fireLag.auth(); 
        auth = null;
        pageData = db.ref(basePage);
    }

    var checkLangObjUpdates = function() {
        let objC = { "en":{}, "es":{}};
        pageData.on('value', function(snapshot) {
            $.each(snapshot.val(), function(index, element) {
                objC[index] = element;
                fireLangVar.langObj = objC;
                runProximus();
            });
        });
    }

    var setFireDBObj = function(refIndex, newLangObject) {
        db.ref(refIndex).set(newLangObject);
    }

    return{
        
        initFireLangSingle: function() {
            initFirebase();
        },

        checkLangObjWithLogIn: function(func, lng = null) {
            // Get firebase obj and saves it
            let ObjC = { "en":{}, "es":{}};
            pageData.once('value', function(snapshot) {
                if (snapshot.exists() && userExist) {
                    $.each(snapshot.val(), function(index, element) {
                        ObjC[index] = element;
                    });
                    fireLangVar.langObj = ObjC;
                    func(fireLangVar.langObj, lng);
                }else if(userExist){
                    db.ref().update({[basePage] : creationObj});
                    if(!alert('No existia la base entonces la creamos! Nombre: ' + basePage)){window.location.reload();}
                }
            });
        },

        cheackLogIn: function(logOutRequired, logInRequierd, fillSelectOpt) {
            // Check if user is LogIn
            Auth.onAuthStateChanged(function(user) {
                // User is undefined if no user signed in
                window.user = user;
                if(user){
                    $(logOutRequired).hide();
                    $(logInRequierd).show();
                    userExist = true;
                    fillSelectOpt();
                }else{
                    $(logOutRequired).show();
                    $(logInRequierd).hide();
                    userExist = false;
                }
            });
        },

        logOut: function(labelModalID, funcLabel, msgModalID) {
            $(msgModalID).modal('show');
            firebase.auth().signOut().then(function() {
                // Sign-out successful.
                $(labelModalID).html(funcLabel('Success!', ['center', 'success']));
                setTimeout(function () {
                    $(msgModalID).modal('hide');
                }, 500);
            }, function(error) {
                // An error happened.
                console.error('SigOut Fail.', error);
                $(labelModalID).html(funcLabel('ERROR: '+error.code, ['danger']));
                setTimeout(function () {
                    $(msgModalID).modal('hide');
                }, 500);
            });
        },

        loginEmail: function(email, passw, labelModalID, funcLabel, msgModalID) {
            $(msgModalID).modal('show');
            firebase.auth().signInWithEmailAndPassword(email, passw)
            .then(function(authData) {
                // Sign-in successful.
                auth = authData;
                $(labelModalID).html(funcLabel('Success!', ['center', 'success']));
                setTimeout(function () {
                    $(msgModalID).modal('hide');
                }, 500);
            }).catch(function(error) {
                // An error happened.
                console.error('LogIn Fail.', error);
                $(labelModalID).html(funcLabel('ERROR: '+error.code, ['danger']));
                setTimeout(function () {
                    $(msgModalID).modal('hide');
                }, 500);
            });
        },

        addItemDB: function(keyVal, val){
            var refIndex = basePage + "/";
            Object.keys(fireLangVar.langObj).forEach(function (key) {
                db.ref(refIndex + key).update({[keyVal] : val});
            });
        },

        addLangDB: function(language){
            var newLangObject = [];
            Object.keys(fireLangVar.langObj.en).forEach(function (key) {
                newLangObject[key] = "xxx";
            });
            var refIndex = basePage + "/" + language;
            setFireDBObj(refIndex, newLangObject);
        },

        deleteLangDB: function(language) {
            var refIndex = basePage + "/" + language;
            db.ref(refIndex).remove();
        },

        deleteItemDB: function(itemDelete) {
            var refIndex = basePage + "/";
            Object.keys(fireLangVar.langObj).forEach(function (key) {
                db.ref(refIndex + key).child(itemDelete).remove();
            });
        },

        massCheckDeleteItemsDB: function(checkedBoxes) {
            var refIndex = basePage + "/";
            Object.keys(fireLangVar.langObj).forEach(function (key) {
                checkedBoxes.forEach(function(keyToDelete) {
                    Object.keys(fireLangVar.langObj[key]).forEach(function (keyOnObj) {
                        if (keyOnObj == keyToDelete) {
                            delete fireLangVar.langObj[key][keyToDelete];
                        }
                    });
                });
            });
            setFireDBObj(refIndex, fireLangVar.langObj);
        },

        massAddItemsDB: function(newObjItems) {
            var refIndex = basePage + "/";
            Object.keys(fireLangVar.langObj).forEach(function (key) {
                Object.assign(fireLangVar.langObj[key], newObjItems);
            });
            setFireDBObj(refIndex, fireLangVar.langObj);
        },

        updateDB: function(language, newObj){
            var refIndex = basePage + "/" + language;
            setFireDBObj(refIndex, newObj);
        },

        getBasePage: function() {
            return basePage;
        },

        getLangObj: function() {
            return fireLangVar.langObj;
        }

    }

}(jQuery, firebase));

/* UI Controller */
var UIController = (function($) {
    // Variables
    var lngSelected;

    // Html Clases/ID
    var DOMStrings = {
        titleForm: "#titleForm",
        authenticated: '.userAuth, .authenticated',
        unauthenticated: '.unauthenticated',
        modalAddLangID: '#addLangModal',
        inputAddLangID: '#newLang',
        btnAddLang: '#agregarLang',
        btnDeleteLang: '#btn-eliminarIdioma',
        modalAddKeyValID: '#addKeyValueModal',
        inputAddKeyID: '#newkey',
        inputAddValID: '#newValue',
        btnNewItem: '#agregarKeyValue',
        modalLoginID: '#loginModal',
        logInEmailInput: '#loginEmail',
        logInPassInput: '#loginPassword',
        btnLogIn: '#doLogin',
        modalMsgId: '#messageModal',
        modalMsgLabelID: '#messageModalLabel', 
        selectLang: '#selectLang',
        formContainer: '#formContainer',
        btnUploadContent: "#btnUpload",
        btnSigOut: '#signOut',
        modalDeleteID: '#deletMessaje',
        modalDeleteLabelID: '#borrarModalLabel',
        btnDelete: '.btn-eliminar',
        btnDeleteLangID: '#deleteLang',
        btnDeleteItemID: '#deleteitem',
        btnMassDeleteItems: '#btn-eliminarMuchosValores',
        modalMassDeleItemsID: '#massDeleteItems',
        localStorageObjItems: 'globalItems',
        btnAddAllLocalStorageItemsID: "#btnItems",
        modalAddAllLocalStorageItemsID: '#agregarItems'
    }
    
    var createSingleInput = function(key, keyValue) {
        // To avoid duplicates
        if ($('#' + key + ' :input[type=text]').length) {
            $('#' + key + ' :input[type=text]').val(keyValue);
        } else {
            // Creates Label for input
            var label = $("<label />", {
                addClass: 'col-form-label',
                id: key,
                append: [`${key}: `]
            });
            // Creates Input
            var input = $('<input />', {
                addClass: 'form-control',
                type: 'text',
                name: key,
                id: key,
                value: keyValue
            });
            // Creates Input checkbox
            var checkBoxInput = $('<input />', {
                type: 'checkbox',
                id: `${key}^-^checkBox`,
                'aria-label': 'Checkbox for following text input'
            });
            // Creates checkbox wrapper and puts checkbox inside
            var wrapperCheckBox = $('<span />', {
                addClass: 'input-group-addon',
                append: [checkBoxInput]
            });
            // Creates delete btn for Input
            var buttonInput = $('<button />', {
                addClass: 'btn btn-outline-danger',
                type: 'button',
                id: `${key}^-^btn`,
                onClick: 'fireLang.deleteCheck(this.id);',
                append: ['Borrar']
            });
            // Creates delete btn wrapper
            var wrapperBtn = $('<span />', {
                addClass: 'input-group-btn',
                append: [buttonInput]
            });
            // Creates wrapper for checkbox, Input, btn
            var divInput = $('<div />', {
                addClass: 'input-group',
                id: 'inputContainer',
                append: [wrapperCheckBox, input, wrapperBtn]
            });
            // Creates Main wrapper for label and input 
            $("<div />", {
                addClass: 'form-group col-md-6',
                id: key,
                append: [label, divInput],
                appendTo: DOMStrings.formContainer
            });
        }
    }

    var cleanId = function(id){
        // Returns text after '^-^'
        var deleteAfter = id.indexOf('^-^');
        idNew = id.substring(0, deleteAfter != -1 ? deleteAfter : id.length);
        return idNew;
    }

    var getSelectLanguage = function() {
        return $(DOM.selectLang).val();
    }

    var spanTextChange = function(textStr, textClasses) {
        var classNames = textClasses.map(c => 'text-'+c).join(' ');
        return `<span class="${classNames}"> ${textStr} </span>`;
    }

    var getAllCheckBoxes = function() {
        var chekedBox=[];
        $("input:checkbox").each(function(){
            var $this = $(this);
            if($this.is(":checked")){
                chekedBox.push(cleanId($this.attr("id")));
            }
        });
        return chekedBox;
    }

    return {

        spanText: function(textStr, textClasses) {
           return spanTextChange(textStr, textClasses);
        },

        fillSelect: function(langObj){
            // Variables
            var array, blankOption, firstRun;
            // Variables Declaration
            array = langObj;
            firstRun = true;
            blankOption = `<option disabled selected value> -- select an option -- </option>`;
            // Creates select options with first one disable
            $(DOMStrings.selectLang).html($.map(array, function (val, key) {
                if(firstRun){
                    firstRun = false;
                    return blankOption + `<option value="${key}"> ${key} </option>`;
                }
                return `<option value="${key}"> ${key} </option>`;
                
            }).join(''));
        },

        // Creates language especific inputs
        fillInputs: function(langObj, lng){
            $(DOMStrings.formContainer)[0].reset();
            var arr = langObj[lng];
            $.each(arr, function(key, value) {
                createSingleInput(key, value);
            });
        },

        getAllInputs: function() {
            var newLangObj = [];
            // Gets all inputs with there new value
            $(`form${DOMStrings.formContainer} :input[type=text]`).each(function(){
                var input = $(this);
                var key = input.attr('id');
                var keyValue = $(`#${key} :input[type=text]`).val();
                newLangObj[key] = keyValue;
            });
            return newLangObj;
        },

        getSelectLanguage: function() {
            return $(DOMStrings.selectLang).val();
        },

        addItemInput: function(key, value) {
            createSingleInput(key, value);
        },

        loadModalStart: function() {
            $(DOMStrings.modalMsgId).modal('show');
        },

        loadModalEnd: function() {
            $(DOMStrings.selectLang).val($(this).data('')).trigger('change');
            $(DOMStrings.formContainer).hide();
            setTimeout(function () {
               $(DOMStrings.modalMsgId).modal('hide');
            }, 500);
        },

        getAllCheckBox: function() {
            return getAllCheckBoxes();
        },

        massCheckDeleteItemsUI: function() {
            getAllCheckBoxes().forEach(function(key) {
                $(`#${key}`).remove();
            });
        },

        massAddItemsUI: function(newObjNewItems) {
            Object.keys(newObjNewItems).forEach(function (key, value) {
                createSingleInput(key, value);
            });
        },

        getcleanId: function(id) {
          return cleanId(id);  
        },

        getDOMStrings: function() {
            return DOMStrings;
        }
    }
    
}(jQuery));

/* Main Controller */
var fireLang = (function($, window, document, fireCtl, UICtrl, LSCtrl) {
    // Global Variables
    var DOM = UICtrl.getDOMStrings();
    
    var setupEventListeners = function(){
        // Set default text
        $(DOM.titleForm).text(`Editando: '${fireCtl.getBasePage()}'`);
        $(DOM.modalMsgLabelID).html(UICtrl.spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));

        // Btn Sigout
        $(DOM.btnSigOut).on('click', function (e) {
            e.preventDefault();
            fireCtl.logOut(DOM.modalMsgLabelID, UICtrl.spanText, DOM.modalMsgId);
        });
        // Btn Login
        $(DOM.btnLogIn).on('click', function (e) {
            e.preventDefault();
            // Hides Modal
            $(DOM.modalLoginID).modal('hide');
            // Check if valid user and pass
            if( $(DOM.logInEmailInput).val() != '' && $(DOM.logInPassInput).val() != '' ){
                var data = {
                    email: $(DOM.logInEmailInput).val(),
                    password: $(DOM.logInPassInput).val()
                };
                // Call function to validate
                fireCtl.loginEmail(data.email, data.password, DOM.modalMsgLabelID, UICtrl.spanText, DOM.modalMsgId);
            }
        });
        // Btn Upload to Data Base
        $(DOM.btnUploadContent).on('click',function(e) {
            e.preventDefault();
            UICtrl.loadModalStart();
            fireCtl.updateDB(UICtrl.getSelectLanguage(), UICtrl.getAllInputs());
            UICtrl.loadModalEnd();
        });
        // Btn add Item to Data Base
        $(DOM.btnNewItem).on('click', function (e) {
            e.preventDefault();
            $(DOM.modalAddKeyValID).modal('hide');
            if( $(DOM.inputAddKeyID).val() != '' && $(DOM.inputAddValID).val() != '' ){
                var key = $(DOM.inputAddKeyID).val();
                var val = $(DOM.inputAddValID).val();
                UICtrl.addItemInput(key, val);
                fireCtl.addItemDB(key, val);
            }else{
                // Si no se pudo conectar
                console.log("Error al subir la variable");
                $(DOM.modalMsgLabelID).html(UICtrl.spanText('ERROR: Error al subir la variable', ['danger']));
                UICtrl.loadModalStart();
            }
        });
        // Btn add Language to Data Base
        $(DOM.btnAddLang).on('click', function (e) {
            e.preventDefault();
            $(DOM.modalAddLangID).modal('hide');
            if( $(DOM.inputAddLangID).val() != '' ){
                var newLang = $(DOM.inputAddLangID).val();
                setTimeout(function () {
                    UICtrl.loadModalStart();
                    fireCtl.addLangDB(newLang);
                    fillSelectOpt();
                    UICtrl.loadModalEnd();
                }, 500);
            }else{
                $(DOM.modalMsgLabelID).html(UICtrl.spanText('ERROR: error al subir el idioma', ['danger']));
                UICtrl.loadModalStart();
            }
        });
        // Btn delete Language
        $(DOM.btnDeleteLang).on('click', function (e) {
            e.preventDefault();
            if(UICtrl.getSelectLanguage() != null && UICtrl.getSelectLanguage() != 'en' && UICtrl.getSelectLanguage() != 'es'){
                $(DOM.btnDelete).attr('id', UICtrl.getSelectLanguage());
                $(DOM.btnDelete).attr('onclick', 'fireLang.deleteCheck(this.id, true);');
                $(DOM.modalDeleteLabelID).html(UICtrl.spanText('Seguro que quieres Eliminar este idioma: ' + UICtrl.getSelectLanguage(), ['danger']));
                $(DOM.modalDeleteID).modal('show');
            }else{
                $(DOM.modalMsgLabelID).html(UICtrl.spanText('Error! Selecione un idioma valido.', ['center', 'warning']))
                UICtrl.loadModalStart();
            }

        });
        // Btn Mass Delete Items
        $(DOM.btnMassDeleteItems).on('click', function (e) {
            e.preventDefault();
            var allChecked = UICtrl.getAllCheckBox();
            if(allChecked.length > 0){
                fireCtl.massCheckDeleteItemsDB(allChecked);
                UICtrl.massCheckDeleteItemsUI();
                $(DOM.modalMassDeleItemsID).modal('hide');
            }else{
                $(DOM.modalMassDeleItemsID).modal('hide');
                $(DOM.modalMsgLabelID).html(UICtrl.spanText('Error! Selecione algun item...', ['center', 'warning']))
                $(DOM.modalMsgId).modal('show');
            }

        });
        // Btn add all Items
        $(DOM.btnAddAllLocalStorageItemsID).click(function(e) {
            e.preventDefault();
            $(DOM.modalAddAllLocalStorageItemsID).modal('hide');
            var newObjectLang = [];
            if (LSCtrl.readsLocalStorage(DOM.localStorageObjItems) != null) {
               Object.keys(JSON.parse(LSCtrl.readsLocalStorage(DOM.localStorageObjItems))).forEach(function (keyVal) {
                    newObjectLang[keyVal] = "xxx";
                });
                fireCtl.massAddItemsDB(newObjectLang);
                UICtrl.massAddItemsUI(newObjectLang);
            }else{
                $(DOM.modalMsgLabelID).html(UICtrl.spanText('Error! No se encontro ningun obj en el localstorage', ['center', 'warning']))
                $(DOM.modalMsgId).modal('show');
            }
        });
        // Select Change
        $(DOM.selectLang).change(function () {
            fireCtl.checkLangObjWithLogIn(UICtrl.fillInputs, UICtrl.getSelectLanguage());
            $(DOM.formContainer).show();
        });
        // On Hide Modal
        $(window).on('hidden.bs.modal', function () {
            $(DOM.inputLangID).val('').end();
            $(DOM.inputAddKeyID).val('').end();
        });
        
    }

    var fillSelectOpt = function() {
        UICtrl.loadModalStart();
        fireCtl.checkLangObjWithLogIn(UICtrl.fillSelect);
        UICtrl.loadModalEnd();
    }

    return{
        initEdit: function() {
            fireCtl.initFireLangSingle();
            fireCtl.cheackLogIn(DOM.authenticated, DOM.unauthenticated, fillSelectOpt);
            setupEventListeners();
        },

        deleteCheck: function(id, deleteLang) {
            if(!deleteLang && id.indexOf("^-^btn") == -1){
                $(`#${id}`).remove();
                fireCtl.deleteItemDB(id);
                $(DOM.modalDeleteID).modal('hide');
            }else if(deleteLang){
                fireCtl.deleteLangDB(id);
                $(DOM.modalDeleteID).modal('hide');
                fillSelectOpt();
            }else if(id.indexOf("^-^btn") >= 0){
                id = UICtrl.getcleanId(id);
                $(DOM.btnDelete).attr('id', id);
                $(DOM.btnDelete).attr('onclick', 'fireLang.deleteCheck(this.id);');
                $(DOM.modalDeleteLabelID).html(UICtrl.spanText('Seguro que quieres Eliminar la variable: ' + id, ['danger']));
                $(DOM.modalDeleteID).modal('show');
            }
        }
    }
    
}(jQuery, window, document, fireController, UIController, localStorageController));