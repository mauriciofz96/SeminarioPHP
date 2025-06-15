# SeminarioPHP. Flammini Mauricio, Martín Franco, Neves Hernán

- Backend
El comando composer require vlucas/phpdotenv se usó para instalar la librería phpdotenv, que sirve para cargar las variables de entorno desde el archivo .env en el proyecto PHP.
También se usó la librería Firebase, que debe instalarse con el comando composer require firebase/php-jwt. Esta libreria se utiliza para codificar/decodificar tokens web JSON.
Instalar ambos comandos desde la ruta del proyecto (por ejemplo desde C:\xampp\htdocs\ProyectoSeminario).

- Frontend
Para el registro de un nuevo usuario se creó un nuevo endpoint en el back con la lógica para chequear la existencia del nombre de usuario que se quiere crear. Este endpoint se creó porque, al tener que validar de manera independiente en el back y front los campos del formulario, se evidenció que no había un endpoint que específicamente chequeara si un usario dado ya está en la base de datos.
