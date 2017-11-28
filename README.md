# Firebase Lang

Una pequeña interface para poder editar el objeto de idiomas que se utiliza en varias paginas.

## Por que todo junto?

Se hizo de esa manera para ser mas sencillo de implementar, se que no es la mejor practica pero en este momento es mas sencillo para mi hacerlo de esta manera.

Se planea separar todo y hacerlo de la manera correcta en un futuro.

## Edicion del firebase Lang

Se seguira agregadon/Editando cosas de este para un futuro.

Se planea agregar una version utilizando cloud firestore.


## Funciones Actuales

1. Editar texto por idioma
2. Agregar nuevo idioma
3. Eliminar idioma
4. Agregar nueva variable
5. Eliminar variable
6. Subir los datos en tiempo real a la pagina
7. Acceso solo para usuarios (Se utiliza correo y clave solamente), no se permite registrarte
8. Bottones de LogOut y LogIn

## Estructura de firebase
```javascript

{
    // Nombre de pagina
    // Utilizo esta llave para asignar objeto de idiomas por pagina
    "lang.com":
        // Variable del idioma Ingles
        {"en":
            {
                // Se define la variable con su texto correspondiente
                "Title1":"Title 1",
                "Title2":"Title 2",
                "Title3":"Title 3",
                "Title4":"Title 4",
                "Description1":"Description 1",
                "Description2":"Description 2",
                "Description3":"Description 3",
                "Description4":"Description 4",
                "Item1":"Item 1",
                "Item2":"Item 2",
                "Item3":"Item 3"
            },
        // Variable del Idioma Español
        "es":
            {
                "Title1":"Titulo 1",
                "Title2":"Titulo 2",
                "Title3":"Titulo 3",
                "Title4":"Titulo 4",
                "Description1":"Descripcion 1",
                "Description2":"Descripcion 2",
                "Description3":"Descripcion 3",
                "Description4":"Descripcion 4",
                "Item1":"Articulo 1",
                "Item2":"Articulo 2",
                "Item3":"Articulo 3"
            }
        }
}
```

## Proximamente

Se cambiara el idioma de los comentarios y README.md a ingles.

Se planea separar el codigo de manera correcta.

Actualmente la pagina se tiene que poner en duro, talves sea mejor practica poderlo cambiar?
